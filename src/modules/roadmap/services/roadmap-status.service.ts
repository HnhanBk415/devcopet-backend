import { Injectable } from '@nestjs/common';
import type { RoadmapStatus } from '../roadmap.types';

@Injectable()
export class RoadmapStatusService {
  getEasyStatus(globalLessonIndex: number): RoadmapStatus {
    if (globalLessonIndex <= 2) return 'completed';
    if (globalLessonIndex <= 6) return 'available';
    return 'locked';
  }

  getAdvancedStatus(globalNodeIndex: number): RoadmapStatus {
    if (globalNodeIndex <= 1) return 'completed';
    if (globalNodeIndex <= 5) return 'available';
    return 'locked';
  }
}
