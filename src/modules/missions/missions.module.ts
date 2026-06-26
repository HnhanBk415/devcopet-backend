import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LessonProgress,
  LessonProgressSchema,
} from '../progress/schemas/lesson-progress.schema';
import {
  RoadmapProgress,
  RoadmapProgressSchema,
} from '../roadmap/schemas/roadmap-progress.schema';
import { Pet, PetSchema } from '../pets/schemas/pet.schema';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: RoadmapProgress.name, schema: RoadmapProgressSchema },
      { name: Pet.name, schema: PetSchema },
    ]),
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}
