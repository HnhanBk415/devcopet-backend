import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiChatLog, AiChatLogSchema } from './schemas/ai-chat-log.schema';
import { AiChatUsage, AiChatUsageSchema } from './schemas/ai-chat-usage.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  UserPersonality,
  UserPersonalitySchema,
} from '../onboarding/schemas/user-personality.schema';
import { RoadmapModule } from '../roadmap/roadmap.module';

@Module({
  imports: [
    RoadmapModule,
    MongooseModule.forFeature([
      { name: AiChatLog.name, schema: AiChatLogSchema },
      { name: AiChatUsage.name, schema: AiChatUsageSchema },
      { name: User.name, schema: UserSchema },
      { name: UserPersonality.name, schema: UserPersonalitySchema },
    ]),
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService],
})
export class AiChatModule {}
