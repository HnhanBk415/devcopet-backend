import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { LEARNING_SOURCE_TYPES } from '../learning-history.types';

export type LearningAttemptDocument = HydratedDocument<LearningAttempt>;

@Schema({ timestamps: true, collection: 'learning_attempts' })
export class LearningAttempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  submissionId!: string;

  @Prop({ required: true, enum: LEARNING_SOURCE_TYPES })
  sourceType!: string;

  @Prop({ trim: true })
  courseSlug?: string;

  @Prop({ enum: ['easy', 'medium', 'hard'] })
  mode?: string;

  @Prop({ required: true, enum: ['NODE', 'LESSON', 'QUIZ'] })
  targetType!: string;

  @Prop({ required: true, trim: true })
  targetId!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  topic!: string;

  @Prop({ required: true, trim: true })
  challengeType!: string;

  @Prop({ required: true, min: 1 })
  attemptNumber!: number;

  @Prop({ required: true })
  passed!: boolean;

  @Prop({ default: 0, min: 0 })
  score!: number;

  @Prop({ default: 0, min: 0 })
  maxScore!: number;

  @Prop({ default: 0, min: 0 })
  durationSeconds!: number;

  @Prop({ default: 0, min: 0 })
  hintUsed!: number;

  @Prop({ trim: true })
  primaryMistake?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ required: true, default: Date.now })
  attemptedAt!: Date;
}

export const LearningAttemptSchema =
  SchemaFactory.createForClass(LearningAttempt);

LearningAttemptSchema.index({ userId: 1, submissionId: 1 }, { unique: true });
LearningAttemptSchema.index({ userId: 1, attemptedAt: -1 });
LearningAttemptSchema.index({ userId: 1, topic: 1, attemptedAt: -1 });
LearningAttemptSchema.index({ userId: 1, targetId: 1, attemptedAt: -1 });
