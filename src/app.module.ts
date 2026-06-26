import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { CoursesModule } from './modules/courses/courses.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PersonalityEngineModule } from './modules/personality-engine/personality-engine.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { ArenaModule } from './modules/arena/arena.module';
import { PetsModule } from './modules/pets/pets.module';
import { MissionsModule } from './modules/missions/missions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),

    AuthModule,
    UsersModule,
    CoursesModule,
    ChaptersModule,
    LessonsModule,
    QuizzesModule,
    RoadmapModule,
    OnboardingModule,
    PersonalityEngineModule,
    AiChatModule,
    ArenaModule,
    PetsModule,
    MissionsModule,
  ],
})
export class AppModule {}
