import { Injectable } from '@nestjs/common';
import {
  ARENA_BOT_ACCURACY,
  ARENA_BOT_BY_RANK,
  ARENA_BOT_DELAY_SECONDS,
} from '../constants/arena.constants';
import type {
  ArenaAnswerPayload,
  ArenaBotDifficulty,
  ArenaRank,
  ArenaRuntimePlayer,
  ArenaRuntimeQuestion,
} from '../types/arena.types';

@Injectable()
export class ArenaBotService {
  createBotForRank(rank: ArenaRank): ArenaRuntimePlayer {
    const botDifficulty = ARENA_BOT_BY_RANK[rank];
    const botNames: Record<ArenaBotDifficulty, string> = {
      easy: 'Arena Bot Rookie',
      medium: 'Arena Bot Scout',
      hard: 'Arena Bot Ace',
      elite: 'Arena Bot Elite',
    };

    return {
      userId: `bot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      username: botNames[botDifficulty],
      isBot: true,
      botDifficulty,
      arenaRank: rank,
      arenaRating: 1000,
      ratingBefore: 1000,
      ratingAfter: 1000,
      ratingDelta: 0,
      score: 0,
      streak: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
      totalAnswerTimeMs: 0,
      answeredQuestionCount: 0,
      answeredCurrentQuestion: false,
    };
  }

  getAnswerDelayMs(
    botDifficulty: ArenaBotDifficulty,
    timeLimitSeconds: number,
  ) {
    const delay = ARENA_BOT_DELAY_SECONDS[botDifficulty];
    const seconds = this.randomInt(delay.min, delay.max);
    return Math.min(seconds, Math.max(timeLimitSeconds - 1, 1)) * 1000;
  }

  generateAnswer(
    question: ArenaRuntimeQuestion,
    botDifficulty: ArenaBotDifficulty,
  ): ArenaAnswerPayload {
    const shouldBeCorrect = Math.random() <= ARENA_BOT_ACCURACY[botDifficulty];
    if (question.type === 'multiple_choice') {
      return this.generateMultipleChoiceAnswer(question, shouldBeCorrect);
    }

    return this.generateDragDropAnswer(question, shouldBeCorrect);
  }

  private generateMultipleChoiceAnswer(
    question: ArenaRuntimeQuestion,
    shouldBeCorrect: boolean,
  ) {
    if (shouldBeCorrect || !question.options?.length) {
      return { optionId: question.correctOptionId };
    }

    const wrongOptions = question.options.filter(
      (option) => option.id !== question.correctOptionId,
    );
    const picked =
      wrongOptions[this.randomInt(0, Math.max(wrongOptions.length - 1, 0))];
    return { optionId: picked?.id ?? question.correctOptionId };
  }

  private generateDragDropAnswer(
    question: ArenaRuntimeQuestion,
    shouldBeCorrect: boolean,
  ) {
    const correct = question.correctDropZoneMap ?? {};
    if (shouldBeCorrect) {
      return { dropZoneMap: { ...correct } };
    }

    const keys = Object.keys(correct);
    const values = Object.values(correct);
    if (keys.length < 2) {
      return { dropZoneMap: {} };
    }

    const wrong = { ...correct };
    const first = keys[0];
    const second = keys[1];
    wrong[first] = values[1];
    wrong[second] = values[0];
    return { dropZoneMap: wrong };
  }

  private randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
