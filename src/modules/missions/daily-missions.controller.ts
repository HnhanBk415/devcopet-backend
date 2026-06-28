import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MissionsService } from './missions.service';

@UseGuards(JwtAuthGuard)
@Controller('daily-missions')
export class DailyMissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get('today')
  getToday(@Req() req: { user: { userId: string } }) {
    return this.missionsService.getToday(req.user.userId);
  }

  @Patch(':missionId/opened')
  patchOpenMission(
    @Req() req: { user: { userId: string } },
    @Param('missionId') missionId: string,
  ) {
    return this.missionsService.openMission(req.user.userId, missionId);
  }

  @Get('history')
  getHistory(
    @Req() req: { user: { userId: string } },
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.missionsService.getHistory(req.user.userId, days);
  }

  @Get('summary')
  getSummary(
    @Req() req: { user: { userId: string } },
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.missionsService.getSummary(req.user.userId, days);
  }

  @Get('notifications')
  getNotifications(
    @Req() req: { user: { userId: string } },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.missionsService.getNotifications(req.user.userId, limit);
  }

  @Patch('notifications/:notificationId/read')
  markNotificationRead(
    @Req() req: { user: { userId: string } },
    @Param('notificationId') notificationId: string,
  ) {
    return this.missionsService.markNotificationRead(
      req.user.userId,
      notificationId,
    );
  }
}
