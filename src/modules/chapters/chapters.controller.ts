import { Controller, Get, Param } from '@nestjs/common';
import { ChaptersService } from './chapters.service';

@Controller('courses')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get(':courseId/chapters')
  async findChaptersByCourse(@Param('courseId') courseId: string) {
    return this.chaptersService.findByCourseId(courseId);
  }
}
