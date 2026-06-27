import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { ACTIVITY_EVENT_TYPES } from '../learning-history.types';

export type ActivityEventDocument = HydratedDocument<ActivityEvent>;

@Schema({ timestamps: true, collection: 'activity_events' })
export class ActivityEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ACTIVITY_EVENT_TYPES })
  eventType!: string;

  @Prop({ required: true, trim: true })
  idempotencyKey!: string;

  @Prop({ trim: true })
  targetType?: string;

  @Prop({ trim: true })
  targetId?: string;

  @Prop({ trim: true, lowercase: true })
  topic?: string;

  @Prop()
  passed?: boolean;

  @Prop({ min: 0 })
  score?: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ required: true, default: Date.now })
  occurredAt!: Date;
}

export const ActivityEventSchema = SchemaFactory.createForClass(ActivityEvent);

ActivityEventSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
ActivityEventSchema.index({ userId: 1, occurredAt: -1 });
ActivityEventSchema.index({ userId: 1, eventType: 1, occurredAt: -1 });
