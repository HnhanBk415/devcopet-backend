import type { Types } from 'mongoose';

export type ArenaRank = 'Beginner' | 'Fresher' | 'Senior' | 'Expert';
export type ArenaDifficulty = 'easy' | 'medium' | 'hard';
export type ArenaMode = 'ranked' | 'casual' | 'practice';
export type ArenaQuestionType = 'multiple_choice' | 'drag_drop';
export type ArenaRoomStatus =
  | 'waiting'
  | 'confirming'
  | 'countdown'
  | 'playing'
  | 'finished'
  | 'cancelled';
export type ArenaBotDifficulty = 'easy' | 'medium' | 'hard' | 'elite';
export type ArenaMatchStatus = 'completed' | 'cancelled' | 'disconnected';
export type ArenaResultType = 'win' | 'draw' | 'cancelled' | 'disconnected';

export interface ArenaSocketUser {
  userId: string;
  email: string;
}

export interface ArenaAnswerPayload {
  optionId?: string;
  dropZoneMap?: Record<string, string>;
}

export interface PublicArenaPlayer {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  isBot: boolean;
  arenaRank: ArenaRank;
  arenaRating: number;
}

export interface ArenaRuntimePlayer extends PublicArenaPlayer {
  socketId?: string;
  botDifficulty?: ArenaBotDifficulty;
  score: number;
  streak: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  totalAnswerTimeMs: number;
  answeredQuestionCount: number;
  answeredCurrentQuestion: boolean;
  matchAccepted?: boolean;
  disconnected?: boolean;
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
}

export interface ArenaRuntimeQuestion {
  id: string;
  objectId: Types.ObjectId;
  courseSlug: string;
  difficulty: ArenaDifficulty;
  chapterOrder: number;
  chapterTitle?: string;
  lessonSlug?: string;
  lessonTitle?: string;
  title: string;
  question: string;
  type: ArenaQuestionType;
  codeSnippet?: {
    language: string;
    code: string;
  } | null;
  template?: string;
  options?: {
    id: string;
    text: string;
  }[];
  correctOptionId?: string;
  poolItems?: {
    id: string;
    text: string;
  }[];
  dropZones?: {
    id: string;
    label: string;
  }[];
  correctDropZoneMap?: Record<string, string>;
  explanation: string;
  conceptTags: string[];
  estimatedSeconds?: number;
  baseScore?: number;
  isActive: boolean;
}

export interface PublicArenaQuestion {
  id: string;
  type: ArenaQuestionType;
  title: string;
  question: string;
  codeSnippet?: {
    language: string;
    code: string;
  } | null;
  template?: string;
  options?: {
    id: string;
    text: string;
  }[];
  poolItems?: {
    id: string;
    text: string;
  }[];
  dropZones?: {
    id: string;
    label: string;
  }[];
  difficulty: ArenaDifficulty;
  timeLimitSeconds: number;
  chapterOrder: number;
  conceptTags: string[];
}

export interface ArenaSubmittedAnswer {
  userId: string;
  isBot: boolean;
  answer: ArenaAnswerPayload;
  isCorrect: boolean;
  earnedScore: number;
  answerTimeMs: number;
  remainingSeconds: number;
  submittedAt: number;
  timedOut?: boolean;
}

export interface PublicScoreboardItem {
  userId: string;
  username: string;
  isBot: boolean;
  score: number;
  streak: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  disconnected?: boolean;
}

export interface RatingChange {
  userId: string;
  oldRating: number;
  newRating: number;
  delta: number;
  oldRank: ArenaRank;
  newRank: ArenaRank;
}

export interface RankUpPayload {
  userId: string;
  oldRank: ArenaRank;
  newRank: ArenaRank;
}

export interface ArenaRoom {
  roomId: string;
  courseSlug: string;
  mode: ArenaMode;
  status: ArenaRoomStatus;
  matchTier: ArenaRank;
  players: ArenaRuntimePlayer[];
  questions: ArenaRuntimeQuestion[];
  currentQuestionIndex: number;
  questionStartedAt?: number;
  questionTimeLimitSeconds?: number;
  questionFinished: boolean;
  matchAcceptDeadline?: number;
  resultPersisted: boolean;
  submittedAnswers: Record<string, Record<string, ArenaSubmittedAnswer>>;
  timers: {
    matchAcceptTimer?: NodeJS.Timeout;
    countdownTimer?: NodeJS.Timeout;
    nextQuestionTimer?: NodeJS.Timeout;
    questionTimer?: NodeJS.Timeout;
    botTimer?: NodeJS.Timeout;
  };
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
}

export interface ArenaWinnerResult {
  winnerUserId?: string;
  isDraw: boolean;
}
