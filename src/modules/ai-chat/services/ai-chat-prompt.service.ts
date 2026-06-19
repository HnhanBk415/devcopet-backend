import { BadRequestException, Injectable } from '@nestjs/common';
import { AI_TONE_MAP } from '../constants/ai-tone-map';
import { PROMPT_OPTIONS } from '../constants/ai-prompt-options';
import type {
  AiPromptId,
  AiRoadmapContext,
  RoadmapMode,
  RoadmapPromptOption,
} from '../ai-chat.types';

@Injectable()
export class AiChatPromptService {
  assertRoadmapMode(mode: string): asserts mode is RoadmapMode {
    if (mode !== 'easy' && mode !== 'medium' && mode !== 'hard') {
      throw new BadRequestException('mode must be easy, medium, or hard.');
    }
  }

  assertPromptId(promptId: AiPromptId) {
    if (!PROMPT_OPTIONS[promptId]) {
      throw new BadRequestException('Invalid AI prompt id.');
    }
  }

  buildPromptOptions(context: AiRoadmapContext): RoadmapPromptOption[] {
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

  buildGeminiPrompt(
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

    return dominantTraits.map((trait) => AI_TONE_MAP[trait] ?? trait);
  }
}
