import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoadmapService } from '../roadmap/roadmap.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  UserPersonality,
  UserPersonalityDocument,
} from '../onboarding/schemas/user-personality.schema';
import { GeminiProvider } from './providers/gemini.provider';
import { AiChatLogService } from './services/ai-chat-log.service';
import { AiChatPromptService } from './services/ai-chat-prompt.service';
import { AiChatUsageService } from './services/ai-chat-usage.service';
import type { AiPromptId, RoadmapMode } from './ai-chat.types';

@Injectable()
export class AiChatService {
  constructor(
    private readonly roadmapService: RoadmapService,
    private readonly geminiProvider: GeminiProvider,
    private readonly logService: AiChatLogService,
    private readonly promptService: AiChatPromptService,
    private readonly usageService: AiChatUsageService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserPersonality.name)
    private readonly personalityModel: Model<UserPersonalityDocument>,
  ) {}

  async getRoadmapPromptOptions(
    userId: string,
    mode: RoadmapMode,
    nodeId: string,
  ) {
    this.promptService.assertRoadmapMode(mode);

    const [user, context, usage] = await Promise.all([
      this.getUserOrThrow(userId),
      this.roadmapService.getAiRoadmapContext(mode, nodeId, userId),
      this.usageService.getUsageSnapshot(userId),
    ]);

    const dailyLimit = this.usageService.getDailyLimit(user.level);

    return {
      mode,
      node: context.node,
      relatedLesson: context.relatedLesson ?? null,
      usage: {
        used: usage.userUsed,
        dailyLimit,
        remaining: Math.max(dailyLimit - usage.userUsed, 0),
        globalRemaining: Math.max(usage.globalLimit - usage.globalUsed, 0),
        resetAt: this.usageService.getResetAtIso(),
      },
      prompts:
        context.node.status === 'locked'
          ? []
          : this.promptService.buildPromptOptions(context),
    };
  }

  async askRoadmapAi(
    userId: string,
    mode: RoadmapMode,
    nodeId: string,
    promptId: AiPromptId,
  ) {
    this.promptService.assertRoadmapMode(mode);
    this.promptService.assertPromptId(promptId);

    const user = await this.getUserOrThrow(userId);
    const context = await this.roadmapService.getAiRoadmapContext(
      mode,
      nodeId,
      userId,
    );

    if (context.node.status === 'locked') {
      throw new BadRequestException('Unlock this node before using AI help.');
    }

    this.usageService.acquirePendingAsk(userId);
    let usageReserved = false;

    try {
      await this.usageService.assertCooldown(userId);

      const dailyLimit = this.usageService.getDailyLimit(user.level);
      const globalLimit = this.usageService.getGlobalDailyLimit();
      await this.usageService.reserveUsage(userId, dailyLimit, globalLimit);
      usageReserved = true;

      const personality = await this.personalityModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .lean();
      const prompt = this.promptService.buildGeminiPrompt(
        context,
        promptId,
        personality?.dominantTraits ?? [],
      );
      const result = await this.geminiProvider.generate(prompt);

      if (!result.answer.trim()) {
        throw new ServiceUnavailableException(
          'AI helper returned an empty answer. Please try again.',
        );
      }

      await this.logSuccessSafely({
        userId,
        nodeId,
        mode,
        promptId,
        provider: 'gemini',
        model: result.model,
        answer: result.answer,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      });

      const usage = await this.usageService.getUsageSnapshot(userId);

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
          resetAt: this.usageService.getResetAtIso(),
        },
      };
    } catch (error) {
      if (usageReserved) {
        await this.refundUsageSafely(userId);
      }
      await this.logErrorSafely({
        userId,
        nodeId,
        mode,
        promptId,
        provider: 'gemini',
        model: this.geminiProvider.getModel(),
        error,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'AI helper is unavailable right now. Please try again later.',
      );
    } finally {
      this.usageService.releasePendingAsk(userId);
    }
  }

  async getUsageToday(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const usage = await this.usageService.getUsageSnapshot(userId);
    const dailyLimit = this.usageService.getDailyLimit(user.level);

    return {
      used: usage.userUsed,
      dailyLimit,
      remaining: Math.max(dailyLimit - usage.userUsed, 0),
      globalUsed: usage.globalUsed,
      globalLimit: usage.globalLimit,
      globalRemaining: Math.max(usage.globalLimit - usage.globalUsed, 0),
      resetAt: this.usageService.getResetAtIso(),
    };
  }

  private async logSuccessSafely(
    input: Parameters<AiChatLogService['logSuccess']>[0],
  ) {
    try {
      await this.logService.logSuccess(input);
    } catch {
      // Logging failure should not block a successful AI answer.
    }
  }

  private async logErrorSafely(
    input: Parameters<AiChatLogService['logError']>[0],
  ) {
    try {
      await this.logService.logError(input);
    } catch {
      // Preserve the original user-facing error if error logging fails.
    }
  }

  private async refundUsageSafely(userId: string) {
    try {
      await this.usageService.refundUsage(userId);
    } catch {
      // Keep provider/quota errors from being masked by refund failures.
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
}
