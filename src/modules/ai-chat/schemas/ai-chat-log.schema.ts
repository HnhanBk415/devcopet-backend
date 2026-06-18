import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AiChatLogDocument = HydratedDocument<AiChatLog>;

@Schema({ timestamps: true, collection: 'ai_chat_logs' })
export class AiChatLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  nodeId!: string;

  @Prop({ required: true })
  mode!: string;

  @Prop({ required: true })
  promptId!: string;

  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true })
  model!: string;

  @Prop({ required: true })
  status!: 'success' | 'error';

  @Prop({ default: '' })
  answer!: string;

  @Prop({ default: '' })
  errorMessage!: string;

  @Prop({ default: 0 })
  inputTokens!: number;

  @Prop({ default: 0 })
  outputTokens!: number;
}

export const AiChatLogSchema = SchemaFactory.createForClass(AiChatLog);

AiChatLogSchema.index({ userId: 1, createdAt: -1 });
AiChatLogSchema.index({ nodeId: 1, createdAt: -1 });
