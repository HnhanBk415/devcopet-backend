export function getPetXpThresholdForLevel(level: number): number {
  const normalizedLevel = Math.floor(level);
  if (normalizedLevel <= 0) return 0;

  let total = 0;
  for (let n = 1; n <= normalizedLevel; n++) {
    total += Math.pow(n, n) * 100;
  }

  return total;
}

export function calculatePetLevelFromTotalXp(totalPetXp: number): number {
  const xp = Math.max(0, Math.floor(totalPetXp));
  let level = 1;

  while (xp >= getPetXpThresholdForLevel(level + 1)) {
    level++;
  }

  return level;
}

export function getPetCurrentLevelProgress(totalPetXp: number): {
  level: number;
  currentLevelXp: number;
  levelRequiredExp: number;
  nextLevelRequiredXp: number;
  nextLevelThresholdXp: number;
  progressPercent: number;
} {
  const xp = Math.max(0, Math.floor(totalPetXp));
  const level = calculatePetLevelFromTotalXp(xp);
  const currentLevelThresholdXp =
    level <= 1 ? 0 : getPetXpThresholdForLevel(level);
  const nextLevelThresholdXp =
    level <= 1
      ? getPetXpThresholdForLevel(1)
      : getPetXpThresholdForLevel(level + 1);
  const nextLevelRequiredXp = nextLevelThresholdXp - currentLevelThresholdXp;
  const currentLevelXp = Math.min(
    nextLevelRequiredXp,
    Math.max(0, xp - currentLevelThresholdXp),
  );
  const levelRequiredExp =
    level <= 1 ? getPetXpThresholdForLevel(1) : currentLevelThresholdXp;

  return {
    level,
    currentLevelXp,
    levelRequiredExp,
    nextLevelRequiredXp,
    nextLevelThresholdXp,
    progressPercent:
      nextLevelRequiredXp === 0
        ? 100
        : Math.min(
            100,
            Math.round((currentLevelXp / nextLevelRequiredXp) * 100),
          ),
  };
}

export function resolveTotalPetXpFromStoredPet(input: {
  level?: number;
  exp?: number;
}): number {
  const storedExp = Math.max(0, Math.floor(input.exp ?? 0));
  const storedLevel = Math.max(1, Math.floor(input.level ?? 1));
  const calculatedLevel = calculatePetLevelFromTotalXp(storedExp);

  if (storedLevel > calculatedLevel) {
    return getPetXpThresholdForLevel(storedLevel) + storedExp;
  }

  return storedExp;
}
