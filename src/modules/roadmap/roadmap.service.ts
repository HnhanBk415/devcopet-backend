import { Injectable } from '@nestjs/common';
import type { AiRoadmapContext, RoadmapMode } from '../ai-chat/ai-chat.types';
import { EasyRoadmapService } from './services/easy-roadmap.service';
import { MediumRoadmapService } from './services/medium-roadmap.service';
import { RoadmapAiContextService } from './services/roadmap-ai-context.service';

@Injectable()
export class RoadmapService {
  constructor(
    private readonly easyRoadmapService: EasyRoadmapService,
    private readonly mediumRoadmapService: MediumRoadmapService,
    private readonly roadmapAiContextService: RoadmapAiContextService,
  ) {}

  async getEasyRoadmap(courseSlug: string) {
    return this.easyRoadmapService.getRoadmap(courseSlug);
  }

  async getMediumRoadmap(courseSlug: string) {
    return this.mediumRoadmapService.getRoadmap(courseSlug);
  }

  async getEasyNodeChallenge(nodeId: string) {
    return this.easyRoadmapService.getNodeChallenge(nodeId);
  }

  async getMediumNodeChallenge(nodeId: string) {
    return this.mediumRoadmapService.getNodeChallenge(nodeId);
  }

  async submitEasyNodeChallenge(nodeId: string, selectedOptionId: string) {
    return this.easyRoadmapService.submitNodeChallenge(
      nodeId,
      selectedOptionId,
    );
  }

  async submitMediumNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
  ) {
    return this.mediumRoadmapService.submitNodeChallenge(nodeId, payload);
  }

  async getAiRoadmapContext(
    mode: RoadmapMode,
    nodeId: string,
  ): Promise<AiRoadmapContext> {
    return this.roadmapAiContextService.getContext(mode, nodeId);
  }
}
