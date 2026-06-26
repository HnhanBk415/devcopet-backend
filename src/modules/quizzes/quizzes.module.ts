import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from '../progress/schemas/lesson-progress.schema';
import { LessonsModule } from '../lessons/lessons.module';
import { ProgressModule } from '../progress/progress.module';
import { UsersModule } from '../users/users.module';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    LessonsModule,
    ProgressModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
