import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttemptDocument = HydratedDocument<Attempt>;

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'World', required: true })
  worldId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Level', required: true })
  levelId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Node', required: true })
  nodeId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  topic!: string;

  @Prop({ required: true, trim: true })
  challengeType!: string;

  @Prop({ required: true })
  passed!: boolean;

  @Prop({ default: 0, min: 0 })
  stars!: number;

  @Prop({ default: 0, min: 0 })
  score!: number;

  @Prop({ default: 0, min: 0 })
  maxScore!: number;

  @Prop({ default: 0, min: 0 })
  retryCount!: number;

  @Prop({ default: 0, min: 0 })
  durationSeconds!: number;

  @Prop({ default: 0, min: 0 })
  hintUsed!: number;

  @Prop({ default: 'unknown' })
  primaryMistake!: string;

  @Prop({ default: false })
  usedPetHelp!: boolean;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
