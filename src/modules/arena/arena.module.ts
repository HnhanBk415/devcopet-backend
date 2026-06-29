import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ArenaController } from './arena.controller';
import { ArenaGateway } from './arena.gateway';
import { ArenaAuthService } from './services/arena-auth.service';
import { ArenaBotService } from './services/arena-bot.service';
import { ArenaMatchmakingService } from './services/arena-matchmaking.service';
import { ArenaQuestionEvaluatorService } from './services/arena-question-evaluator.service';
import { ArenaQuestionService } from './services/arena-question.service';
import { ArenaQueryService } from './services/arena-query.service';
import { ArenaRatingService } from './services/arena-rating.service';
import { ArenaResultService } from './services/arena-result.service';
import { ArenaRoomService } from './services/arena-room.service';
import { ArenaScoreService } from './services/arena-score.service';
import { ArenaMatch, ArenaMatchSchema } from './schemas/arena-match.schema';
import {
  ArenaQuestion,
  ArenaQuestionSchema,
} from './schemas/arena-question.schema';
import { LearningHistoryModule } from '../learning-history/learning-history.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [
    LearningHistoryModule,
    MissionsModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ArenaQuestion.name, schema: ArenaQuestionSchema },
      { name: ArenaMatch.name, schema: ArenaMatchSchema },
    ]),
  ],
  controllers: [ArenaController],
  providers: [
    ArenaGateway,
    ArenaAuthService,
    ArenaMatchmakingService,
    ArenaRoomService,
    ArenaQuestionService,
    ArenaQuestionEvaluatorService,
    ArenaQueryService,
    ArenaScoreService,
    ArenaBotService,
    ArenaResultService,
    ArenaRatingService,
  ],
})
export class ArenaModule {}
