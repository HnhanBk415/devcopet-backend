import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { MISSION_ACTION_TYPES } from '../missions.types';

export type DailyMissionSetDocument = HydratedDocument<DailyMissionSet>;

@Schema({ _id: false })
export class DailyMissionItem {
  @Prop({ required: true, trim: true })
  missionId!: string;

  @Prop({ required: true, min: 1, max: 5 })
  missionIndex!: number;

  @Prop({ required: true, enum: ['NORMAL', 'HARDCORE'] })
  missionKind!: string;

  @Prop({
    required: true,
    enum: [
      'LOCKED',
      'PENDING',
      'OPENED',
      'COMPLETED',
      'DISMISSED',
      'EXPIRED',
      'FAILED',
    ],
  })
  status!: string;

  @Prop({ required: true, trim: true })
  candidateId!: string;

  @Prop({ required: true, trim: true })
  generationVersion!: string;

  @Prop({ required: true, enum: MISSION_ACTION_TYPES })
  actionType!: string;

  @Prop({
    required: true,
    enum: ['LESSON', 'NODE', 'TOPIC', 'PET', 'COURSE', 'QUIZ', 'ARENA'],
  })
  targetType!: string;

  @Prop({ required: true, trim: true })
  targetId!: string;

  @Prop({ trim: true, lowercase: true })
  topic?: string;

  @Prop({ required: true, trim: true })
  href!: string;

  @Prop({ required: true, maxlength: 32, trim: true })
  ctaLabel!: string;

  @Prop({ required: true, trim: true })
  ctaPath!: string;

  @Prop({ required: true, maxlength: 45, trim: true })
  title!: string;

  @Prop({ required: true, maxlength: 120, trim: true })
  message!: string;

  @Prop({ maxlength: 240, trim: true })
  detailMessage?: string;

  @Prop({
    enum: [
      'STARTER',
      'PROGRESS_BASED',
      'WEAK_TOPIC',
      'ROADMAP_STATE',
      'PET_TONE',
      'FALLBACK',
    ],
  })
  sourceType?: string;

  @Prop({ maxlength: 200, trim: true })
  generatedReason?: string;

  @Prop()
  generatedAt?: Date;

  @Prop({ required: true, trim: true })
  reasonCode!: string;

  @Prop({ default: 0, min: 0 })
  progress!: number;

  @Prop({ default: 1, min: 1 })
  target!: number;

  @Prop({ default: 5, min: 0 })
  estimatedMinutes!: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: { xp: 0 } })
  rewardSnapshot!: { xp: number; coins?: number; petExp?: number };

  @Prop({ type: [String], default: [] })
  expectedEventTypes!: string[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata!: Record<string, unknown>;

  @Prop()
  openedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  dismissedAt?: Date;

  @Prop({ trim: true })
  dismissReason?: string;

  @Prop()
  expiredAt?: Date;

  @Prop()
  failedAt?: Date;
}

export const DailyMissionItemSchema =
  SchemaFactory.createForClass(DailyMissionItem);

@Schema({ timestamps: true, collection: 'daily_mission_sets' })
export class DailyMissionSet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, match: /^\d{4}-\d{2}-\d{2}$/ })
  localDate!: string;

  @Prop({ required: true, default: 'Asia/Ho_Chi_Minh' })
  timezone!: string;

  @Prop({
    required: true,
    enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'NEEDS_COURSE'],
  })
  status!: string;

  @Prop({ required: true, enum: ['AI', 'FALLBACK', 'NONE'] })
  generationSource!: string;

  @Prop({ required: true, enum: ['READY', 'GENERATING', 'FAILED'] })
  generationStatus!: string;

  @Prop({ type: [DailyMissionItemSchema], default: [] })
  missions!: DailyMissionItem[];

  @Prop({ default: 0, min: 0, max: 4 })
  completedNormal!: number;

  @Prop({ default: 0, min: 0, max: 4 })
  resolvedNormal!: number;

  @Prop({ default: false })
  hardcoreUnlocked!: boolean;

  @Prop({
    default: 'LOCKED',
    enum: ['LOCKED', 'GENERATING', 'READY', 'FAILED'],
  })
  hardcoreGenerationStatus!: string;

  @Prop({ default: false })
  setBonusGranted!: boolean;

  @Prop({ default: 0, min: 0 })
  totalRewardXp!: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  analysisSummary!: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  aiMetadata!: Record<string, unknown>;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: true })
  purgeAt!: Date;
}

export const DailyMissionSetSchema =
  SchemaFactory.createForClass(DailyMissionSet);

DailyMissionSetSchema.index({ userId: 1, localDate: 1 }, { unique: true });
DailyMissionSetSchema.index({ userId: 1, expiresAt: -1 });
DailyMissionSetSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });
