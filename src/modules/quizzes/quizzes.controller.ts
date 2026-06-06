import { Controller, Get, Param } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';

@Controller('lessons')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(':lessonId/quiz')
  async findQuizByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLessonId(lessonId);
  }
}
