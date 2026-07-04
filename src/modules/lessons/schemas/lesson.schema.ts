import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

export enum LessonType {
  READING = 'reading',
  PRACTICE = 'practice',
  QUIZ = 'quiz',
  PROJECT = 'project',
}

export enum ContentFormat {
  MARKDOWN = 'markdown',
}

@Schema({ timestamps: true, collection: 'lessons' })
export class Lesson {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  courseId!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  })
  chapterId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, min: 1 })
  order!: number;

  @Prop({
    type: String,
    enum: Object.values(LessonType),
    default: LessonType.READING,
  })
  type!: LessonType;

  @Prop({
    type: String,
    enum: Object.values(ContentFormat),
    default: ContentFormat.MARKDOWN,
  })
  contentFormat!: ContentFormat;

  @Prop({ required: true, default: '' })
  content!: string;

  @Prop({ default: 0, min: 0 })
  estimatedMinutes!: number;

  @Prop({ default: 10, min: 0 })
  xpReward!: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    default: [],
  })
  prerequisiteLessonIds!: Types.ObjectId[];

  @Prop({ default: true })
  isPublished!: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.index({ chapterId: 1, slug: 1 }, { unique: true });
LessonSchema.index({ chapterId: 1, order: 1 }, { unique: true });
LessonSchema.index({ courseId: 1, isPublished: 1, order: 1 });
LessonSchema.index({ chapterId: 1, isPublished: 1, order: 1 });
