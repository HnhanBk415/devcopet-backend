import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { Chapter, ChapterSchema } from './schemas/chapter.schema';
import { CoursesModule } from '../courses/courses.module';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from '../progress/schemas/lesson-progress.schema';

@Module({
  imports: [
    CoursesModule,
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
    ]),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
