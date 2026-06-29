import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chapter, ChapterSchema } from '../chapters/schemas/chapter.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { GeminiProvider } from '../ai-chat/providers/gemini.provider';
import { LearningHistoryModule } from '../learning-history/learning-history.module';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import {
  UserPersonality,
  UserPersonalitySchema,
} from '../onboarding/schemas/user-personality.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from '../progress/schemas/lesson-progress.schema';
import {
  RoadmapProgress,
  RoadmapProgressSchema,
} from '../roadmap/schemas/roadmap-progress.schema';
import { UsersModule } from '../users/users.module';
import { DailyMissionsController } from './daily-missions.controller';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { NotificationsController } from './notifications.controller';
import {
  DailyMissionSet,
  DailyMissionSetSchema,
} from './schemas/daily-mission-set.schema';
import {
  DailyMissionSummary,
  DailyMissionSummarySchema,
} from './schemas/daily-mission-summary.schema';
import {
  MissionNotification,
  MissionNotificationSchema,
} from './schemas/mission-notification.schema';
import {
  MissionRewardGrant,
  MissionRewardGrantSchema,
} from './schemas/mission-reward-grant.schema';
import { MissionAiSelectorService } from './services/mission-ai-selector.service';
import { MissionCandidateService } from './services/mission-candidate.service';
import { MissionFallbackService } from './services/mission-fallback.service';
import { MissionNotificationService } from './services/mission-notification.service';
import { MissionRewardService } from './services/mission-reward.service';
import { MissionSnapshotService } from './services/mission-snapshot.service';
import { MissionSummaryService } from './services/mission-summary.service';
import { MissionValidatorService } from './services/mission-validator.service';

@Module({
  imports: [
    UsersModule,
    LearningHistoryModule,
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: RoadmapProgress.name, schema: RoadmapProgressSchema },
      { name: UserPersonality.name, schema: UserPersonalitySchema },
      { name: DailyMissionSet.name, schema: DailyMissionSetSchema },
      { name: DailyMissionSummary.name, schema: DailyMissionSummarySchema },
      { name: MissionRewardGrant.name, schema: MissionRewardGrantSchema },
      { name: MissionNotification.name, schema: MissionNotificationSchema },
    ]),
  ],
  controllers: [
    MissionsController,
    DailyMissionsController,
    NotificationsController,
  ],
  providers: [
    MissionsService,
    GeminiProvider,
    MissionSnapshotService,
    MissionCandidateService,
    MissionAiSelectorService,
    MissionFallbackService,
    MissionValidatorService,
    MissionRewardService,
    MissionSummaryService,
    MissionNotificationService,
  ],
  exports: [MissionsService, MissionNotificationService],
})
export class MissionsModule {}
