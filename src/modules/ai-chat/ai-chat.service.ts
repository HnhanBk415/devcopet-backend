import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoadmapService } from '../roadmap/roadmap.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  UserPersonality,
  UserPersonalityDocument,
} from '../onboarding/schemas/user-personality.schema';
import { AiChatLog, AiChatLogDocument } from './schemas/ai-chat-log.schema';
import {
  AiChatUsage,
  AiChatUsageDocument,
} from './schemas/ai-chat-usage.schema';
import type {
  AiPromptId,
  RoadmapMode,
  RoadmapPromptOption,
  AiRoadmapContext,
} from './ai-chat.types';

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
  error?: {
    message?: string;
  };
};

const PROMPT_OPTIONS: Record<AiPromptId, Omit<RoadmapPromptOption, 'label'>> = {
  EXPLAIN_NODE: {
    id: 'EXPLAIN_NODE',
    description: 'Review the key idea behind this node.',
  },
  SIMPLE_EXAMPLE: {
    id: 'SIMPLE_EXAMPLE',
    description: 'Show a small example connected to this node.',
  },
  COURSE_CONNECTION: {
    id: 'COURSE_CONNECTION',
    description: 'Connect this game node back to the course lesson.',
  },
  CHALLENGE_HINT: {
    id: 'CHALLENGE_HINT',
    description: 'Give a safe hint without revealing the answer.',
  },
  COMMON_MISTAKE: {
    id: 'COMMON_MISTAKE',
    description: 'Point out a common mistake for this node.',
  },
  NEXT_STEP: {
    id: 'NEXT_STEP',
    description: 'Suggest what to do after this node.',
  },
};

