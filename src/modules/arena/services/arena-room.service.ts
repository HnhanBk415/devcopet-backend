import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Namespace, Socket } from 'socket.io';
import { randomUUID } from 'node:crypto';
import {
  ARENA_ANSWER_REVEAL_SECONDS,
  ARENA_COUNTDOWN_VALUES,
  ARENA_MATCH_ACCEPT_SECONDS,
  ARENA_QUESTION_TIME,
  ARENA_TOTAL_QUESTIONS,
  ARENA_RANK_VALUE,
} from '../constants/arena.constants';
import type { SubmitAnswerDto } from '../dto/submit-answer.dto';
import type { ArenaQueueEntry } from './arena-matchmaking.service';
import { ArenaBotService } from './arena-bot.service';
import { ArenaMatchmakingService } from './arena-matchmaking.service';
import { ArenaQuestionEvaluatorService } from './arena-question-evaluator.service';
import { ArenaQuestionService } from './arena-question.service';
import { ArenaRatingService } from './arena-rating.service';
import { ArenaResultService } from './arena-result.service';
import { ArenaScoreService } from './arena-score.service';
import type {
  ArenaAnswerPayload,
  ArenaMatchStatus,
  ArenaRank,
  ArenaRoom,
  ArenaRuntimePlayer,
  ArenaRuntimeQuestion,
  ArenaSocketUser,
  RatingChange,
  RankUpPayload,
} from '../types/arena.types';

@Injectable()
export class ArenaRoomService {
  private readonly logger = new Logger(ArenaRoomService.name);
  private readonly rooms = new Map<string, ArenaRoom>();

  constructor(
    private readonly botService: ArenaBotService,
    private readonly matchmakingService: ArenaMatchmakingService,
    private readonly questionService: ArenaQuestionService,
    private readonly evaluatorService: ArenaQuestionEvaluatorService,
    private readonly scoreService: ArenaScoreService,
    private readonly ratingService: ArenaRatingService,
    private readonly resultService: ArenaResultService,
  ) {}

  async createHumanRoom(
    server: Namespace,
    a: ArenaQueueEntry,
    b: ArenaQueueEntry,
  ) {
    const matchTier = this.getMatchTier(a.arenaRank, b.arenaRank);
    const questions = await this.questionService.selectQuestions({
      courseSlug: a.courseSlug,
      matchTier,
      userIds: [a.userId, b.userId],
    });

    const room = this.createRoom({
      courseSlug: a.courseSlug,
      mode: a.mode,
      matchTier,
      players: [this.toRuntimePlayer(a), this.toRuntimePlayer(b)],
      questions,
    });

    this.rooms.set(room.roomId, room);
    this.matchmakingService.markActiveRoom([a.userId, b.userId], room.roomId);
    await this.joinHumanSockets(server, room);
    this.startMatchConfirmation(server, room);
    return room;
  }

  async createBotRoom(server: Namespace, entry: ArenaQueueEntry) {
    this.matchmakingService.cancel(entry.userId);
    const bot = this.botService.createBotForRank(entry.arenaRank);
    const questions = await this.questionService.selectQuestions({
      courseSlug: entry.courseSlug,
      matchTier: entry.arenaRank,
      userIds: [entry.userId],
    });

    const room = this.createRoom({
      courseSlug: entry.courseSlug,
      mode: entry.mode,
      matchTier: entry.arenaRank,
      players: [this.toRuntimePlayer(entry), bot],
      questions,
    });

    this.rooms.set(room.roomId, room);
    this.matchmakingService.markActiveRoom([entry.userId], room.roomId);
    await this.joinHumanSockets(server, room);
    this.startMatchConfirmation(server, room);
    return room;
  }

  submitAnswer(server: Namespace, client: Socket, dto: SubmitAnswerDto) {
    const user = this.getSocketUser(client);
    this.submitAnswerInternal(server, {
      roomId: dto.roomId,
      userId: user.userId,
      answer: dto.answer,
      isBot: false,
    });
  }

  acceptMatch(server: Namespace, client: Socket, roomId: string) {
    const user = this.getSocketUser(client);
    const room = this.getRoom(roomId);
    if (room.status !== 'confirming') {
      throw new BadRequestException('Match is not accepting confirmations.');
    }

    const player = this.getRoomPlayer(room, user.userId);
    if (player.isBot) return;
    player.matchAccepted = true;

    server.to(room.roomId).emit('arena:match_accept_update', {
      roomId: room.roomId,
      acceptedUserIds: room.players
        .filter((item) => item.matchAccepted)
        .map((item) => item.userId),
      requiredUserIds: room.players
        .filter((item) => !item.isBot)
        .map((item) => item.userId),
    });

    if (room.players.every((item) => item.isBot || item.matchAccepted)) {
      this.clearMatchAcceptTimer(room);
      this.startCountdown(server, room);
    }
  }

