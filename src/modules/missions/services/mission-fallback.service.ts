import { Injectable } from '@nestjs/common';
import type {
  AiSelectedMission,
  LearningSnapshot,
  MissionCandidate,
  MissionKind,
  MissionSelectionResult,
} from '../missions.types';

@Injectable()
export class MissionFallbackService {
  select(
    snapshot: LearningSnapshot,
    candidates: MissionCandidate[],
    kind: MissionKind,
  ): MissionSelectionResult {
    const count = 5;
    const ranked = [...candidates].sort(
      (a, b) => this.score(b, snapshot, kind) - this.score(a, snapshot, kind),
    );
    const selected: MissionCandidate[] = [];
    const usedActions = new Set<string>();

    for (const candidate of ranked) {
      if (selected.length >= count) break;
      if (usedActions.has(candidate.actionType)) continue;
      selected.push(candidate);
      usedActions.add(candidate.actionType);
    }
    for (const candidate of ranked) {
      if (selected.length >= count) break;
      if (selected.some((item) => item.candidateId === candidate.candidateId))
        continue;
      selected.push(candidate);
    }

    return {
      source: 'FALLBACK',
      missions: selected
        .slice(0, count)
        .map((candidate) => this.toSelection(candidate, snapshot)),
      analysisSummary: {
        focusTopics: snapshot.weakTopics.slice(0, 3),
        confidence: snapshot.confidence,
        selection: 'deterministic-fallback',
      },
    };
  }

  private score(
    candidate: MissionCandidate,
    snapshot: LearningSnapshot,
    kind: MissionKind,
  ) {
    void kind;
    let score = 0;
    if (candidate.topic && snapshot.weakTopics.includes(candidate.topic))
      score += 40;
    if (candidate.actionType === 'CONTINUE_LESSON') score += 35;
    if (candidate.actionType === 'RETRY_NODE') score += 30;
    if (candidate.actionType === 'PRACTICE_TOPIC') score += 25;
    if (candidate.actionType === 'REVIEW_LESSON') score += 15;
    if (candidate.actionType === 'FEED_PET') score += 5;
    if (candidate.difficulty === snapshot.preferredDifficulty) score += 10;
    return score;
  }

  private toSelection(
    candidate: MissionCandidate,
    snapshot: LearningSnapshot,
  ): AiSelectedMission {
    const isWeak = Boolean(
      candidate.topic && snapshot.weakTopics.includes(candidate.topic),
    );
    return {
      candidateId: candidate.candidateId,
      title: candidate.title,
      message: candidate.message,
      reasonCode:
        candidate.actionType === 'RETRY_NODE'
          ? 'RETRY_FAILED'
          : isWeak
            ? 'WEAK_TOPIC'
            : candidate.actionType === 'CONTINUE_LESSON'
              ? 'CONTINUE_PROGRESS'
              : candidate.actionType === 'FEED_PET'
                ? 'DAILY_HABIT'
                : 'REVIEW',
    };
  }
}