@Injectable()
export class AiChatService {
  private readonly pendingAskUserIds = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly roadmapService: RoadmapService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserPersonality.name)
    private readonly personalityModel: Model<UserPersonalityDocument>,
    @InjectModel(AiChatUsage.name)
    private readonly usageModel: Model<AiChatUsageDocument>,
    @InjectModel(AiChatLog.name)
    private readonly logModel: Model<AiChatLogDocument>,
  ) {}

  async getRoadmapPromptOptions(
    userId: string,
    mode: RoadmapMode,
    nodeId: string,
  ) {
    this.assertRoadmapMode(mode);

    const [user, context, usage] = await Promise.all([
      this.getUserOrThrow(userId),
      this.roadmapService.getAiRoadmapContext(mode, nodeId),
      this.getUsageSnapshot(userId),
    ]);

    const dailyLimit = this.getDailyLimit(user.level);

    return {
      mode,
      node: context.node,
      relatedLesson: context.relatedLesson ?? null,
      usage: {
        used: usage.userUsed,
        dailyLimit,
        remaining: Math.max(dailyLimit - usage.userUsed, 0),
        globalRemaining: Math.max(usage.globalLimit - usage.globalUsed, 0),
        resetAt: this.getResetAtIso(),
      },
      prompts:
        context.node.status === 'locked'
          ? []
          : this.buildPromptOptions(context),
    };
  }

  async askRoadmapAi(
    userId: string,
    mode: RoadmapMode,
    nodeId: string,
    promptId: AiPromptId,
  ) {
    this.assertRoadmapMode(mode);

    if (!PROMPT_OPTIONS[promptId]) {
      throw new BadRequestException('Invalid AI prompt id.');
    }

    const user = await this.getUserOrThrow(userId);
    const context = await this.roadmapService.getAiRoadmapContext(mode, nodeId);

    if (context.node.status === 'locked') {
      throw new BadRequestException('Unlock this node before using AI help.');
    }

    this.acquirePendingAsk(userId);
    let usageReserved = false;

    try {
      await this.assertCooldown(userId);

      const dailyLimit = this.getDailyLimit(user.level);
      const globalLimit = this.getGlobalDailyLimit();
      await this.reserveUsage(userId, dailyLimit, globalLimit);
      usageReserved = true;

      const model = this.getGeminiModel();
      const personality = await this.personalityModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .lean();
      const prompt = this.buildGeminiPrompt(
        context,
        promptId,
        personality?.dominantTraits ?? [],
      );
      const result = await this.callGemini(prompt.system, prompt.user);

      if (!result.answer.trim()) {
        throw new ServiceUnavailableException(
          'AI helper returned an empty answer. Please try again.',
        );
      }

      await this.logModel.create({
        userId: new Types.ObjectId(userId),
        nodeId,
        mode,
        promptId,
        provider: 'gemini',
        model,
        status: 'success',
        answer: result.answer,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      });

      const usage = await this.getUsageSnapshot(userId);

      return {
        answer: result.answer,
        promptId,
        mode,
        node: context.node,
        relatedLesson: context.relatedLesson ?? null,
        usage: {
          used: usage.userUsed,
          dailyLimit,
          remaining: Math.max(dailyLimit - usage.userUsed, 0),
          resetAt: this.getResetAtIso(),
        },
      };
    } catch (error) {
      const model = this.getGeminiModel();
      if (usageReserved) {
        await this.refundUsage(userId);
      }
      await this.logModel.create({
        userId: new Types.ObjectId(userId),
        nodeId,
        mode,
        promptId,
        provider: 'gemini',
        model,
        status: 'error',
        errorMessage:
          error instanceof Error ? error.message : 'Unknown AI provider error',
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'AI helper is unavailable right now. Please try again later.',
      );
    } finally {
      this.pendingAskUserIds.delete(userId);
    }
  }

  async getUsageToday(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const usage = await this.getUsageSnapshot(userId);
    const dailyLimit = this.getDailyLimit(user.level);

    return {
      used: usage.userUsed,
      dailyLimit,
      remaining: Math.max(dailyLimit - usage.userUsed, 0),
      globalUsed: usage.globalUsed,
      globalLimit: usage.globalLimit,
      globalRemaining: Math.max(usage.globalLimit - usage.globalUsed, 0),
      resetAt: this.getResetAtIso(),
    };
  }

  private buildPromptOptions(context: AiRoadmapContext): RoadmapPromptOption[] {
    return [
      {
        ...PROMPT_OPTIONS.EXPLAIN_NODE,
        label: `What should I remember from "${context.node.title}"?`,
      },
      {
        ...PROMPT_OPTIONS.SIMPLE_EXAMPLE,
        label: `Can you explain "${context.node.title}" with a simple example?`,
      },
      {
        ...PROMPT_OPTIONS.COURSE_CONNECTION,
        label: context.relatedLesson
          ? `How does this connect to "${context.relatedLesson.title}"?`
          : 'How does this connect to the course?',
      },
      {
        ...PROMPT_OPTIONS.CHALLENGE_HINT,
        label: 'Give me a hint without revealing the answer.',
      },
      {
        ...PROMPT_OPTIONS.COMMON_MISTAKE,
        label: 'What common mistake should I avoid here?',
      },
      {
        ...PROMPT_OPTIONS.NEXT_STEP,
        label: 'What should I do next after this node?',
      },
    ];
  }

  private assertRoadmapMode(mode: string): asserts mode is RoadmapMode {
    if (mode !== 'easy' && mode !== 'medium' && mode !== 'hard') {
      throw new BadRequestException('mode must be easy, medium, or hard.');
    }
  }

  private acquirePendingAsk(userId: string) {
    if (this.pendingAskUserIds.has(userId)) {
      throw new HttpException(
        {
          code: 'AI_REQUEST_IN_PROGRESS',
          message: 'Please wait for the current AI answer to finish.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.pendingAskUserIds.add(userId);
  }

  private buildGeminiPrompt(
    context: AiRoadmapContext,
    promptId: AiPromptId,
    dominantTraits: string[],
  ) {
    const completed = context.node.status === 'completed';
    const shouldUseStepByStepHint =
      context.mode !== 'easy' && promptId === 'CHALLENGE_HINT';
    const safeContext = {
      app: 'DevCopet',
      language: 'English',
      roadmapMode: context.mode,
      course: context.course,
      chapter: context.chapter ?? null,
      node: context.node,
      relatedLesson: context.relatedLesson ?? null,
      challenge: this.sanitizeChallenge(context.challenge, completed),
      review: completed ? (context.review ?? null) : null,
      userTone: this.describeTone(dominantTraits),
      requestedHelp: this.describePromptIntent(promptId),
      hintStyle: shouldUseStepByStepHint
        ? 'step-by-step reasoning hint for DSA or LeetCode-style problems'
        : 'short conceptual hint',
      answerPolicy: completed
        ? 'The node is completed. You may explain the solution and reasoning.'
        : 'The node is not completed. Do not reveal the correct answer, final solution, final code, or exact option to choose.',
    };

    const system = [
      'You are DevCopet AI Helper, a concise learning companion for roadmap game nodes.',
      'Reply in English.',
      'Only help with the current roadmap node, related lesson, or current challenge.',
      'Follow the requestedHelp field exactly. Do not answer as a challenge hint unless requestedHelp.intent is CHALLENGE_HINT.',
      'If the node is not completed, never reveal the correct answer, exact option, final solution, or final code.',
      'For Easy CHALLENGE_HINT, keep the hint simple and direct.',
      'For Medium or Hard CHALLENGE_HINT, use a step-by-step reasoning path for DSA or LeetCode-style thinking, but do not provide the final answer.',
      'Keep the answer short: 80 to 160 words.',
      'Use the user tone profile when shaping the explanation.',
      'End with one concrete next action.',
    ].join('\n');

    const user = [
      `Prompt intent: ${promptId}`,
      'Roadmap context JSON:',
      JSON.stringify(safeContext, null, 2),
    ].join('\n\n');

    return { system, user };
  }

  private describePromptIntent(promptId: AiPromptId) {
    const intents: Record<
      AiPromptId,
      {
        intent: AiPromptId;
        instruction: string;
      }
    > = {
      EXPLAIN_NODE: {
        intent: 'EXPLAIN_NODE',
        instruction:
          'Explain the main concept of this node. Focus on what the learner should understand, not on solving the challenge.',
      },
      SIMPLE_EXAMPLE: {
        intent: 'SIMPLE_EXAMPLE',
        instruction:
          'Give one small example related to the node concept. Keep it separate from the exact challenge answer.',
      },
      COURSE_CONNECTION: {
        intent: 'COURSE_CONNECTION',
        instruction:
          'Explain how this roadmap node connects to the related course lesson, and mention the lesson as a review path.',
      },
      CHALLENGE_HINT: {
        intent: 'CHALLENGE_HINT',
        instruction:
          'Give a safe hint for the current challenge without revealing the correct answer, exact option, final code, or final solution.',
      },
      COMMON_MISTAKE: {
        intent: 'COMMON_MISTAKE',
        instruction:
          'Describe one common mistake learners make in this node and how to avoid it. Do not solve the challenge directly.',
      },
      NEXT_STEP: {
        intent: 'NEXT_STEP',
        instruction:
          'Suggest what the learner should do next after this node: review, retry, continue, or practice. Do not give a challenge hint unless it is necessary.',
      },
    };

    return intents[promptId];
  }

  private sanitizeChallenge(
    challenge: AiRoadmapContext['challenge'],
    completed: boolean,
  ) {
    if (!challenge) return null;
    if (completed) return challenge;

    return {
      id: challenge.id,
      type: challenge.type,
      title: challenge.title,
      question: challenge.question,
      promptType: challenge.promptType,
      codeSnippet: challenge.codeSnippet,
      options: challenge.options?.map((option) => ({
        id: option.id,
        text: option.text,
      })),
      template: challenge.template,
      poolItems: challenge.poolItems?.map((item) => ({
        id: item.id,
        text: item.text,
      })),
      estimatedMinutes: challenge.estimatedMinutes,
      xp: challenge.xp,
    };
  }

  private describeTone(dominantTraits: string[]) {
    if (dominantTraits.length === 0) {
      return ['friendly', 'clear', 'beginner-friendly'];
    }

    const toneMap: Record<string, string> = {
      analytical: 'explain with clear logic and steps',
      creative: 'use vivid examples when useful',
      disciplined: 'finish with a practical checklist-style action',
      independent: 'guide with hints instead of over-explaining',
      empathetic: 'be warm and encouraging',
      competitive: 'make the task feel like a small challenge',
      adaptable: 'offer a flexible way to think about the problem',
      curious: 'include one small exploration question',
    };

    return dominantTraits.map((trait) => toneMap[trait] ?? trait);
  }

  private async callGemini(system: string, user: string) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY is not configured.',
      );
    }

    const model = this.getGeminiModel();
    const maxOutputTokens = this.getMaxOutputTokens();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.getGeminiTimeoutMs(),
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: user }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            maxOutputTokens,
          },
        }),
      });

      const data = (await response.json()) as GeminiResponse;
      if (!response.ok) {
        throw new ServiceUnavailableException(
          data.error?.message ?? 'Gemini API request failed.',
        );
      }

      const answer =
        data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? '')
          .join('')
          .trim() ?? '';

      return {
        answer,
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException('Gemini API request timed out.');
      }

      throw new ServiceUnavailableException(
        error instanceof Error ? error.message : 'Gemini API request failed.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async getUserOrThrow(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user.');
    }

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return user;
  }

  private getDailyLimit(level: number) {
    if (level >= 10) return this.getNumberEnv('AI_LEVEL_10_DAILY_LIMIT', 7);
    if (level >= 5) return this.getNumberEnv('AI_LEVEL_5_DAILY_LIMIT', 5);
    return this.getNumberEnv('AI_BASE_DAILY_LIMIT', 3);
  }

  private getGlobalDailyLimit() {
    return this.getNumberEnv('AI_GLOBAL_DAILY_LIMIT', 500);
  }

  private getMaxOutputTokens() {
    return this.getNumberEnv('AI_MAX_OUTPUT_TOKENS', 300);
  }

  private getGeminiTimeoutMs() {
    return this.getNumberEnv('AI_GEMINI_TIMEOUT_MS', 15000);
  }

  private getGeminiModel() {
    return (
      this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash-lite'
    );
  }

  private getNumberEnv(key: string, fallback: number) {
    const raw = this.configService.get<string>(key);
    const parsed = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async getUsageSnapshot(userId: string) {
    const dateKey = this.getDateKey();
    const [userUsage, globalUsage] = await Promise.all([
      this.usageModel.findOne({
        scope: 'user',
        userId: new Types.ObjectId(userId),
        dateKey,
      }),
      this.usageModel.findOne({
        scope: 'global',
        userId: null,
        dateKey,
      }),
    ]);

    return {
      userUsed: userUsage?.usedCount ?? 0,
      globalUsed: globalUsage?.usedCount ?? 0,
      globalLimit: globalUsage?.dailyLimit ?? this.getGlobalDailyLimit(),
    };
  }

  private async reserveUsage(
    userId: string,
    dailyLimit: number,
    globalLimit: number,
  ) {
    const dateKey = this.getDateKey();
    const userObjectId = new Types.ObjectId(userId);

    await Promise.all([
      this.usageModel.updateOne(
        { scope: 'user', userId: userObjectId, dateKey },
        {
          $setOnInsert: {
            scope: 'user',
            userId: userObjectId,
            dateKey,
            usedCount: 0,
          },
          $set: { dailyLimit },
        },
        { upsert: true },
      ),
      this.usageModel.updateOne(
        { scope: 'global', userId: null, dateKey },
        {
          $setOnInsert: {
            scope: 'global',
            userId: null,
            dateKey,
            usedCount: 0,
          },
          $set: { dailyLimit: globalLimit },
        },
        { upsert: true },
      ),
    ]);

    const userReservation = await this.usageModel.findOneAndUpdate(
      {
        scope: 'user',
        userId: userObjectId,
        dateKey,
        usedCount: { $lt: dailyLimit },
      },
      {
        $set: { dailyLimit },
        $inc: { usedCount: 1 },
      },
      { new: true },
    );

    if (!userReservation) {
      const userUsage = await this.usageModel.findOne({
        scope: 'user',
        userId: userObjectId,
        dateKey,
      });

      throw new HttpException(
        {
          code: 'DAILY_LIMIT_REACHED',
          message: 'You have used all AI helps for today.',
          dailyLimit,
          used: userUsage?.usedCount ?? dailyLimit,
          remaining: 0,
          resetAt: this.getResetAtIso(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const globalReservation = await this.usageModel.findOneAndUpdate(
      {
        scope: 'global',
        userId: null,
        dateKey,
        usedCount: { $lt: globalLimit },
      },
      {
        $set: { dailyLimit: globalLimit },
        $inc: { usedCount: 1 },
      },
      { new: true },
    );

    if (!globalReservation) {
      await this.refundUserUsage(userId);

      throw new HttpException(
        {
          code: 'AI_GLOBAL_LIMIT_REACHED',
          message: 'AI helper is resting for today. Please try again tomorrow.',
          globalLimit,
          resetAt: this.getResetAtIso(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async refundUsage(userId: string) {
    await Promise.all([this.refundUserUsage(userId), this.refundGlobalUsage()]);
  }

  private async refundUserUsage(userId: string) {
    const dateKey = this.getDateKey();
    await this.usageModel.updateOne(
      {
        scope: 'user',
        userId: new Types.ObjectId(userId),
        dateKey,
        usedCount: { $gt: 0 },
      },
      { $inc: { usedCount: -1 } },
    );
  }

  private async refundGlobalUsage() {
    const dateKey = this.getDateKey();
    await this.usageModel.updateOne(
      {
        scope: 'global',
        userId: null,
        dateKey,
        usedCount: { $gt: 0 },
      },
      { $inc: { usedCount: -1 } },
    );
  }

  private async assertCooldown(userId: string) {
    const seconds = this.getNumberEnv('AI_COOLDOWN_SECONDS', 5);
    const since = new Date(Date.now() - seconds * 1000);
    const recentLog = await this.logModel.findOne({
      userId: new Types.ObjectId(userId),
      status: 'success',
      createdAt: { $gte: since },
    });

    if (recentLog) {
      throw new HttpException(
        {
          code: 'AI_COOLDOWN',
          message: 'Please wait a few seconds before asking again.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private getDateKey() {
    const vietnamTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return vietnamTime.toISOString().slice(0, 10);
  }

  private getResetAtIso() {
    const [year, month, day] = this.getDateKey().split('-').map(Number);
    const nextDayUtc = Date.UTC(year, month - 1, day + 1, -7, 0, 0);
    return new Date(nextDayUtc).toISOString();
  }
}