  async declineMatch(server: Namespace, client: Socket, roomId: string) {
    const user = this.getSocketUser(client);
    const room = this.getRoom(roomId);
    if (room.status !== 'confirming') {
      throw new BadRequestException('Match is not accepting confirmations.');
    }

    const player = this.getRoomPlayer(room, user.userId);
    server.to(room.roomId).emit('arena:match_declined', {
      roomId: room.roomId,
      userId: player.userId,
    });
    await this.finishMatch(server, room, 'cancelled');
  }

  async leaveRoom(server: Namespace, client: Socket, roomId: string) {
    const user = this.getSocketUser(client);
    const room = this.getRoom(roomId);
    const player = this.getRoomPlayer(room, user.userId);
    player.disconnected = true;
    const status: ArenaMatchStatus = room.startedAt
      ? 'disconnected'
      : 'cancelled';
    await this.finishMatch(server, room, status);
  }

  async handleDisconnect(server: Namespace, userId: string) {
    const roomId = this.matchmakingService.getActiveRoomId(userId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.status === 'finished' || room.status === 'cancelled')
      return;

    const player = room.players.find((item) => item.userId === userId);
    if (player) {
      player.disconnected = true;
      player.socketId = undefined;
    }

    const status: ArenaMatchStatus = room.startedAt
      ? 'disconnected'
      : 'cancelled';
    await this.finishMatch(server, room, status);
  }

  getRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) throw new BadRequestException('Invalid arena room.');
    return room;
  }

  private createRoom(input: {
    courseSlug: string;
    mode: ArenaRoom['mode'];
    matchTier: ArenaRank;
    players: ArenaRuntimePlayer[];
    questions: ArenaRuntimeQuestion[];
  }): ArenaRoom {
    return {
      roomId: randomUUID(),
      courseSlug: input.courseSlug,
      mode: input.mode,
      status: 'confirming',
      matchTier: input.matchTier,
      players: input.players.map((player) => ({
        ...player,
        matchAccepted: player.isBot ? true : false,
      })),
      questions: input.questions,
      currentQuestionIndex: 0,
      questionFinished: false,
      resultPersisted: false,
      submittedAnswers: {},
      timers: {},
      createdAt: Date.now(),
    };
  }

  private async joinHumanSockets(server: Namespace, room: ArenaRoom) {
    await Promise.all(
      room.players
        .filter((player) => !player.isBot && player.socketId)
        .map(async (player) => {
          const socket = server.sockets.get(player.socketId!);
          await socket?.join(room.roomId);
        }),
    );
  }

  private startMatchConfirmation(server: Namespace, room: ArenaRoom) {
    room.status = 'confirming';
    room.matchAcceptDeadline = Date.now() + ARENA_MATCH_ACCEPT_SECONDS * 1000;
    this.emitMatchFound(server, room);

    room.timers.matchAcceptTimer = setTimeout(() => {
      if (room.status !== 'confirming') return;
      server.to(room.roomId).emit('arena:match_accept_timeout', {
        roomId: room.roomId,
        acceptedUserIds: room.players
          .filter((player) => player.matchAccepted)
          .map((player) => player.userId),
      });
      void this.finishMatch(server, room, 'cancelled');
    }, ARENA_MATCH_ACCEPT_SECONDS * 1000);

    if (room.players.every((player) => player.isBot || player.matchAccepted)) {
      this.clearMatchAcceptTimer(room);
      this.startCountdown(server, room);
    }
  }

  private emitMatchFound(server: Namespace, room: ArenaRoom) {
    server.to(room.roomId).emit('arena:match_found', {
      roomId: room.roomId,
      mode: room.mode,
      courseSlug: room.courseSlug,
      matchTier: room.matchTier,
      acceptWindowSeconds: ARENA_MATCH_ACCEPT_SECONDS,
      acceptDeadline: new Date(
        room.matchAcceptDeadline ?? Date.now(),
      ).toISOString(),
      serverTime: new Date().toISOString(),
      players: room.players.map((player) => ({
        userId: player.userId,
        username: player.username,
        avatarUrl: player.avatarUrl,
        isBot: player.isBot,
        arenaRank: player.arenaRank,
        arenaRating: player.arenaRating,
        matchAccepted: player.matchAccepted ?? false,
      })),
    });
  }

  private startCountdown(server: Namespace, room: ArenaRoom) {
    if (room.status === 'finished' || room.status === 'cancelled') return;
    room.status = 'countdown';
    room.startedAt = room.startedAt ?? Date.now();

    server.to(room.roomId).emit('arena:match_accepted', {
      roomId: room.roomId,
      countdownValues: ARENA_COUNTDOWN_VALUES,
    });

    const values = [...ARENA_COUNTDOWN_VALUES];
    const tick = () => {
      if (room.status !== 'countdown') return;
      const value = values.shift();
      if (!value) return;

      server.to(room.roomId).emit('arena:countdown', {
        roomId: room.roomId,
        value,
      });

      if (value === 'GO') {
        this.startCurrentQuestion(server, room);
        return;
      }

      room.timers.countdownTimer = setTimeout(tick, 1000);
    };

    tick();
  }

  private startCurrentQuestion(server: Namespace, room: ArenaRoom) {
    if (room.status === 'finished' || room.status === 'cancelled') return;

    const question = room.questions[room.currentQuestionIndex];
    if (!question) {
      void this.finishMatch(server, room, 'completed');
      return;
    }

    room.status = 'playing';
    room.questionFinished = false;
    room.questionStartedAt = Date.now();
    room.questionTimeLimitSeconds = ARENA_QUESTION_TIME[question.difficulty];
    room.submittedAnswers[question.id] =
      room.submittedAnswers[question.id] ?? {};
    for (const player of room.players) {
      player.answeredCurrentQuestion = false;
    }

    server.to(room.roomId).emit('arena:question', {
      roomId: room.roomId,
      questionIndex: room.currentQuestionIndex + 1,
      totalQuestions: ARENA_TOTAL_QUESTIONS,
      question: this.questionService.toPublicQuestion(
        question,
        room.questionTimeLimitSeconds,
      ),
      timeLimitSeconds: room.questionTimeLimitSeconds,
      serverTime: new Date().toISOString(),
    });

    room.timers.questionTimer = setTimeout(
      () => {
        this.finishQuestion(server, room);
      },
      room.questionTimeLimitSeconds * 1000 + 100,
    );

    this.scheduleBotAnswer(server, room, question);
  }

  private scheduleBotAnswer(
    server: Namespace,
    room: ArenaRoom,
    question: ArenaRuntimeQuestion,
  ) {
    const bot = room.players.find(
      (player) => player.isBot && player.botDifficulty,
    );
    if (!bot?.botDifficulty || !room.questionTimeLimitSeconds) return;

    const delayMs = this.botService.getAnswerDelayMs(
      bot.botDifficulty,
      room.questionTimeLimitSeconds,
    );

    room.timers.botTimer = setTimeout(() => {
      if (room.status !== 'playing' || room.questionFinished) return;
      const answer = this.botService.generateAnswer(
        question,
        bot.botDifficulty!,
      );
      try {
        this.submitAnswerInternal(server, {
          roomId: room.roomId,
          userId: bot.userId,
          answer,
          isBot: true,
        });
      } catch (error) {
        this.logger.warn(error instanceof Error ? error.message : error);
      }
    }, delayMs);
  }

  private submitAnswerInternal(
    server: Namespace,
    input: {
      roomId: string;
      userId: string;
      answer: ArenaAnswerPayload;
      isBot: boolean;
    },
  ) {
    const room = this.getRoom(input.roomId);
    if (room.status !== 'playing' || room.questionFinished) {
      throw new BadRequestException('Question is not accepting answers.');
    }

    const player = this.getRoomPlayer(room, input.userId);
    if (player.disconnected)
      throw new BadRequestException('Player disconnected.');
    if (player.answeredCurrentQuestion) {
      throw new BadRequestException('Question already answered.');
    }

    const question = room.questions[room.currentQuestionIndex];
    if (!question) throw new BadRequestException('Invalid arena question.');

    const elapsedMs = Math.max(
      Date.now() - (room.questionStartedAt ?? Date.now()),
      0,
    );
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const timeLimitSeconds =
      room.questionTimeLimitSeconds ?? ARENA_QUESTION_TIME[question.difficulty];
    const remainingSeconds = Math.max(timeLimitSeconds - elapsedSeconds, 0);
    const timedOut = remainingSeconds <= 0;

    let isCorrect = false;
    if (!timedOut) {
      isCorrect = this.evaluatorService.evaluate(question, input.answer);
    }

    const score = this.scoreService.calculateQuestionScore({
      isCorrect,
      question,
      remainingSeconds,
      currentStreak: player.streak,
    });

    player.answeredCurrentQuestion = true;
    player.streak = score.nextStreak;
    player.score += score.earnedScore;
    player.answeredQuestionCount += timedOut ? 0 : 1;
    player.totalAnswerTimeMs += timedOut ? 0 : elapsedMs;

    if (timedOut) {
      player.timeoutCount += 1;
    } else if (isCorrect) {
      player.correctCount += 1;
    } else {
      player.wrongCount += 1;
    }

    room.submittedAnswers[question.id][input.userId] = {
      userId: input.userId,
      isBot: input.isBot,
      answer: input.answer,
      isCorrect,
      earnedScore: score.earnedScore,
      answerTimeMs: timedOut ? 0 : elapsedMs,
      remainingSeconds,
      submittedAt: Date.now(),
      timedOut,
    };

    if (!input.isBot && player.socketId) {
      server.to(player.socketId).emit('arena:answer_locked', {
        roomId: room.roomId,
        questionId: question.id,
        locked: true,
      });
    }

    server.to(room.roomId).emit('arena:opponent_answered', {
      roomId: room.roomId,
      userId: input.userId,
      answered: true,
    });
    if (room.players.every((item) => item.answeredCurrentQuestion)) {
      this.finishQuestion(server, room);
    }
  }

  private finishQuestion(server: Namespace, room: ArenaRoom) {
    if (room.questionFinished || room.status !== 'playing') return;

    room.questionFinished = true;
    this.clearQuestionTimers(room);

    const question = room.questions[room.currentQuestionIndex];
    if (!question) return;

    for (const player of room.players) {
      if (player.answeredCurrentQuestion) continue;
      player.answeredCurrentQuestion = true;
      player.streak = 0;
      player.timeoutCount += 1;
      room.submittedAnswers[question.id][player.userId] = {
        userId: player.userId,
        isBot: player.isBot,
        answer: {},
        isCorrect: false,
        earnedScore: 0,
        answerTimeMs: 0,
        remainingSeconds: 0,
        submittedAt: Date.now(),
        timedOut: true,
      };
    }

    const correctAnswer = this.evaluatorService.getCorrectAnswer(question);
    const scoreboard = this.scoreService.getScoreboard(room.players);
    const isLastQuestion =
      room.currentQuestionIndex >= room.questions.length - 1;

    for (const player of room.players) {
      if (player.isBot || !player.socketId) continue;
      const answer = room.submittedAnswers[question.id][player.userId];
      server.to(player.socketId).emit('arena:answer_result', {
        roomId: room.roomId,
        questionId: question.id,
        isCorrect: answer?.isCorrect ?? false,
        earnedScore: answer?.earnedScore ?? 0,
        correctAnswer,
        explanation: question.explanation,
        totalScore: player.score,
        streak: player.streak,
        timedOut: answer?.timedOut ?? false,
      });
    }

    server.to(room.roomId).emit('arena:question_finished', {
      roomId: room.roomId,
      questionId: question.id,
      correctAnswer,
      explanation: question.explanation,
      scoreboard,
      revealSeconds: ARENA_ANSWER_REVEAL_SECONDS,
      nextQuestionInSeconds: isLastQuestion
        ? null
        : ARENA_ANSWER_REVEAL_SECONDS,
    });

    server.to(room.roomId).emit('arena:score_update', {
      roomId: room.roomId,
      scoreboard,
    });

    room.timers.nextQuestionTimer = setTimeout(() => {
      if (isLastQuestion) {
        void this.finishMatch(server, room, 'completed');
        return;
      }

      room.currentQuestionIndex += 1;
      this.startCurrentQuestion(server, room);
    }, ARENA_ANSWER_REVEAL_SECONDS * 1000);
  }

  private async finishMatch(
    server: Namespace,
    room: ArenaRoom,
    status: ArenaMatchStatus,
  ) {
    if (room.status === 'finished' || room.status === 'cancelled') return;

    room.status = status === 'cancelled' ? 'cancelled' : 'finished';
    room.finishedAt = Date.now();
    this.clearAllTimers(room);

    const winner = this.decideWinnerForStatus(room, status);
    let ratingChanges: RatingChange[] = [];
    let rankUps: RankUpPayload[] = [];

    if (
      (status === 'completed' || status === 'disconnected') &&
      !room.resultPersisted
    ) {
      const ratingResult = await this.ratingService.applyMatchResults({
        players: room.players,
        winnerUserId: winner.winnerUserId,
        isDraw: winner.isDraw,
        questionIds: room.questions.map((question) => question.id),
      });
      ratingChanges = ratingResult.ratingChanges;
      rankUps = ratingResult.rankUps;
    }

    if (!room.resultPersisted && room.startedAt) {
      room.resultPersisted = true;
      await this.resultService.persistRoom({
        room,
        status,
        winnerUserId: winner.winnerUserId,
        isDraw: winner.isDraw,
      });
    }

    this.emitMatchFinished(server, room, {
      winnerUserId: winner.winnerUserId,
      isDraw: winner.isDraw,
      ratingChanges,
      rankUps,
      status,
    });

    this.matchmakingService.clearActiveRoom(
      room.players.map((player) => player.userId),
    );
    setTimeout(() => this.rooms.delete(room.roomId), 5000);
  }

  private decideWinnerForStatus(room: ArenaRoom, status: ArenaMatchStatus) {
    if (status === 'disconnected') {
      const connected = room.players.find((player) => !player.disconnected);
      if (connected) return { winnerUserId: connected.userId, isDraw: false };
    }

    if (status === 'cancelled') return { isDraw: true };
    return this.scoreService.decideWinner(room.players);
  }

  private emitMatchFinished(
    server: Namespace,
    room: ArenaRoom,
    input: {
      winnerUserId?: string;
      isDraw: boolean;
      ratingChanges: RatingChange[];
      rankUps: RankUpPayload[];
      status: ArenaMatchStatus;
    },
  ) {
    const finalScoreboard = this.scoreService.getScoreboard(room.players);

    for (const player of room.players) {
      if (player.isBot || !player.socketId) continue;

      const result =
        input.status !== 'completed' && input.status !== 'disconnected'
          ? 'draw'
          : input.isDraw
            ? 'draw'
            : input.winnerUserId === player.userId
              ? 'win'
              : 'lose';

      server.to(player.socketId).emit('arena:match_finished', {
        roomId: room.roomId,
        status: input.status,
        result,
        winnerUserId: input.winnerUserId,
        finalScoreboard,
        ratingChanges: input.ratingChanges,
        rewards: null,
        rankUp: input.rankUps,
      });
    }
  }

  private getRoomPlayer(room: ArenaRoom, userId: string) {
    const player = room.players.find((item) => item.userId === userId);
    if (!player)
      throw new BadRequestException('User is not in this arena room.');
    return player;
  }

  private getSocketUser(client: Socket): ArenaSocketUser {
    const socketData = client.data as { user?: ArenaSocketUser };
    const user = socketData.user;
    if (!user?.userId) throw new BadRequestException('Unauthenticated socket.');
    return user;
  }

  private toRuntimePlayer(entry: ArenaQueueEntry): ArenaRuntimePlayer {
    return {
      userId: entry.userId,
      socketId: entry.socketId,
      username: entry.username,
      avatarUrl: entry.avatarUrl,
      isBot: false,
      arenaRank: entry.arenaRank,
      arenaRating: entry.arenaRating,
      ratingBefore: entry.arenaRating,
      ratingAfter: entry.arenaRating,
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

  private getMatchTier(a: ArenaRank, b: ArenaRank): ArenaRank {
    return ARENA_RANK_VALUE[a] <= ARENA_RANK_VALUE[b] ? a : b;
  }

  private clearMatchAcceptTimer(room: ArenaRoom) {
    if (room.timers.matchAcceptTimer) {
      clearTimeout(room.timers.matchAcceptTimer);
    }
    room.timers.matchAcceptTimer = undefined;
    room.matchAcceptDeadline = undefined;
  }

  private clearQuestionTimers(room: ArenaRoom) {
    if (room.timers.questionTimer) clearTimeout(room.timers.questionTimer);
    if (room.timers.botTimer) clearTimeout(room.timers.botTimer);
    room.timers.questionTimer = undefined;
    room.timers.botTimer = undefined;
  }

  private clearAllTimers(room: ArenaRoom) {
    this.clearMatchAcceptTimer(room);
    this.clearQuestionTimers(room);
    if (room.timers.countdownTimer) clearTimeout(room.timers.countdownTimer);
    if (room.timers.nextQuestionTimer)
      clearTimeout(room.timers.nextQuestionTimer);
    room.timers.countdownTimer = undefined;
    room.timers.nextQuestionTimer = undefined;
  }
}
