import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('lessons/:lessonId/quiz')
  @UseGuards(JwtAuthGuard)
  async findQuizByLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.quizzesService.findByLessonId(lessonId, req.user.userId);
  }

  @Post('quizzes/:quizId/submit')
  @UseGuards(JwtAuthGuard)
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body() body: SubmitQuizDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.quizzesService.submitQuiz(
      quizId,
      body.answers,
      req.user.userId,
    );
  }
}
