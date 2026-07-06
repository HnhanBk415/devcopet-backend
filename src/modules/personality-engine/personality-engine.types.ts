/**
 * PersonalityEngine Types
 *
 * Interfaces & types for pet behavior personalization
 * based on user personality traits.
 */

/**
 * Configuration output from PersonalityEngine.
 * Pet service uses this to customize interactions.
 */
export interface PetBehaviorConfig {
  /** Tone of pet messages */
  tone: 'gentle' | 'direct' | 'motivational' | 'analytical' | 'playful';

  /** How direct/blunt the pet is (0 = very soft, 1 = very blunt) */
  directness: number;

  /** How much the pet encourages the user (0 = minimal, 1 = constant) */
  encouragementLevel: number;

  /** Difficulty of challenges pet suggests (0 = easy, 1 = hard) */
  challengeLevel: number;

  /** Preferred message length */
  messageLength: 'short' | 'medium' | 'detailed';

  /** Whether to use competitive framing (leaderboards, comparisons) */
  useCompetition: boolean;

  /** Whether to show progress evidence (streaks, graphs) */
  useProgressEvidence: boolean;

  /** Reminder style */
  reminderStyle: 'supportive' | 'urgent' | 'casual' | 'structured';

  /** Frequency of reminders */
  reminderFrequency: 'low' | 'medium' | 'high';

  /** Learning mode suggestion */
  learningMode: 'solo' | 'collaborative' | 'mixed';
}

export type PetTone =
  | 'gentle'
  | 'direct'
  | 'motivational'
  | 'analytical'
  | 'playful';

export type PersonalityTrait =
  | 'analytical'
  | 'creative'
  | 'disciplined'
  | 'independent'
  | 'empathetic'
  | 'competitive'
  | 'adaptable'
  | 'curious';

export type PersonalizationDepth = 'light' | 'medium' | 'deep';

export type PersonalizationContext = {
  interactionType:
    | 'challenge_correct'
    | 'challenge_wrong'
    | 'challenge_review'
    | 'challenge_hint';
  mode?: 'easy' | 'medium' | 'hard';
  challengeType?: string;
  topicTitle?: string;
  selectedAnswer?: unknown;
  mistakeType?: string;
  hintUsed?: number;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
};

export type PersonalizationDebug = {
  userId: string;
  petName: string;
  tone: PetTone;
  dominantTraits: string[];
  topTrait?: string;
  directness: number;
  encouragementLevel: number;
  challengeLevel: number;
  messageLength: 'short' | 'medium' | 'detailed';
  useCompetition: boolean;
  useProgressEvidence: boolean;
  personalityFound: boolean;
  defaultUsed: boolean;
  templatesUsed: string[];
  context: PersonalizationContext;
};

export type PersonalizeTextInput = {
  userId: string;
  baseText: string;
  fallbackText: string;
  context: PersonalizationContext;
  depth?: PersonalizationDepth;
};

export type PersonalizedTextResult = {
  text: string;
  speaker: {
    name: string;
    type: 'PET';
  };
  tone: PetTone;
  meta?: PersonalizationDebug;
};

/**
 * Context passed when generating pet interactions.
 */
export interface PetInteractionContext {
  /** Type of interaction happening */
  interactionType:
    | 'study_reminder'
    | 'deadline_warning'
    | 'task_complete'
    | 'task_abandoned'
    | 'challenge_offer'
    | 'failure_support'
    | 'streak_update'
    | 'course_recommendation'
    | 'daily_greeting'
    | 'notification';

  /** Additional data about the interaction */
  metadata?: Record<string, unknown>;
}

/**
 * Reminder-specific context.
 */
export interface ReminderContext {
  /** What the reminder is about */
  reminderType: 'study' | 'deadline' | 'streak' | 'daily';

  /** How urgent is this reminder */
  urgency: 'low' | 'medium' | 'high';

  /** Number of times this reminder has been sent before */
  previousReminderCount: number;

  /** Did the user respond to the last reminder? */
  lastReminderResponded: boolean;
}

/**
 * Strategy output for how a reminder should be delivered.
 */
export interface ReminderStrategy {
  /** Should the reminder be sent? */
  shouldSend: boolean;

  /** Tone to use */
  tone: string;

  /** Suggested message template key */
  messageTemplateKey: string;

  /** Delay before sending (minutes) */
  delayMinutes: number;

  /** Additional params for the message template */
  templateParams: Record<string, unknown>;
}
