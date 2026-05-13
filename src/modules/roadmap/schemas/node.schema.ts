import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NodeDocument = HydratedDocument<Node>;

@Schema({ timestamps: true })
export class Node {
  @Prop({ type: Types.ObjectId, ref: 'Level', required: true })
  levelId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', default: null })
  lessonId!: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  topic!: string;

  @Prop({ required: true, trim: true })
  challengeType!: string;

  @Prop({ type: Object, required: true })
  content!: Record<string, any>;

  @Prop({ type: Object, required: true })
  answerConfig!: Record<string, any>;

  @Prop({ default: null })
  hintTemplate!: string | null;

  @Prop({ default: 0, min: 0 })
  rewardExp!: number;

  @Prop({ default: 3, min: 1 })
  maxStars!: number;

  @Prop({ required: true, min: 1 })
  order!: number;
}

export const NodeSchema = SchemaFactory.createForClass(Node);
