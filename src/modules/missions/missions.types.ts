import type { ActivityEventType } from '../learning-history/learning-history.types';

export const MISSION_ACTION_TYPES = [
  'CONTINUE_NODE',
  'CONTINUE_COURSE',
  'CONTINUE_LESSON',
  'PASS_QUIZ',
  'TAKE_TEST',
  'REVIEW_LESSON',
  'RETRY_NODE',
  'COMPLETE_ROADMAP_NODE',
  'LIGHT_PRACTICE',
  'PRACTICE_TOPIC',
  'ENTER_ARENA',
  'HARD_LEVEL',
  'HARD_QUIZ',
  'FEED_PET',
] as const;

export type MissionActionType = (typeof MISSION_ACTION_TYPES)[number];
export type MissionKind = 'NORMAL' | 'HARDCORE';
export type MissionStatus =
  | 'LOCKED'
  | 'PENDING'
  | 'OPENED'
  | 'COMPLETED'
  | 'FAILED';

export type MissionSourceType =
  | 'STARTER'
  | 'PROGRESS_BASED'
  | 'WEAK_TOPIC'
  | 'ROADMAP_STATE'
  | 'PET_TONE'
  | 'FALLBACK';

export type MissionCandidate = {
  candidateId: string;
  actionType: MissionActionType;
  targetType: 'LESSON' | 'NODE' | 'TOPIC' | 'PET' | 'COURSE' | 'QUIZ' | 'ARENA';
  targetId: string;
  topic?: string;
  title: string;
  message: string;
  href: string;
  ctaLabel?: string;
  ctaPath?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  rewardXp: number;
  expectedEventTypes: ActivityEventType[];
  sourceType?: MissionSourceType;
  generatedReason?: string;
  detailMessage?: string;
  metadata?: Record<string, unknown>;
};

export type AiSelectedMission = {
  candidateId: string;
  title: string;
  message: string;
  reasonCode:
    | 'CONTINUE_PROGRESS'
    | 'WEAK_TOPIC'
    | 'RETRY_FAILED'
    | 'REVIEW'
    | 'DAILY_HABIT'
    | 'CHALLENGE';
};

export type MissionSelectionResult = {
  source: 'AI' | 'FALLBACK';
  missions: AiSelectedMission[];
  analysisSummary?: Record<string, unknown>;
  aiMetadata?: Record<string, unknown>;
};

export type LearningSnapshot = {
  generatedAt: string;
  confidence: string;
  recentAccuracy: number;
  averageDurationSeconds: number;
  missionCompletionRate: number;
  missionDismissRate: number;
  weakTopics: string[];
  strongTopics: string[];
  topicStats: Array<Record<string, unknown>>;
  preferredDifficulty: string;
  personality: {
    dominantTraits: string[];
    analytical: number;
    creative: number;
    disciplined: number;
    competitive: number;
    adaptable: number;
    curious: number;
  };
};
