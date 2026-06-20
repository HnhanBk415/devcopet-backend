import { Injectable } from '@nestjs/common';
import type { AiRoadmapContext, RoadmapMode } from '../ai-chat/ai-chat.types';
import { EasyRoadmapService } from './services/easy-roadmap.service';
import { HardRoadmapService } from './services/hard-roadmap.service';
import { MediumRoadmapService } from './services/medium-roadmap.service';
import { RoadmapAiContextService } from './services/roadmap-ai-context.service';

@Injectable()
export class RoadmapService {
  constructor(
    private readonly easyRoadmapService: EasyRoadmapService,
    private readonly mediumRoadmapService: MediumRoadmapService,
    private readonly hardRoadmapService: HardRoadmapService,
    private readonly roadmapAiContextService: RoadmapAiContextService,
  ) {}

  async getEasyRoadmap(courseSlug: string) {
    return this.easyRoadmapService.getRoadmap(courseSlug);
  }

  async getMediumRoadmap(courseSlug: string) {
    return this.mediumRoadmapService.getRoadmap(courseSlug);
  }

  async getHardRoadmap(courseSlug: string) {
    return this.hardRoadmapService.getRoadmap(courseSlug);
  }

  async getEasyNodeChallenge(nodeId: string) {
    return this.easyRoadmapService.getNodeChallenge(nodeId);
  }

  async getMediumNodeChallenge(nodeId: string) {
    return this.mediumRoadmapService.getNodeChallenge(nodeId);
  }

  async getHardNodeChallenge(nodeId: string) {
    return this.hardRoadmapService.getNodeChallenge(nodeId);
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

  async submitHardNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
  ) {
    return this.hardRoadmapService.submitNodeChallenge(nodeId, payload);
  }

  async getAiRoadmapContext(
    mode: RoadmapMode,
    nodeId: string,
  ): Promise<AiRoadmapContext> {
    return this.roadmapAiContextService.getContext(mode, nodeId);
  }
}
