import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get(':courseId/chapters')
  async findChaptersByCourse(
    @Param('courseId') courseId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.chaptersService.findByCourseId(courseId, req.user.userId);
  }
}
