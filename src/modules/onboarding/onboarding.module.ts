import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import {
  AssessmentResult,
  AssessmentResultSchema,
} from './schemas/assessment-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssessmentResult.name, schema: AssessmentResultSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
