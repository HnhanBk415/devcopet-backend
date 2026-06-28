import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ArenaMatch, ArenaMatchDocument } from '../schemas/arena-match.schema';
import { ArenaQuestionEvaluatorService } from './arena-question-evaluator.service';
import { ArenaScoreService } from './arena-score.service';
import { LearningHistoryService } from '../../learning-history/learning-history.service';
import { MissionsService } from '../../missions/missions.service';
import type {
  ArenaMatchStatus,
  ArenaRoom,
  ArenaResultType,
} from '../types/arena.types';

@Injectable()
export class ArenaResultService {
  constructor(
    @InjectModel(ArenaMatch.name)
    private readonly arenaMatchModel: Model<ArenaMatchDocument>,
    private readonly evaluatorService: ArenaQuestionEvaluatorService,
    private readonly scoreService: ArenaScoreService,
    private readonly learningHistoryService: LearningHistoryService,
    private readonly missionsService: MissionsService,
  ) {}

  async persistRoom(input: {
    room: ArenaRoom;
    status: ArenaMatchStatus;
    winnerUserId?: string;
    isDraw: boolean;
  }) {
    const { room } = input;
    const resultType: ArenaResultType =
      input.status === 'cancelled'
        ? 'cancelled'
        : input.status === 'disconnected'
          ? 'disconnected'
          : input.isDraw
            ? 'draw'
            : 'win';

    const document = {
      roomId: room.roomId,
      courseSlug: room.courseSlug,
      mode: room.mode,
      matchTier: room.matchTier,
      players: room.players.map((player) => ({
        userId: this.toObjectId(player.userId),
        username: player.username,
        isBot: player.isBot,
        botDifficulty: player.botDifficulty,
        arenaRank: player.arenaRank,
        ratingBefore: player.ratingBefore,
        ratingAfter: player.ratingAfter,
        ratingDelta: player.ratingDelta,
        score: player.score,
        correctCount: player.correctCount,
        wrongCount: player.wrongCount,
        timeoutCount: player.timeoutCount,
        avgAnswerTimeMs: this.scoreService.getAvgAnswerTime(player),
      })),
      questionResults: room.questions.map((question) => ({
        questionId: question.objectId,
        difficulty: question.difficulty,
        type: question.type,
        correctAnswer: this.evaluatorService.getCorrectAnswer(question),
        answers: Object.values(room.submittedAnswers[question.id] ?? {}).map(
          (answer) => ({
            userId: this.toObjectId(answer.userId),
            isBot: answer.isBot,
            answer: answer.answer,
            isCorrect: answer.isCorrect,
            earnedScore: answer.earnedScore,
            answerTimeMs: answer.answerTimeMs,
            remainingSeconds: answer.remainingSeconds,
          }),
        ),
      })),
      finalScoreboard: this.scoreService.getScoreboard(room.players),
      winnerUserId: this.toObjectId(input.winnerUserId),
      resultType,
      status: input.status,
      startedAt: new Date(room.startedAt ?? room.createdAt),
      finishedAt: new Date(room.finishedAt ?? Date.now()),
    };

    await this.arenaMatchModel.updateOne(
      { roomId: room.roomId },
      { $setOnInsert: document },
      { upsert: true },
    );

    if (input.status === 'completed' || input.status === 'disconnected') {
      const now = new Date();
      await Promise.all(
        room.players
          .filter((p) => !p.isBot)
          .map(async (p) => {
            const eventData = {
              userId: p.userId,
              eventType: 'ARENA_MATCH_FINISHED' as const,
              idempotencyKey: `arena-match:${room.roomId}:${p.userId}`,
              targetType: 'ARENA',
              targetId: room.roomId,
              occurredAt: now,
              metadata: {
                roomId: room.roomId,
                courseSlug: room.courseSlug,
                status: input.status,
                isWinner: p.userId === input.winnerUserId,
                isDraw: input.isDraw,
              },
            };
            await this.learningHistoryService.recordEvent(eventData);
            await this.missionsService.processActivityEvent(eventData);
          }),
      );
    }
  }

  private toObjectId(id?: string) {
    if (!id || id.startsWith('bot_') || !Types.ObjectId.isValid(id)) {
      return undefined;
    }
    return new Types.ObjectId(id);
  }
}
