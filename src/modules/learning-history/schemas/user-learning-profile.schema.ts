import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type UserLearningProfileDocument = HydratedDocument<UserLearningProfile>;

@Schema({ timestamps: true, collection: 'user_learning_profiles' })
export class UserLearningProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ default: 0, min: 0, max: 1 })
  recentAccuracy!: number;

  @Prop({ default: 0, min: 0 })
  averageDurationSeconds!: number;

  @Prop({ default: 0, min: 0, max: 1 })
  missionCompletionRate!: number;

  @Prop({ default: 0, min: 0, max: 1 })
  missionDismissRate!: number;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  topicStats!: Array<Record<string, unknown>>;

  @Prop({ type: [String], default: [] })
  weakTopics!: string[];

  @Prop({ type: [String], default: [] })
  strongTopics!: string[];

  @Prop({ default: 'medium', enum: ['easy', 'medium', 'hard'] })
  preferredDifficulty!: string;

  @Prop({
    default: 'COLD_START',
    enum: ['COLD_START', 'LOW', 'MEDIUM', 'HIGH'],
  })
  confidence!: string;

  @Prop({ default: 1, min: 1 })
  profileVersion!: number;

  @Prop()
  lastActiveAt?: Date;

  @Prop({ required: true, default: Date.now })
  calculatedAt!: Date;
}

export const UserLearningProfileSchema =
  SchemaFactory.createForClass(UserLearningProfile);
