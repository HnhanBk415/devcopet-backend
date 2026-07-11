import type {
  ArenaBotDifficulty,
  ArenaDifficulty,
  ArenaRank,
} from '../types/arena.types';

export const ARENA_TOTAL_QUESTIONS = 5;
export const ARENA_BOT_FALLBACK_SECONDS = 30;
export const ARENA_MATCH_ACCEPT_SECONDS = 5;
export const ARENA_ANSWER_REVEAL_SECONDS = 5;
export const ARENA_COUNTDOWN_VALUES = [3, 2, 1, 'GO'] as const;
export const ARENA_MIN_RATING = 0;

export const ARENA_RANKS: ArenaRank[] = [
  'Beginner',
  'Fresher',
  'Senior',
  'Expert',
];

export const ARENA_RANK_VALUE: Record<ArenaRank, number> = {
  Beginner: 1,
  Fresher: 2,
  Senior: 3,
  Expert: 4,
};

export const ARENA_RANK_RATING_FLOOR: Record<ArenaRank, number> = {
  Beginner: 1000,
  Fresher: 1200,
  Senior: 1500,
  Expert: 1900,
};

export const ARENA_RANK_UP_RULES: Partial<
  Record<
    ArenaRank,
    { nextRank: ArenaRank; minRating: number; minMatches: number }
  >
> = {
  Beginner: { nextRank: 'Fresher', minRating: 1200, minMatches: 10 },
  Fresher: { nextRank: 'Senior', minRating: 1500, minMatches: 15 },
  Senior: { nextRank: 'Expert', minRating: 1900, minMatches: 20 },
};

export const ARENA_RATING_DELTA = {
  win: 20,
  lose: -10,
  draw: 0,
} as const;

// Bot daily rating cap is disabled until ranked bot farming rules are enabled.
export const ARENA_BOT_DAILY_RATING_CAP: number | null = null;

export const ARENA_QUESTION_MIX: Record<
  ArenaRank,
  Record<ArenaDifficulty, number>
> = {
  Beginner: { easy: 4, medium: 1, hard: 0 },
  Fresher: { easy: 2, medium: 2, hard: 1 },
  Senior: { easy: 1, medium: 2, hard: 2 },
  Expert: { easy: 0, medium: 2, hard: 3 },
};

export const ARENA_QUESTION_TIME: Record<ArenaDifficulty, number> = {
  easy: 25,
  medium: 45,
  hard: 60,
};

export const ARENA_BASE_SCORE: Record<ArenaDifficulty, number> = {
  easy: 20,
  medium: 40,
  hard: 60,
};

export const ARENA_DIFFICULTY_ORDER: Record<ArenaDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const ARENA_BOT_BY_RANK: Record<ArenaRank, ArenaBotDifficulty> = {
  Beginner: 'easy',
  Fresher: 'medium',
  Senior: 'hard',
  Expert: 'elite',
};

export const ARENA_BOT_ACCURACY: Record<ArenaBotDifficulty, number> = {
  easy: 0.45,
  medium: 0.65,
  hard: 0.8,
  elite: 0.9,
};

export const ARENA_BOT_DELAY_SECONDS: Record<
  ArenaBotDifficulty,
  { min: number; max: number }
> = {
  easy: { min: 8, max: 15 },
  medium: { min: 5, max: 10 },
  hard: { min: 2, max: 7 },
  elite: { min: 1, max: 5 },
};
