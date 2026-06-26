import {
  calculateLevelFromXp,
  getNextLevelXp,
  getXpThresholdForLevel,
} from './xp.util';

describe('XP helpers', () => {
  it('calculates cumulative level thresholds', () => {
    expect(getXpThresholdForLevel(1)).toBe(1000);
    expect(getXpThresholdForLevel(2)).toBe(5000);
    expect(getXpThresholdForLevel(3)).toBe(14000);
    expect(getXpThresholdForLevel(10)).toBe(385000);
  });

  it('calculates level from lifetime XP only', () => {
    expect(calculateLevelFromXp(0)).toBe(1);
    expect(calculateLevelFromXp(4999)).toBe(1);
    expect(calculateLevelFromXp(5000)).toBe(2);
    expect(calculateLevelFromXp(14000)).toBe(3);
  });

  it('returns the next level threshold', () => {
    expect(getNextLevelXp(1)).toBe(5000);
    expect(getNextLevelXp(2)).toBe(14000);
  });
});
