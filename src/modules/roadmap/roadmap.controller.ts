import { Controller, Get, Param } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';

@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':courseSlug/easy')
  async getEasyRoadmap(@Param('courseSlug') courseSlug: string) {
    return this.roadmapService.getEasyRoadmap(courseSlug);
  }
}
