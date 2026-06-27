import { Injectable } from '@nestjs/common';
import type { AiRoadmapContext } from '../ai-chat/ai-chat.types';
import type { RoadmapMode, RoadmapSubmitMeta } from './roadmap.types';
import { EasyRoadmapService } from './services/easy-roadmap.service';
import { HardRoadmapService } from './services/hard-roadmap.service';
import { MediumRoadmapService } from './services/medium-roadmap.service';
import { RoadmapAiContextService } from './services/roadmap-ai-context.service';
import { RoadmapStatusService } from './services/roadmap-status.service';

@Injectable()
export class RoadmapService {
  constructor(
    private readonly easyRoadmapService: EasyRoadmapService,
    private readonly mediumRoadmapService: MediumRoadmapService,
    private readonly hardRoadmapService: HardRoadmapService,
    private readonly roadmapAiContextService: RoadmapAiContextService,
    private readonly roadmapStatusService: RoadmapStatusService,
  ) {}

  async getEasyRoadmap(courseSlug: string, userId: string) {
    return this.easyRoadmapService.getRoadmap(courseSlug, userId);
  }

  async getMediumRoadmap(courseSlug: string, userId: string) {
    return this.mediumRoadmapService.getRoadmap(courseSlug, userId);
  }

  async getHardRoadmap(courseSlug: string, userId: string) {
    return this.hardRoadmapService.getRoadmap(courseSlug, userId);
  }

  async getEasyNodeChallenge(nodeId: string, userId: string) {
    return this.easyRoadmapService.getNodeChallenge(nodeId, userId);
  }

  async getMediumNodeChallenge(nodeId: string, userId: string) {
    return this.mediumRoadmapService.getNodeChallenge(nodeId, userId);
  }

  async getHardNodeChallenge(nodeId: string, userId: string) {
    return this.hardRoadmapService.getNodeChallenge(nodeId, userId);
  }

  async submitEasyNodeChallenge(
    nodeId: string,
    selectedOptionId: string,
    userId: string,
    meta?: RoadmapSubmitMeta,
  ) {
    return this.easyRoadmapService.submitNodeChallenge(
      nodeId,
      selectedOptionId,
      userId,
      meta,
    );
  }

  async submitMediumNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
    userId: string,
  ) {
    return this.mediumRoadmapService.submitNodeChallenge(
      nodeId,
      payload,
      userId,
    );
  }

  async submitHardNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
    userId: string,
  ) {
    return this.hardRoadmapService.submitNodeChallenge(nodeId, payload, userId);
  }

  async resetRoadmapProgress(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
  ) {
    await this.roadmapStatusService.resetRoadmapProgress(
      userId,
      courseSlug,
      mode,
    );

    return {
      success: true,
      message: 'Roadmap progress reset.',
      courseSlug,
      mode,
    };
  }

  async getAiRoadmapContext(
    mode: RoadmapMode,
    nodeId: string,
    userId: string,
  ): Promise<AiRoadmapContext> {
    return this.roadmapAiContextService.getContext(mode, nodeId, userId);
  }
}
