import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonalityEngineService } from './personality-engine.service';
import { PetPersonalizationService } from './pet-personalization.service';
import {
  UserPersonality,
  UserPersonalitySchema,
} from '../onboarding/schemas/user-personality.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPersonality.name, schema: UserPersonalitySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [PersonalityEngineService, PetPersonalizationService],
  exports: [PersonalityEngineService, PetPersonalizationService],
})
export class PersonalityEngineModule {}
