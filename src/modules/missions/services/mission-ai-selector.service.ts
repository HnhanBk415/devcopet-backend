import { Injectable } from '@nestjs/common';
import type {
  LearningSnapshot,
  MissionCandidate,
  MissionKind,
  MissionSelectionResult,
} from '../missions.types';
import { MissionFallbackService } from './mission-fallback.service';

@Injectable()
export class MissionAiSelectorService {
  constructor(private readonly fallback: MissionFallbackService) {}

  select(
    snapshot: LearningSnapshot,
    candidates: MissionCandidate[],
    kind: MissionKind,
  ): MissionSelectionResult {
    return this.fallback.select(snapshot, candidates, kind);
  }
}
