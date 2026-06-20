import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  ArenaAnswerPayload,
  ArenaRuntimeQuestion,
} from '../types/arena.types';

@Injectable()
export class ArenaQuestionEvaluatorService {
  evaluate(
    question: ArenaRuntimeQuestion,
    answer: ArenaAnswerPayload,
  ): boolean {
    if (question.type === 'multiple_choice') {
      if (!answer.optionId) {
        throw new BadRequestException('optionId is required.');
      }
      return answer.optionId === question.correctOptionId;
    }

    if (question.type === 'drag_drop') {
      if (!answer.dropZoneMap || typeof answer.dropZoneMap !== 'object') {
        throw new BadRequestException('dropZoneMap is required.');
      }
      return this.isSameMap(answer.dropZoneMap, question.correctDropZoneMap);
    }

    throw new BadRequestException('Unsupported arena question type.');
  }

  getCorrectAnswer(question: ArenaRuntimeQuestion) {
    if (question.type === 'multiple_choice') {
      return { optionId: question.correctOptionId };
    }

    return { dropZoneMap: question.correctDropZoneMap ?? {} };
  }

  private isSameMap(
    answer: Record<string, string>,
    correct?: Record<string, string>,
  ) {
    if (!correct) return false;

    const answerKeys = Object.keys(answer);
    const correctKeys = Object.keys(correct);
    if (answerKeys.length !== correctKeys.length) return false;

    return correctKeys.every((key) => answer[key] === correct[key]);
  }
}
