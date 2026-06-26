import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MissionsService } from './missions.service';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyMissions(@Req() req: { user: { userId: string } }) {
    return this.missionsService.getMyMissions(req.user.userId);
  }
}
