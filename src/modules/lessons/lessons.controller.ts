import { Controller, Get, Param } from '@nestjs/common';
import { LessonsService } from './lessons.service';

@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('chapters/:chapterId/lessons')
  async findLessonsByChapter(@Param('chapterId') chapterId: string) {
    return this.lessonsService.findByChapterId(chapterId);
  }

  @Get('lessons/:lessonId')
  async findOne(@Param('lessonId') lessonId: string) {
    return this.lessonsService.findById(lessonId);
  }
}
