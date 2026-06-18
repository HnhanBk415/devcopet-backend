import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AiChatUsageDocument = HydratedDocument<AiChatUsage>;

@Schema({ timestamps: true, collection: 'ai_chat_usage' })
export class AiChatUsage {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId!: Types.ObjectId | null;

  @Prop({ required: true })
  scope!: 'user' | 'global';

  @Prop({ required: true })
  dateKey!: string;

  @Prop({ default: 0, min: 0 })
  usedCount!: number;

  @Prop({ default: 0, min: 0 })
  dailyLimit!: number;
}

export const AiChatUsageSchema = SchemaFactory.createForClass(AiChatUsage);

AiChatUsageSchema.index({ scope: 1, userId: 1, dateKey: 1 }, { unique: true });
