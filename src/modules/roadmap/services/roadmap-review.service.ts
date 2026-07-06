import { Injectable } from '@nestjs/common';
import { PetPersonalizationService } from '../../personality-engine/pet-personalization.service';
import { ChallengeExplanationBuilderService } from './challenge-explanation-builder.service';
import type {
  AdvancedChallengeData,
  ChallengeOptionId,
  EasyChallengeData,
  RoadmapCompletion,
  RoadmapCompletionReview,
} from '../roadmap.types';
import { isChallengeOptionId, isStringRecord } from '../utils/roadmap.util';

function getUnknownField(source: AdvancedChallengeData, key: string): unknown {
  return (source as Record<string, unknown>)[key];
}

function getStringArrayField(
  source: AdvancedChallengeData,
  key: string,
): string[] | null {
  const value = getUnknownField(source, key);
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string')
  ) {
    return null;
  }

  return value;
}

function getChallengeOptions(source: AdvancedChallengeData) {
  const value = getUnknownField(source, 'options');
  if (
    !Array.isArray(value) ||
    !value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { text?: unknown }).text === 'string',
    )
  ) {
    return undefined;
  }

  return value as Array<{ id: ChallengeOptionId; text: string }>;
}

function toCompletedAt(value?: Date | null): string {
  return (value ?? new Date(0)).toISOString();
}

function isCompletionReview(value: unknown): value is RoadmapCompletionReview {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as RoadmapCompletionReview).correct === true &&
    typeof (value as RoadmapCompletionReview).explanation === 'string' &&
    typeof (value as RoadmapCompletionReview).completedAt === 'string'
  );
}

@Injectable()
export class RoadmapReviewService {
  constructor(
    private readonly personalization: PetPersonalizationService,
    private readonly explanationBuilder: ChallengeExplanationBuilderService,
  ) {}

  async toEasyReview(
    userId: string,
    challenge: EasyChallengeData,
    selectedOptionId: ChallengeOptionId,
    completedAt = new Date(),
  ): Promise<RoadmapCompletionReview> {
    const built = this.buildEasyExplanation(challenge, selectedOptionId);
    const personalized = await this.personalization.personalizeText({
      userId,
      baseText: built.explanation,
      fallbackText:
        'This works because it matches the key rule in the checkpoint.',
      context: {
        interactionType: 'challenge_correct',
        mode: 'easy',
        challengeType: challenge.type,
        topicTitle: challenge.title,
      },
    });

    return {
      selectedOptionId,
      correctOptionId: challenge.correctOptionId,
      correct: true,
      explanation: personalized.text,
      explanationSpeaker: personalized.speaker,
      explanationTone: personalized.tone,
      ...this.devMeta(personalized.meta),
      completedAt: completedAt.toISOString(),
    };
  }

  async toEasyCompletedReview(
    userId: string,
    challenge: EasyChallengeData,
    completion: RoadmapCompletion | null,
  ): Promise<RoadmapCompletionReview> {
    if (isCompletionReview(completion?.review)) {
      const built = this.buildEasyExplanation(
        challenge,
        completion.review.selectedOptionId ?? challenge.correctOptionId,
      );
      const personalized = await this.personalization.personalizeText({
        userId,
        baseText: built.explanation,
        fallbackText:
          'This works because it matches the key rule in the checkpoint.',
        context: {
          interactionType: 'challenge_review',
          mode: 'easy',
          challengeType: challenge.type,
          topicTitle: challenge.title,
        },
      });

      return {
        ...completion.review,
        explanation: personalized.text,
        explanationSpeaker: personalized.speaker,
        explanationTone: personalized.tone,
        ...this.devMeta(personalized.meta),
      };
    }

    return this.toEasyReview(
      userId,
      challenge,
      challenge.correctOptionId,
      completion?.completedAt ?? new Date(0),
    );
  }

