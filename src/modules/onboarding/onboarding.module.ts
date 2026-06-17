import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import {
  AssessmentResult,
  AssessmentResultSchema,
} from './schemas/assessment-result.schema';
import {
  UserPersonality,
  UserPersonalitySchema,
} from './schemas/user-personality.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssessmentResult.name, schema: AssessmentResultSchema },
      { name: UserPersonality.name, schema: UserPersonalitySchema },
    ]),
    UsersModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
