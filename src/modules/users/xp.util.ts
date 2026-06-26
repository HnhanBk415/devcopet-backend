export const ROADMAP_NODE_XP = {
  easy: 50,
  medium: 100,
  hard: 150,
} as const;

export const BASIC_LESSON_XP = 100;
export const DSA_LESSON_XP = 150;
export const BATTLE_WIN_XP = 150;

export function getXpThresholdForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.floor(level));
  return (
    ((normalizedLevel * (normalizedLevel + 1) * (2 * normalizedLevel + 1)) /
      6) *
    1000
  );
}

export function getNextLevelXp(currentLevel: number): number {
  return getXpThresholdForLevel(Math.max(1, Math.floor(currentLevel)) + 1);
}

export function calculateLevelFromXp(lifetimeXp: number): number {
  const xp = Math.max(0, Math.floor(lifetimeXp));
  let level = 1;

  while (xp >= getXpThresholdForLevel(level + 1)) {
    level++;
  }

  return level;
}

export function getLessonRewardXp(courseSlug?: string | null): number {
  return courseSlug?.toLowerCase().includes('dsa')
    ? DSA_LESSON_XP
    : BASIC_LESSON_XP;
}
