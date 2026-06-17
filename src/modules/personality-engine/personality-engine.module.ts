import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonalityEngineService } from './personality-engine.service';
import {
  UserPersonality,
  UserPersonalitySchema,
} from '../onboarding/schemas/user-personality.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPersonality.name, schema: UserPersonalitySchema },
    ]),
  ],
  providers: [PersonalityEngineService],
  exports: [PersonalityEngineService],
})
export class PersonalityEngineModule {}
