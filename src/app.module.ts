import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { ProfileLearningModule } from './modules/profile-learning/profile-learning.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpThrottlerGuard } from './common/guards/http-throttler.guard';
function getPositiveNumberEnv(
  configService: ConfigService,
  key: string,
  fallback: number,
): number {
  const raw = configService.get<string>(key);
  const parsed = raw ? Number(raw) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: getPositiveNumberEnv(configService, 'RATE_LIMIT_TTL_MS', 60_000),
          limit: getPositiveNumberEnv(
            configService,
            'RATE_LIMIT_REQUESTS',
            300,
          ),
        },
      ],
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
    ProfileLearningModule,
  ],
})
export class AppModule {}
