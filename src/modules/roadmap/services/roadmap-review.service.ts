import { Injectable } from '@nestjs/common';
import type {
  AdvancedChallengeData,
  ChallengeOptionId,
  EasyChallengeData,
} from '../roadmap.types';
import {
  isChallengeOptionId,
  isStringRecord,
  toDeterministicCompletedAt,
} from '../utils/roadmap.util';

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

@Injectable()
export class RoadmapReviewService {
  toEasyFallbackReview(
    challenge: EasyChallengeData,
    nodeId: string,
  ): {
    selectedOptionId: ChallengeOptionId;
    correctOptionId: ChallengeOptionId;
    correct: boolean;
    explanation: string;
    completedAt: string;
  } {
    const selectedOptionId = challenge.correctOptionId;

    return {
      selectedOptionId,
      correctOptionId: challenge.correctOptionId,
      correct: selectedOptionId === challenge.correctOptionId,
      explanation: challenge.explanation,
      completedAt: toDeterministicCompletedAt(nodeId),
    };
  }

  toAdvancedFallbackReview(challenge: AdvancedChallengeData, nodeId: string) {
    const correctOptionId = getUnknownField(challenge, 'correctOptionId');

    if (
      typeof correctOptionId === 'string' &&
      isChallengeOptionId(correctOptionId)
    ) {
      return {
        selectedOptionId: correctOptionId,
        correctOptionId,
        correct: true,
        explanation: challenge.explanation,
        completedAt: toDeterministicCompletedAt(nodeId),
      };
    }

    const correctDropZoneMap = getUnknownField(challenge, 'correctDropZoneMap');

    if (isStringRecord(correctDropZoneMap)) {
      return {
        dropZoneMap: correctDropZoneMap,
        correctDropZoneMap,
        correct: true,
        explanation: challenge.explanation,
        completedAt: toDeterministicCompletedAt(nodeId),
      };
    }

    const correctMatchingMap =
      getUnknownField(challenge, 'correctMatchingMap') ??
      getUnknownField(challenge, 'correctMatching');

    if (isStringRecord(correctMatchingMap)) {
      return {
        matchingMap: correctMatchingMap,
        correctMatchingMap,
        correct: true,
        explanation: challenge.explanation,
        completedAt: toDeterministicCompletedAt(nodeId),
      };
    }

    const correctOrderedIds =
      getStringArrayField(challenge, 'correctOrderedIds') ??
      getStringArrayField(challenge, 'correctOrder');

    if (correctOrderedIds) {
      return {
        orderedIds: correctOrderedIds,
        correctOrderedIds,
        correct: true,
        explanation: challenge.explanation,
        completedAt: toDeterministicCompletedAt(nodeId),
      };
    }

    return {
      correct: true,
      explanation: challenge.explanation,
      completedAt: toDeterministicCompletedAt(nodeId),
    };
  }
}
