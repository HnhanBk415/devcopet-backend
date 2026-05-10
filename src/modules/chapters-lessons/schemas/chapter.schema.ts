import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema({ timestamps: true })
export class Chapter {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, min: 1 })
  order!: number;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
