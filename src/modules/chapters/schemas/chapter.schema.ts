import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema({ timestamps: true, collection: 'chapters' })
export class Chapter {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  courseId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, min: 0 })
  order!: number;

  @Prop({ default: 0, min: 0 })
  totalLessons!: number;

  @Prop({ default: 0, min: 0 })
  estimatedMinutes!: number;

  @Prop({ default: true })
  isPublished!: boolean;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

ChapterSchema.index({ courseId: 1, slug: 1 }, { unique: true });
ChapterSchema.index({ courseId: 1, order: 1 }, { unique: true });
