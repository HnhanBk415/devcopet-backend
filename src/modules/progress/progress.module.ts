import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { Chapter, ChapterSchema } from '../chapters/schemas/chapter.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { Attempt, AttemptSchema } from './schemas/attempt.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from './schemas/lesson-progress.schema';
import {
  WorldProgress,
  WorldProgressSchema,
} from './schemas/world-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attempt.name, schema: AttemptSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: WorldProgress.name, schema: WorldProgressSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
