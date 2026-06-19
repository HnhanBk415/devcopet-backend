import { Injectable } from '@nestjs/common';
import type {
  AdvancedChallengeData,
  ChallengeOptionId,
  EasyChallengeData,
} from '../roadmap.types';
import { toDeterministicCompletedAt } from '../utils/roadmap.util';

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
    if (challenge.type === 'multiple_choice') {
      return {
        selectedOptionId: challenge.correctOptionId,
        correctOptionId: challenge.correctOptionId,
        correct: true,
        explanation: challenge.explanation,
        completedAt: toDeterministicCompletedAt(nodeId),
      };
    }

    return {
      dropZoneMap: challenge.correctDropZoneMap,
      correctDropZoneMap: challenge.correctDropZoneMap,
      correct: true,
      explanation: challenge.explanation,
      completedAt: toDeterministicCompletedAt(nodeId),
    };
  }
}
