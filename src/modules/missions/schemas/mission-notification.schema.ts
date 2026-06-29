import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type MissionNotificationDocument = HydratedDocument<MissionNotification>;

@Schema({ timestamps: true, collection: 'mission_notifications' })
export class MissionNotification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  type!: string;

  @Prop({ required: true, maxlength: 80, trim: true })
  title!: string;

  @Prop({ required: true, maxlength: 180, trim: true })
  message!: string;

  @Prop({ trim: true })
  missionId?: string;

  @Prop({ default: false })
  read!: boolean;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata!: Record<string, unknown>;

  @Prop()
  readAt?: Date;

  @Prop({ required: true })
  purgeAt!: Date;
}

export const MissionNotificationSchema =
  SchemaFactory.createForClass(MissionNotification);

MissionNotificationSchema.index({ userId: 1, createdAt: -1 });
MissionNotificationSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });
