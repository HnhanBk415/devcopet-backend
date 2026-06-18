import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';

@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':courseSlug/easy')
  async getEasyRoadmap(@Param('courseSlug') courseSlug: string) {
    return this.roadmapService.getEasyRoadmap(courseSlug);
  }

  @Get(':courseSlug/medium')
  async getMediumRoadmap(@Param('courseSlug') courseSlug: string) {
    return this.roadmapService.getMediumRoadmap(courseSlug);
  }

  @Get('easy/nodes/:nodeId/challenge')
  async getEasyNodeChallenge(@Param('nodeId') nodeId: string) {
    return this.roadmapService.getEasyNodeChallenge(nodeId);
  }

  @Get('medium/nodes/:nodeId/challenge')
  async getMediumNodeChallenge(@Param('nodeId') nodeId: string) {
    return this.roadmapService.getMediumNodeChallenge(nodeId);
  }

  @Post('easy/nodes/:nodeId/challenge/submit')
  async submitEasyNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Body('selectedOptionId') selectedOptionId: string,
  ) {
    return this.roadmapService.submitEasyNodeChallenge(
      nodeId,
      selectedOptionId,
    );
  }

  @Post('medium/nodes/:nodeId/challenge/submit')
  async submitMediumNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.roadmapService.submitMediumNodeChallenge(nodeId, payload);
  }
}
