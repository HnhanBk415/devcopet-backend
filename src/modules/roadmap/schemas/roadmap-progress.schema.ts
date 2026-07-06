import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import type { RoadmapCompletionReview, RoadmapMode } from '../roadmap.types';

export type RoadmapProgressDocument = HydratedDocument<RoadmapProgress>;

@Schema({ timestamps: true })
export class RoadmapProgress {
  @Prop({ required: true, trim: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  courseSlug!: string;

  @Prop({ type: String, required: true, enum: ['easy', 'medium', 'hard'] })
  mode!: RoadmapMode;

  @Prop({ required: true, trim: true })
  nodeId!: string;

  @Prop({ required: true, default: Date.now })
  completedAt!: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  review?: RoadmapCompletionReview | null;
}

export const RoadmapProgressSchema =
  SchemaFactory.createForClass(RoadmapProgress);

RoadmapProgressSchema.index(
  { userId: 1, courseSlug: 1, mode: 1, nodeId: 1 },
  { unique: true },
);
