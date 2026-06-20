import { Types } from 'mongoose';
import {
  ArenaMatchmakingService,
  ArenaQueueEntry,
} from './arena-matchmaking.service';
import { ArenaQuestionEvaluatorService } from './arena-question-evaluator.service';
import { ArenaQuestionService } from './arena-question.service';
import { ArenaRatingService } from './arena-rating.service';
import { ArenaScoreService } from './arena-score.service';
import type {
  ArenaRank,
  ArenaRuntimePlayer,
  ArenaRuntimeQuestion,
} from '../types/arena.types';

describe('Arena core services', () => {
  describe('rank calculation', () => {
    const service = new ArenaRatingService({} as never);

    it.each([
      [1000, 'Beginner'],
      [1200, 'Fresher'],
      [1500, 'Senior'],
      [1900, 'Expert'],
    ])('maps %i to %s', (rating, rank) => {
      expect(service.getRankForRating(rating)).toBe(rank);
    });

    it('does not rank Beginner up before 10 matches even if rating is high enough', () => {
      expect(
        service.canRankUp({
          rank: 'Beginner',
          rating: 1200,
          matchesInCurrentRank: 9,
        }),
      ).toBe(false);
    });

    it('ranks Beginner up when rating and match count are enough', () => {
      expect(
        service.canRankUp({
          rank: 'Beginner',
          rating: 1200,
          matchesInCurrentRank: 10,
        }),
      ).toBe(true);
    });

    it('requires 15 Fresher matches and 20 Senior matches', () => {
      expect(
        service.canRankUp({
          rank: 'Fresher',
          rating: 1500,
          matchesInCurrentRank: 14,
        }),
      ).toBe(false);
      expect(
        service.canRankUp({
          rank: 'Fresher',
          rating: 1500,
          matchesInCurrentRank: 15,
        }),
      ).toBe(true);
      expect(
        service.canRankUp({
          rank: 'Senior',
          rating: 1900,
          matchesInCurrentRank: 19,
        }),
      ).toBe(false);
      expect(
        service.canRankUp({
          rank: 'Senior',
          rating: 1900,
          matchesInCurrentRank: 20,
        }),
      ).toBe(true);
    });
  });

  describe('matchmaking', () => {
    const service = new ArenaMatchmakingService({} as never);
    const now = Date.now();

    const entry = (overrides: Partial<ArenaQueueEntry>): ArenaQueueEntry => ({
      userId: overrides.userId ?? 'user-a',
      socketId: overrides.socketId ?? 'socket-a',
      username: overrides.username ?? 'A',
      arenaRank: overrides.arenaRank ?? 'Beginner',
      arenaRating: overrides.arenaRating ?? 1000,
      courseSlug: overrides.courseSlug ?? 'python-basic',
      mode: overrides.mode ?? 'ranked',
      queuedAt: overrides.queuedAt ?? now,
    });

    it('keeps matchmaking enqueue idempotent for an existing queued user', async () => {
      const userModel = {
        findById: jest.fn().mockReturnValue({
          lean: () => ({
            exec: () =>
              Promise.resolve({
                username: 'A',
                arenaRank: 'Beginner',
                arenaRating: 1000,
              }),
          }),
        }),
      };
      const queueService = new ArenaMatchmakingService(userModel as never);

      const first = await queueService.enqueue({
        userId: 'user-a',
        socketId: 'socket-a',
        courseSlug: 'python-basic',
        mode: 'ranked',
      });
      const second = await queueService.enqueue({
        userId: 'user-a',
        socketId: 'socket-b',
        courseSlug: 'python-basic',
        mode: 'ranked',
      });

      expect(second).toBe(first);
      expect(second.socketId).toBe('socket-b');
      expect(userModel.findById).toHaveBeenCalledTimes(1);
    });
    it('matches same rank with rating diff 100 under 10 seconds', () => {
      expect(
        service.canMatch(
          entry({ arenaRating: 1000 }),
          entry({ userId: 'user-b', arenaRating: 1100 }),
          now + 9000,
        ),
      ).toBe(true);
    });

    it('does not match same rank diff 200 under 10 seconds but can after 10 seconds', () => {
      const a = entry({ arenaRating: 1000 });
      const b = entry({ userId: 'user-b', arenaRating: 1200 });
      expect(service.canMatch(a, b, now + 9000)).toBe(false);
      expect(service.canMatch(a, b, now + 10000)).toBe(true);
    });

    it('does not match rank diff 2', () => {
      expect(
        service.canMatch(
          entry({ arenaRank: 'Beginner' }),
          entry({ userId: 'user-b', arenaRank: 'Senior' }),
          now + 25000,
        ),
      ).toBe(false);
    });

    it('matches rank diff 1 and rating diff <= 400 after 20 seconds', () => {
      expect(
        service.canMatch(
          entry({ arenaRank: 'Beginner', arenaRating: 1000 }),
          entry({ userId: 'user-b', arenaRank: 'Fresher', arenaRating: 1400 }),
          now + 20000,
        ),
      ).toBe(true);
    });
  });

  describe('question mix', () => {
    const service = new ArenaQuestionService({} as never, {} as never);

    it.each<[ArenaRank, number, number, number]>([
      ['Beginner', 4, 1, 0],
      ['Fresher', 2, 2, 1],
      ['Senior', 1, 2, 2],
      ['Expert', 0, 2, 3],
    ])('returns expected mix for %s', (rank, easy, medium, hard) => {
      expect(service.getQuestionMix(rank)).toEqual({ easy, medium, hard });
    });
  });

  describe('score and winner', () => {
    const service = new ArenaScoreService();
    const question = runtimeQuestion({ difficulty: 'easy' });

    it('scores correct easy with 15 seconds and next streak 2 as 55', () => {
      expect(
        service.calculateQuestionScore({
          isCorrect: true,
          question,
          remainingSeconds: 15,
          currentStreak: 1,
        }),
      ).toEqual({ earnedScore: 55, nextStreak: 2 });
    });

    it('returns zero score and resets streak when wrong', () => {
      expect(
        service.calculateQuestionScore({
          isCorrect: false,
          question,
          remainingSeconds: 15,
          currentStreak: 4,
        }),
      ).toEqual({ earnedScore: 0, nextStreak: 0 });
    });

    it('caps streak bonus at 50', () => {
      expect(
        service.calculateQuestionScore({
          isCorrect: true,
          question,
          remainingSeconds: 0,
          currentStreak: 10,
        }).earnedScore,
      ).toBe(70);
    });

    it('decides winner by score, correct count, average answer time, then draw', () => {
      expect(
        service.decideWinner([
          runtimePlayer({ userId: 'a', score: 10 }),
          runtimePlayer({ userId: 'b', score: 5 }),
        ]).winnerUserId,
      ).toBe('a');

      expect(
        service.decideWinner([
          runtimePlayer({ userId: 'a', score: 10, correctCount: 1 }),
          runtimePlayer({ userId: 'b', score: 10, correctCount: 2 }),
        ]).winnerUserId,
      ).toBe('b');

      expect(
        service.decideWinner([
          runtimePlayer({
            userId: 'a',
            score: 10,
            correctCount: 2,
            totalAnswerTimeMs: 2000,
            answeredQuestionCount: 1,
          }),
          runtimePlayer({
            userId: 'b',
            score: 10,
            correctCount: 2,
            totalAnswerTimeMs: 1000,
            answeredQuestionCount: 1,
          }),
        ]).winnerUserId,
      ).toBe('b');

      expect(
        service.decideWinner([
          runtimePlayer({
            userId: 'a',
            score: 10,
            correctCount: 2,
            totalAnswerTimeMs: 1000,
            answeredQuestionCount: 1,
          }),
          runtimePlayer({
            userId: 'b',
            score: 10,
            correctCount: 2,
            totalAnswerTimeMs: 1000,
            answeredQuestionCount: 1,
          }),
        ]).isDraw,
      ).toBe(true);
    });
  });

  describe('evaluator', () => {
    const service = new ArenaQuestionEvaluatorService();

    it('evaluates multiple choice correct and wrong', () => {
      const question = runtimeQuestion({
        type: 'multiple_choice',
        correctOptionId: 'A',
      });
      expect(service.evaluate(question, { optionId: 'A' })).toBe(true);
      expect(service.evaluate(question, { optionId: 'B' })).toBe(false);
    });

    it('evaluates drag drop exact match and mismatch', () => {
      const question = runtimeQuestion({
        type: 'drag_drop',
        correctDropZoneMap: { one: 'A', two: 'B' },
      });
      expect(
        service.evaluate(question, { dropZoneMap: { one: 'A', two: 'B' } }),
      ).toBe(true);
      expect(
        service.evaluate(question, { dropZoneMap: { one: 'A', two: 'C' } }),
      ).toBe(false);
    });
  });
});

function runtimeQuestion(
  overrides: Partial<ArenaRuntimeQuestion>,
): ArenaRuntimeQuestion {
  const id = new Types.ObjectId();
  return {
    id: String(id),
    objectId: id,
    courseSlug: 'python-basic',
    difficulty: 'easy',
    chapterOrder: 1,
    title: 'Question',
    question: 'Question?',
    type: 'multiple_choice',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
    ],
    correctOptionId: 'A',
    poolItems: [],
    correctDropZoneMap: {},
    explanation: 'Because.',
    conceptTags: [],
    isActive: true,
    ...overrides,
  };
}

function runtimePlayer(
  overrides: Partial<ArenaRuntimePlayer>,
): ArenaRuntimePlayer {
  return {
    userId: 'user',
    username: 'User',
    isBot: false,
    arenaRank: 'Beginner',
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
    ...overrides,
  };
}
