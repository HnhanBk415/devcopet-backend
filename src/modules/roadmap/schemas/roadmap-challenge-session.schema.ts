import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { RoadmapMode } from '../roadmap.types';

export type RoadmapChallengeSessionDocument =
  HydratedDocument<RoadmapChallengeSession>;

export type RoadmapChallengeSessionStatus =
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'FAILED'
  | 'EXPIRED';

@Schema({ timestamps: true, collection: 'roadmap_challenge_sessions' })
export class RoadmapChallengeSession {
  @Prop({ required: true, trim: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  courseSlug!: string;

  @Prop({ type: String, required: true, enum: ['easy', 'medium', 'hard'] })
  mode!: RoadmapMode;

  @Prop({ required: true, trim: true })
  nodeId!: string;

  @Prop({ required: true })
  startedAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: true, min: 1 })
  timeLimitSeconds!: number;

  @Prop({
    type: String,
    required: true,
    enum: ['IN_PROGRESS', 'SUBMITTED', 'FAILED', 'EXPIRED'],
    default: 'IN_PROGRESS',
  })
  status!: RoadmapChallengeSessionStatus;

  @Prop()
  submittedAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  expiredAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RoadmapChallengeSessionSchema = SchemaFactory.createForClass(
  RoadmapChallengeSession,
);

RoadmapChallengeSessionSchema.index({
  userId: 1,
  courseSlug: 1,
  mode: 1,
  nodeId: 1,
  status: 1,
});
RoadmapChallengeSessionSchema.index(
  { userId: 1, courseSlug: 1, mode: 1, nodeId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'IN_PROGRESS' },
    name: 'uniq_active_roadmap_challenge_session',
  },
);
RoadmapChallengeSessionSchema.index({ userId: 1, createdAt: -1 });
