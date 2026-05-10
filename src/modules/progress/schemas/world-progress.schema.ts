import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WorldProgressDocument = HydratedDocument<WorldProgress>;

@Schema({ timestamps: true })
export class WorldProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'World', required: true })
  worldId!: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  currentLevelOrder!: number;

  @Prop({ default: 1, min: 1 })
  currentNodeOrder!: number;

  @Prop({ default: 0, min: 0 })
  completedNodes!: number;

  @Prop({ default: 0, min: 0 })
  totalStars!: number;
}

export const WorldProgressSchema = SchemaFactory.createForClass(WorldProgress);

WorldProgressSchema.index({ userId: 1, worldId: 1 }, { unique: true });