  async toAdvancedOptionReview(
    userId: string,
    mode: 'medium' | 'hard',
    challenge: AdvancedChallengeData,
    selectedOptionId: ChallengeOptionId,
    correctOptionId: ChallengeOptionId,
    completedAt = new Date(),
  ): Promise<RoadmapCompletionReview> {
    const personalized = await this.personalizeAdvanced(
      userId,
      mode,
      challenge,
      'challenge_correct',
      { selectedOptionId, correctOptionId },
    );

    return {
      selectedOptionId,
      correctOptionId,
      correct: true,
      explanation: personalized.text,
      explanationSpeaker: personalized.speaker,
      explanationTone: personalized.tone,
      ...this.devMeta(personalized.meta),
      completedAt: completedAt.toISOString(),
    };
  }

  async toAdvancedDropZoneReview(
    userId: string,
    mode: 'medium' | 'hard',
    challenge: AdvancedChallengeData,
    dropZoneMap: Record<string, string>,
    correctDropZoneMap: Record<string, string>,
    completedAt = new Date(),
  ): Promise<RoadmapCompletionReview> {
    const personalized = await this.personalizeAdvanced(
      userId,
      mode,
      challenge,
      'challenge_correct',
      { correctAnswerText: this.formatMap(correctDropZoneMap) },
    );

    return {
      dropZoneMap,
      correctDropZoneMap,
      correct: true,
      explanation: personalized.text,
      explanationSpeaker: personalized.speaker,
      explanationTone: personalized.tone,
      ...this.devMeta(personalized.meta),
      completedAt: completedAt.toISOString(),
    };
  }

  async toAdvancedMatchingReview(
    userId: string,
    mode: 'medium' | 'hard',
    challenge: AdvancedChallengeData,
    matchingMap: Record<string, string>,
    correctMatchingMap: Record<string, string>,
    completedAt = new Date(),
  ): Promise<RoadmapCompletionReview> {
    const personalized = await this.personalizeAdvanced(
      userId,
      mode,
      challenge,
      'challenge_correct',
      { correctAnswerText: this.formatMap(correctMatchingMap) },
    );

    return {
      matchingMap,
      correctMatchingMap,
      correct: true,
      explanation: personalized.text,
      explanationSpeaker: personalized.speaker,
      explanationTone: personalized.tone,
      ...this.devMeta(personalized.meta),
      completedAt: completedAt.toISOString(),
    };
  }

  async toAdvancedOrderingReview(
    userId: string,
    mode: 'medium' | 'hard',
    challenge: AdvancedChallengeData,
    orderedIds: string[],
    correctOrderedIds: string[],
    completedAt = new Date(),
  ): Promise<RoadmapCompletionReview> {
    const personalized = await this.personalizeAdvanced(
      userId,
      mode,
      challenge,
      'challenge_correct',
      { correctAnswerText: correctOrderedIds.join(' -> ') },
    );

    return {
      orderedIds,
      correctOrderedIds,
      correct: true,
      explanation: personalized.text,
      explanationSpeaker: personalized.speaker,
      explanationTone: personalized.tone,
      ...this.devMeta(personalized.meta),
      completedAt: completedAt.toISOString(),
    };
  }

