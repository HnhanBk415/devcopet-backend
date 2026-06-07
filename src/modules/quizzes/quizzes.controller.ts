import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('lessons/:lessonId/quiz')
  async findQuizByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLessonId(lessonId);
  }

  @Post('quizzes/:quizId/submit')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body() body: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(quizId, body.answers);
  }
}
