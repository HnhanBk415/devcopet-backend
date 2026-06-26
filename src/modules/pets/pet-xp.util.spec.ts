import {
  calculatePetLevelFromTotalXp,
  getPetCurrentLevelProgress,
  getPetXpThresholdForLevel,
  resolveTotalPetXpFromStoredPet,
} from './pet-xp.util';

describe('Pet XP helpers', () => {
  it('calculates cumulative pet XP thresholds', () => {
    expect(getPetXpThresholdForLevel(0)).toBe(0);
    expect(getPetXpThresholdForLevel(1)).toBe(100);
    expect(getPetXpThresholdForLevel(2)).toBe(500);
    expect(getPetXpThresholdForLevel(3)).toBe(3200);
    expect(getPetXpThresholdForLevel(4)).toBe(28800);
    expect(getPetXpThresholdForLevel(5)).toBe(341300);
  });

  it('calculates pet level from cumulative pet XP', () => {
    expect(calculatePetLevelFromTotalXp(0)).toBe(1);
    expect(calculatePetLevelFromTotalXp(499)).toBe(1);
    expect(calculatePetLevelFromTotalXp(500)).toBe(2);
    expect(calculatePetLevelFromTotalXp(3200)).toBe(3);
  });

  it('returns current level progress values for level 2', () => {
    expect(getPetCurrentLevelProgress(500)).toEqual({
      level: 2,
      currentLevelXp: 0,
      levelRequiredExp: 500,
      nextLevelRequiredXp: 2700,
      nextLevelThresholdXp: 3200,
      progressPercent: 0,
    });
  });

  it('returns level 1 progress against the first threshold', () => {
    expect(getPetCurrentLevelProgress(0)).toEqual({
      level: 1,
      currentLevelXp: 0,
      levelRequiredExp: 100,
      nextLevelRequiredXp: 100,
      nextLevelThresholdXp: 100,
      progressPercent: 0,
    });
  });

  it.each([
    [1, 0, 100],
    [2, 500, 500],
    [3, 3200, 3200],
    [4, 28800, 28800],
  ])(
    'uses current level threshold as display denominator for level %s',
    (_level, totalExp, levelRequiredExp) => {
      expect(getPetCurrentLevelProgress(totalExp).levelRequiredExp).toBe(
        levelRequiredExp,
      );
    },
  );

  it('maps old per-level pet progress into cumulative pet XP', () => {
    expect(resolveTotalPetXpFromStoredPet({ level: 2, exp: 0 })).toBe(500);
    expect(resolveTotalPetXpFromStoredPet({ level: 2, exp: 25 })).toBe(525);
  });
});
