import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningHistoryService } from './learning-history.service';
import {
  ActivityEvent,
  ActivityEventSchema,
} from './schemas/activity-event.schema';
import {
  LearningAttempt,
  LearningAttemptSchema,
} from './schemas/learning-attempt.schema';
import {
  UserLearningProfile,
  UserLearningProfileSchema,
} from './schemas/user-learning-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningAttempt.name, schema: LearningAttemptSchema },
      { name: ActivityEvent.name, schema: ActivityEventSchema },
      { name: UserLearningProfile.name, schema: UserLearningProfileSchema },
    ]),
  ],
  providers: [LearningHistoryService],
  exports: [LearningHistoryService, MongooseModule],
})
export class LearningHistoryModule {}
