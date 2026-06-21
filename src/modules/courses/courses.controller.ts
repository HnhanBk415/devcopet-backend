import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedRequest = {
  user: { userId: string };
};

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get(':courseId')
  async findOne(@Param('courseId') courseId: string) {
    return this.coursesService.findByIdOrSlug(courseId);
  }

  @Post(':courseId/reset-progress')
  @UseGuards(JwtAuthGuard)
  async resetProgress(
    @Param('courseId') courseId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.resetProgress(courseId, req.user.userId);
  }
}
