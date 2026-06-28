export const LEARNING_SOURCE_TYPES = [
  'ROADMAP',
  'LESSON',
  'QUIZ',
  'PET',
] as const;

export type LearningSourceType = (typeof LEARNING_SOURCE_TYPES)[number];

export const ACTIVITY_EVENT_TYPES = [
  'ROADMAP_ATTEMPTED',
  'ROADMAP_NODE_COMPLETED',
  'QUIZ_ATTEMPTED',
  'LESSON_COMPLETED',
  'PET_FED',
  'MISSION_OPENED',
  'MISSION_DISMISSED',
  'MISSION_COMPLETED',
  'MISSION_SET_COMPLETED',
  'HARDCORE_UNLOCKED',
  'ARENA_MATCH_FINISHED',
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export type RecordLearningAttemptInput = {
  userId: string;
  submissionId?: string;
  sourceType: LearningSourceType;
  courseSlug?: string;
  mode?: 'easy' | 'medium' | 'hard';
  targetType: 'NODE' | 'LESSON' | 'QUIZ';
  targetId: string;
  topic: string;
  challengeType: string;
  passed: boolean;
  score?: number;
  maxScore?: number;
  durationSeconds?: number;
  hintUsed?: number;
  primaryMistake?: string;
  metadata?: Record<string, unknown>;
};

export type RecordActivityEventInput = {
  userId: string;
  eventType: ActivityEventType;
  idempotencyKey: string;
  targetType?: string;
  targetId?: string;
  topic?: string;
  passed?: boolean;
  score?: number;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
};

export type TopicLearningStat = {
  topic: string;
  attempts: number;
  passedAttempts: number;
  accuracy: number;
  averageScorePercent: number;
  retryRate: number;
  primaryMistakes: string[];
  lastAttemptAt: Date;
};
