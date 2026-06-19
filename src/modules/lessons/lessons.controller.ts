import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('chapters/:chapterId/lessons')
  async findLessonsByChapter(
    @Param('chapterId') chapterId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.lessonsService.findByChapterId(chapterId, req.user.userId);
  }

  @Get('lessons/:lessonId')
  async findOne(
    @Param('lessonId') lessonId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.lessonsService.findById(lessonId, req.user.userId);
  }
}
