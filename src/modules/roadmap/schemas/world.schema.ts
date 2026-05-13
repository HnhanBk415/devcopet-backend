import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WorldDocument = HydratedDocument<World>;

@Schema({ timestamps: true })
export class World {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: 1, min: 1 })
  requiredLevel!: number;

  @Prop({ type: Types.ObjectId, ref: 'Course', default: null })
  courseId!: Types.ObjectId | null;
}

export const WorldSchema = SchemaFactory.createForClass(World);
