import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChaptersLessonsController } from './chapters-lessons.controller';
import { ChaptersLessonsService } from './chapters-lessons.service';
import { Chapter, ChapterSchema } from './schemas/chapter.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [ChaptersLessonsController],
  providers: [ChaptersLessonsService],
  exports: [ChaptersLessonsService],
})
export class ChaptersLessonsModule {}
