import { Injectable } from '@nestjs/common';
import type {
  AiSelectedMission,
  MissionCandidate,
  MissionKind,
} from '../missions.types';

@Injectable()
export class MissionValidatorService {
  validate(
    selected: AiSelectedMission[],
    candidates: MissionCandidate[],
    kind: MissionKind,
  ) {
    void kind;
    const requiredCount = 5;
    if (!Array.isArray(selected) || selected.length !== requiredCount) {
      throw new Error(`AI must select exactly ${requiredCount} mission(s).`);
    }
    const candidatesById = new Map(
      candidates.map((candidate) => [candidate.candidateId, candidate]),
    );
    const ids = selected.map((mission) => mission.candidateId);
    if (new Set(ids).size !== ids.length) {
      throw new Error('AI selected duplicate candidateId values.');
    }

    for (const mission of selected) {
      if (!candidatesById.has(mission.candidateId)) {
        throw new Error(`Unknown candidateId: ${mission.candidateId}`);
      }
      if (!mission.title?.trim() || mission.title.trim().length > 45) {
        throw new Error('Mission title must contain 1-45 characters.');
      }
      if (!mission.message?.trim() || mission.message.trim().length > 120) {
        throw new Error('Mission message must contain 1-120 characters.');
      }
      if (
        ![
          'CONTINUE_PROGRESS',
          'WEAK_TOPIC',
          'RETRY_FAILED',
          'REVIEW',
          'DAILY_HABIT',
          'CHALLENGE',
        ].includes(mission.reasonCode)
      ) {
        throw new Error('Invalid mission reasonCode.');
      }
    }

    const totalMinutes = selected.reduce(
      (sum, mission) =>
        sum + (candidatesById.get(mission.candidateId)?.estimatedMinutes ?? 0),
      0,
    );
    if (totalMinutes < 10 || totalMinutes > 60) {
      throw new Error('Selected mission time budget is invalid.');
    }
    return true;
  }
}
