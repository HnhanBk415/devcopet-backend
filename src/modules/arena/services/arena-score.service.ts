import { Injectable } from '@nestjs/common';
import { ARENA_BASE_SCORE } from '../constants/arena.constants';
import type {
  ArenaRuntimePlayer,
  ArenaRuntimeQuestion,
  ArenaWinnerResult,
} from '../types/arena.types';

@Injectable()
export class ArenaScoreService {
  calculateQuestionScore(input: {
    isCorrect: boolean;
    question: ArenaRuntimeQuestion;
    remainingSeconds: number;
    currentStreak: number;
  }) {
    if (!input.isCorrect) {
      return {
        earnedScore: 0,
        nextStreak: 0,
      };
    }

    const nextStreak = input.currentStreak + 1;
    const streakBonus = Math.min(nextStreak * 10, 50);
    const baseScore =
      input.question.baseScore ?? ARENA_BASE_SCORE[input.question.difficulty];

    return {
      earnedScore: baseScore + input.remainingSeconds + streakBonus,
      nextStreak,
    };
  }

  getScoreboard(players: ArenaRuntimePlayer[]) {
    return players.map((player) => ({
      userId: player.userId,
      username: player.username,
      isBot: player.isBot,
      score: player.score,
      streak: player.streak,
      correctCount: player.correctCount,
      wrongCount: player.wrongCount,
      timeoutCount: player.timeoutCount,
      disconnected: player.disconnected,
    }));
  }

  decideWinner(players: ArenaRuntimePlayer[]): ArenaWinnerResult {
    const sorted = [...players].sort((a, b) => b.score - a.score);

    const first = sorted[0];
    const second = sorted[1];
    if (!first || !second || first.score === second.score) {
      return { isDraw: true };
    }

    return {
      winnerUserId: first.userId,
      isDraw: false,
    };
  }

  getAvgAnswerTime(player: ArenaRuntimePlayer) {
    if (player.answeredQuestionCount <= 0) return Number.MAX_SAFE_INTEGER;
    return Math.round(player.totalAnswerTimeMs / player.answeredQuestionCount);
  }
}
