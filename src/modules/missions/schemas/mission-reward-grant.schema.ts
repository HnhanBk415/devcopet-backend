import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MissionRewardGrantDocument = HydratedDocument<MissionRewardGrant>;

@Schema({ timestamps: true, collection: 'mission_reward_grants' })
export class MissionRewardGrant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DailyMissionSet', required: true })
  missionSetId!: Types.ObjectId;

  @Prop({ required: true, trim: true, unique: true })
  rewardKey!: string;

  @Prop({ trim: true })
  missionId?: string;

  @Prop({ required: true, enum: ['MISSION', 'SET_BONUS'] })
  rewardKind!: string;

  @Prop({ default: 0, min: 0 })
  xp!: number;

  @Prop({ required: true, enum: ['PROCESSING', 'GRANTED', 'FAILED'] })
  status!: string;

  @Prop()
  grantedAt?: Date;

  @Prop({ trim: true })
  error?: string;
}

export const MissionRewardGrantSchema =
  SchemaFactory.createForClass(MissionRewardGrant);

MissionRewardGrantSchema.index({ userId: 1, createdAt: -1 });
