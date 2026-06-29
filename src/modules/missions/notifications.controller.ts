import {
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MissionNotificationService } from './services/mission-notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: MissionNotificationService,
  ) {}

  @Get('me')
  getMe(
    @Req() req: { user: { userId: string } },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.notificationService.list(req.user.userId, limit, page);
  }

  @Get('me/unread-count')
  getUnreadCount(@Req() req: { user: { userId: string } }) {
    return this.notificationService.unreadCount(req.user.userId);
  }

  @Patch(':notificationId/read')
  async markRead(
    @Req() req: { user: { userId: string } },
    @Param('notificationId') notificationId: string,
  ) {
    const notification = await this.notificationService.markRead(
      req.user.userId,
      notificationId,
    );
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  @Patch('read-all')
  markAllRead(@Req() req: { user: { userId: string } }) {
    return this.notificationService.markAllRead(req.user.userId);
  }
}
