import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { Chapter, ChapterSchema } from './schemas/chapter.schema';
import { CoursesModule } from '../courses/courses.module';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    CoursesModule,
    ProgressModule,
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