  async toAdvancedCompletedReview(
    userId: string,
    mode: 'medium' | 'hard',
    challenge: AdvancedChallengeData,
    completion: RoadmapCompletion | null,
  ): Promise<RoadmapCompletionReview> {
    if (isCompletionReview(completion?.review)) {
      const personalized = await this.personalizeAdvanced(
        userId,
        mode,
        challenge,
        'challenge_review',
      );

      return {
        ...completion.review,
        explanation: personalized.text,
        explanationSpeaker: personalized.speaker,
        explanationTone: personalized.tone,
        ...this.devMeta(personalized.meta),
      };
    }

    const completedAt = completion?.completedAt ?? new Date(0);
    const correctOptionId = getUnknownField(challenge, 'correctOptionId');

    if (
      typeof correctOptionId === 'string' &&
      isChallengeOptionId(correctOptionId)
    ) {
      return this.toAdvancedOptionReview(
        userId,
        mode,
        challenge,
        correctOptionId,
        correctOptionId,
        completedAt,
      );
    }

    const correctDropZoneMap = getUnknownField(challenge, 'correctDropZoneMap');

    if (isStringRecord(correctDropZoneMap)) {
      return this.toAdvancedDropZoneReview(
        userId,
        mode,
        challenge,
        correctDropZoneMap,
        correctDropZoneMap,
        completedAt,
      );
    }

    const correctMatchingMap =
      getUnknownField(challenge, 'correctMatchingMap') ??
      getUnknownField(challenge, 'correctMatching');

    if (isStringRecord(correctMatchingMap)) {
      return this.toAdvancedMatchingReview(
        userId,
        mode,
        challenge,
        correctMatchingMap,
        correctMatchingMap,
        completedAt,
      );
    }

    const correctOrderedIds =
      getStringArrayField(challenge, 'correctOrderedIds') ??
      getStringArrayField(challenge, 'correctOrder');

    if (correctOrderedIds) {
      return this.toAdvancedOrderingReview(
        userId,
        mode,
        challenge,
        correctOrderedIds,
        correctOrderedIds,
        completedAt,
      );
    }

    const personalized = await this.personalizeAdvanced(
      userId,
      mode,
      challenge,
      'challenge_review',
    );

    return {
      correct: true,
      explanation: personalized.text,
      explanationSpeaker: personalized.speaker,
      explanationTone: personalized.tone,
      ...this.devMeta(personalized.meta),
      completedAt: toCompletedAt(completion?.completedAt),
    };
  }

  private personalizeAdvanced(
    userId: string,
    mode: 'medium' | 'hard',
    challenge: AdvancedChallengeData,
    interactionType: 'challenge_correct' | 'challenge_review',
    answerContext?: {
      selectedOptionId?: ChallengeOptionId;
      correctOptionId?: ChallengeOptionId;
      correctAnswerText?: string;
    },
  ) {
    const built = this.buildAdvancedExplanation(mode, challenge, answerContext);
    return this.personalization.personalizeText({
      userId,
      baseText: built.explanation,
      fallbackText:
        'This works because it matches the key rule in the checkpoint.',
      context: {
        interactionType,
        mode,
        challengeType: challenge.type,
        topicTitle: challenge.title,
      },
    });
  }

  private buildEasyExplanation(
    challenge: EasyChallengeData,
    selectedOptionId?: ChallengeOptionId,
  ) {
    const correctOption = challenge.options.find(
      (option) => option.id === challenge.correctOptionId,
    );
    const selectedOption = selectedOptionId
      ? challenge.options.find((option) => option.id === selectedOptionId)
      : undefined;

    return this.explanationBuilder.build({
      mode: 'easy',
      challengeType: challenge.type,
      title: challenge.title,
      question: challenge.question,
      correctAnswerText: correctOption?.text,
      selectedAnswerText: selectedOption?.text,
      options: challenge.options,
      codeSnippet: challenge.codeSnippet,
      baseExplanation: challenge.explanation,
      topicTitle: challenge.lessonTitle,
    });
  }

  private buildAdvancedExplanation(
    mode: 'medium' | 'hard',
    challenge: AdvancedChallengeData,
    answerContext?: {
      selectedOptionId?: ChallengeOptionId;
      correctOptionId?: ChallengeOptionId;
      correctAnswerText?: string;
    },
  ) {
    const options = getChallengeOptions(challenge);
    const correctOption = options?.find(
      (option) => option.id === answerContext?.correctOptionId,
    );
    const selectedOption = options?.find(
      (option) => option.id === answerContext?.selectedOptionId,
    );
    const correctAnswerText =
      answerContext?.correctAnswerText ?? correctOption?.text;

    return this.explanationBuilder.build({
      mode,
      challengeType: challenge.type,
      title: challenge.title,
      question: challenge.question,
      correctAnswerText,
      selectedAnswerText: selectedOption?.text,
      options,
      codeSnippet: challenge.codeSnippet,
      baseExplanation: challenge.explanation,
    });
  }

  private formatMap(map: Record<string, string>) {
    return Object.entries(map)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  private devMeta(
    meta: unknown,
  ):
    | Pick<RoadmapCompletionReview, 'personalizationMeta'>
    | Record<string, never> {
    return process.env.NODE_ENV !== 'production' && meta
      ? { personalizationMeta: meta as Record<string, unknown> }
      : {};
  }
}
