import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArenaQueryService } from './services/arena-query.service';

interface JwtRequest {
  user: {
    userId: string;
    email: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('arena')
export class ArenaController {
  constructor(private readonly arenaQueryService: ArenaQueryService) {}

  @Get('me')
  async getMyArenaProfile(@Req() req: JwtRequest) {
    return this.arenaQueryService.getMyProfile(req.user.userId);
  }

  @Get('history')
  async getMyArenaHistory(
    @Req() req: JwtRequest,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.arenaQueryService.getMyHistory(req.user.userId, limit);
  }

  @Get('leaderboard')
  async getArenaLeaderboard(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.arenaQueryService.getLeaderboard(limit);
  }
}
