import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { World, WorldSchema } from './schemas/world.schema';
import { Level, LevelSchema } from './schemas/level.schema';
import { Node, NodeSchema } from './schemas/node.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Chapter, ChapterSchema } from '../chapters/schemas/chapter.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { EasyRoadmapService } from './services/easy-roadmap.service';
import { HardRoadmapService } from './services/hard-roadmap.service';
import { MediumRoadmapService } from './services/medium-roadmap.service';
import { RoadmapAiContextService } from './services/roadmap-ai-context.service';
import { RoadmapChallengeLoaderService } from './services/roadmap-challenge-loader.service';
import { RoadmapQueryService } from './services/roadmap-query.service';
import { RoadmapReviewService } from './services/roadmap-review.service';
import { RoadmapStatusService } from './services/roadmap-status.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: World.name, schema: WorldSchema },
      { name: Level.name, schema: LevelSchema },
      { name: Node.name, schema: NodeSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [RoadmapController],
  providers: [
    RoadmapService,
    EasyRoadmapService,
    HardRoadmapService,
    MediumRoadmapService,
    RoadmapAiContextService,
    RoadmapChallengeLoaderService,
    RoadmapQueryService,
    RoadmapReviewService,
    RoadmapStatusService,
  ],
  exports: [RoadmapService],
})
export class RoadmapModule {}
