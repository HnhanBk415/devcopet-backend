import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoadmapService } from './roadmap.service';
import type { RoadmapMode } from './roadmap.types';

type RoadmapRequest = {
  user: { userId: string };
};

function getRoadmapUserId(req: RoadmapRequest): string {
  return req.user.userId;
}

function parseRoadmapMode(mode: string): RoadmapMode {
  if (mode === 'easy' || mode === 'medium' || mode === 'hard') {
    return mode;
  }

  throw new BadRequestException('mode must be one of easy, medium, or hard.');
}

@UseGuards(JwtAuthGuard)
@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':courseSlug/summary')
  async getRoadmapSummary(
    @Param('courseSlug') courseSlug: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.getRoadmapSummary(
      courseSlug,
      getRoadmapUserId(req),
    );
  }

  @Get(':courseSlug/easy')
  async getEasyRoadmap(
    @Param('courseSlug') courseSlug: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.getEasyRoadmap(
      courseSlug,
      getRoadmapUserId(req),
    );
  }

  @Get(':courseSlug/medium')
  async getMediumRoadmap(
    @Param('courseSlug') courseSlug: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.getMediumRoadmap(
      courseSlug,
      getRoadmapUserId(req),
    );
  }

  @Get(':courseSlug/hard')
  async getHardRoadmap(
    @Param('courseSlug') courseSlug: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.getHardRoadmap(
      courseSlug,
      getRoadmapUserId(req),
    );
  }

  @Post(':courseSlug/:mode/reset-progress')
  async resetRoadmapProgress(
    @Param('courseSlug') courseSlug: string,
    @Param('mode') mode: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.resetRoadmapProgress(
      getRoadmapUserId(req),
      courseSlug,
      parseRoadmapMode(mode),
    );
  }

  @Post(':courseSlug/:mode/nodes/:nodeId/session/start')
  async startChallengeSession(
    @Param('courseSlug') courseSlug: string,
    @Param('mode') mode: string,
    @Param('nodeId') nodeId: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.startChallengeSession(
      courseSlug,
      parseRoadmapMode(mode),
      nodeId,
      getRoadmapUserId(req),
    );
  }

  @Get('easy/nodes/:nodeId/challenge')
  async getEasyNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.getEasyNodeChallenge(
      nodeId,
      getRoadmapUserId(req),
    );
  }

  @Get('medium/nodes/:nodeId/challenge')
  async getMediumNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.getMediumNodeChallenge(
      nodeId,
      getRoadmapUserId(req),
    );
  }

  @Get('hard/nodes/:nodeId/challenge')
  async getHardNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.getHardNodeChallenge(
      nodeId,
      getRoadmapUserId(req),
    );
  }

  @Post('easy/nodes/:nodeId/challenge/submit')
  async submitEasyNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Body() payload: Record<string, unknown>,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.submitEasyNodeChallenge(
      nodeId,
      typeof payload.selectedOptionId === 'string'
        ? payload.selectedOptionId
        : '',
      getRoadmapUserId(req),
      {
        sessionId:
          typeof payload.sessionId === 'string' ? payload.sessionId : undefined,
        submissionId:
          typeof payload.submissionId === 'string'
            ? payload.submissionId
            : undefined,
        durationSeconds:
          typeof payload.durationSeconds === 'number'
            ? payload.durationSeconds
            : undefined,
        hintUsed:
          typeof payload.hintUsed === 'number' ? payload.hintUsed : undefined,
      },
    );
  }

  @Post('medium/nodes/:nodeId/challenge/submit')
  async submitMediumNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Body() payload: Record<string, unknown>,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.submitMediumNodeChallenge(
      nodeId,
      payload,
      getRoadmapUserId(req),
    );
  }

  @Post('hard/nodes/:nodeId/challenge/submit')
  async submitHardNodeChallenge(
    @Param('nodeId') nodeId: string,
    @Body() payload: Record<string, unknown>,
    @Req() req: RoadmapRequest,
  ) {
    return this.roadmapService.submitHardNodeChallenge(
      nodeId,
      payload,
      getRoadmapUserId(req),
    );
  }
}
