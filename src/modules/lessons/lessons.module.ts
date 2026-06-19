import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Chapter, ChapterSchema } from '../chapters/schemas/chapter.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from '../progress/schemas/lesson-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
