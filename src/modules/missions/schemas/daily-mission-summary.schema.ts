import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type DailyMissionSummaryDocument = HydratedDocument<DailyMissionSummary>;

@Schema({ timestamps: true, collection: 'daily_mission_summaries' })
export class DailyMissionSummary {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  localDate!: string;

  @Prop({ required: true })
  timezone!: string;

  @Prop({ default: 0 })
  completedNormal!: number;

  @Prop({ default: 0 })
  dismissedNormal!: number;

  @Prop({ default: 0 })
  expiredNormal!: number;

  @Prop({ default: false })
  hardcoreCompleted!: boolean;

  @Prop({ default: 0 })
  totalEstimatedMinutes!: number;

  @Prop({ default: 0 })
  totalRewardXp!: number;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  completedItems!: Array<Record<string, unknown>>;

  @Prop({
    required: true,
    enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'NEEDS_COURSE'],
  })
  status!: string;
}

export const DailyMissionSummarySchema =
  SchemaFactory.createForClass(DailyMissionSummary);

DailyMissionSummarySchema.index({ userId: 1, localDate: 1 }, { unique: true });
DailyMissionSummarySchema.index({ userId: 1, localDate: -1 });
