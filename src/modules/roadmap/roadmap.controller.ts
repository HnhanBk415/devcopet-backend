import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';

@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':courseSlug/easy')
  async getEasyRoadmap(@Param('courseSlug') courseSlug: string) {
    return this.roadmapService.getEasyRoadmap(courseSlug);
  }

  @Get('easy/nodes/:nodeId/challenge')
  async getEasyNodeChallenge(@Param('nodeId') nodeId: string) {
    return this.roadmapService.getEasyNodeChallenge(nodeId);
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
}
