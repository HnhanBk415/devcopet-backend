import type { ChallengeOptionId } from '../roadmap.types';

export const EASY_NODE_DURATION_MINUTES = 1;
export const ADVANCED_NODE_COUNT_PER_CHAPTER = 5;
export const CHALLENGE_OPTION_IDS: ChallengeOptionId[] = ['A', 'B', 'C', 'D'];
export const ADVANCED_NODE_ID_PATTERN = /^(.+)-(medium|hard)-c(\d+)-n(\d+)$/;

export function groupBy<T>(
  items: T[],
  getKey: (item: T) => string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }

  return groups;
}

export function isChallengeOptionId(value: string): value is ChallengeOptionId {
  return CHALLENGE_OPTION_IDS.includes(value as ChallengeOptionId);
}

export function isStringRecord(
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === 'string');
}

export function isSameStringRecord(
  received: Record<string, string>,
  expected: Record<string, string>,
): boolean {
  const expectedKeys = Object.keys(expected);

  if (Object.keys(received).length !== expectedKeys.length) {
    return false;
  }

  return expectedKeys.every((key) => received[key] === expected[key]);
}

export function toDeterministicCompletedAt(nodeId: string): string {
  const timestamp = Number.parseInt(nodeId.slice(-8), 16);
  const completedAt = new Date(Date.UTC(2026, 0, 1));
  completedAt.setSeconds(Number.isNaN(timestamp) ? 0 : timestamp % 86400);

  return completedAt.toISOString();
}

export function capitalizeMode(mode: 'medium' | 'hard'): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}
