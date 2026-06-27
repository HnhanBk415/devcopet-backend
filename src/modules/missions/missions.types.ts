import type { ActivityEventType } from '../learning-history/learning-history.types';

export const MISSION_ACTION_TYPES = [
  'CONTINUE_LESSON',
  'PASS_QUIZ',
  'REVIEW_LESSON',
  'RETRY_NODE',
  'COMPLETE_ROADMAP_NODE',
  'PRACTICE_TOPIC',
  'FEED_PET',
] as const;

export type MissionActionType = (typeof MISSION_ACTION_TYPES)[number];
export type MissionKind = 'NORMAL' | 'HARDCORE';
export type MissionStatus =
  | 'LOCKED'
  | 'PENDING'
  | 'OPENED'
  | 'COMPLETED'
  | 'DISMISSED'
  | 'EXPIRED';

export type MissionCandidate = {
  candidateId: string;
  actionType: MissionActionType;
  targetType: 'LESSON' | 'NODE' | 'TOPIC' | 'PET';
  targetId: string;
  topic?: string;
  title: string;
  message: string;
  href: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  rewardXp: number;
  expectedEventTypes: ActivityEventType[];
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
