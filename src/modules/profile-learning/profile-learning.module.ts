import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { ProfileLearningController } from './profile-learning.controller';
import { ProfileLearningService } from './profile-learning.service';

@Module({
  imports: [CoursesModule, RoadmapModule],
  controllers: [ProfileLearningController],
  providers: [ProfileLearningService],
})
export class ProfileLearningModule {}
