import { Injectable } from '@nestjs/common';
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
  toEasyReview(
    challenge: EasyChallengeData,
    selectedOptionId: ChallengeOptionId,
    completedAt = new Date(),
  ): RoadmapCompletionReview {
    return {
      selectedOptionId,
      correctOptionId: challenge.correctOptionId,
      correct: true,
      explanation: challenge.explanation,
      completedAt: completedAt.toISOString(),
    };
  }

  toEasyCompletedReview(
    challenge: EasyChallengeData,
    completion: RoadmapCompletion | null,
  ): RoadmapCompletionReview {
    if (isCompletionReview(completion?.review)) {
      return completion.review;
    }

    return this.toEasyReview(
      challenge,
      challenge.correctOptionId,
      completion?.completedAt ?? new Date(0),
    );
  }

  toAdvancedOptionReview(
    challenge: AdvancedChallengeData,
    selectedOptionId: ChallengeOptionId,
    correctOptionId: ChallengeOptionId,
    completedAt = new Date(),
  ): RoadmapCompletionReview {
    return {
      selectedOptionId,
      correctOptionId,
      correct: true,
      explanation: challenge.explanation,
      completedAt: completedAt.toISOString(),
    };
  }

  toAdvancedDropZoneReview(
    challenge: AdvancedChallengeData,
    dropZoneMap: Record<string, string>,
    correctDropZoneMap: Record<string, string>,
    completedAt = new Date(),
  ): RoadmapCompletionReview {
    return {
      dropZoneMap,
      correctDropZoneMap,
      correct: true,
      explanation: challenge.explanation,
      completedAt: completedAt.toISOString(),
    };
  }

  toAdvancedMatchingReview(
    challenge: AdvancedChallengeData,
    matchingMap: Record<string, string>,
    correctMatchingMap: Record<string, string>,
    completedAt = new Date(),
  ): RoadmapCompletionReview {
    return {
      matchingMap,
      correctMatchingMap,
      correct: true,
      explanation: challenge.explanation,
      completedAt: completedAt.toISOString(),
    };
  }

  toAdvancedOrderingReview(
    challenge: AdvancedChallengeData,
    orderedIds: string[],
    correctOrderedIds: string[],
    completedAt = new Date(),
  ): RoadmapCompletionReview {
    return {
      orderedIds,
      correctOrderedIds,
      correct: true,
      explanation: challenge.explanation,
      completedAt: completedAt.toISOString(),
    };
  }

  toAdvancedCompletedReview(
    challenge: AdvancedChallengeData,
    completion: RoadmapCompletion | null,
  ): RoadmapCompletionReview {
    if (isCompletionReview(completion?.review)) {
      return completion.review;
    }

    const completedAt = completion?.completedAt ?? new Date(0);
    const correctOptionId = getUnknownField(challenge, 'correctOptionId');

    if (
      typeof correctOptionId === 'string' &&
      isChallengeOptionId(correctOptionId)
    ) {
      return this.toAdvancedOptionReview(
        challenge,
        correctOptionId,
        correctOptionId,
        completedAt,
      );
    }

    const correctDropZoneMap = getUnknownField(challenge, 'correctDropZoneMap');

    if (isStringRecord(correctDropZoneMap)) {
      return this.toAdvancedDropZoneReview(
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
        challenge,
        correctOrderedIds,
        correctOrderedIds,
        completedAt,
      );
    }

    return {
      correct: true,
      explanation: challenge.explanation,
      completedAt: toCompletedAt(completion?.completedAt),
    };
  }
}
