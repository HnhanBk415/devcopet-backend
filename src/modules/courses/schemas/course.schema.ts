import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Schema({ timestamps: true, collection: 'courses' })
export class Course {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: '' })
  thumbnailUrl!: string;

  @Prop({
    type: String,
    enum: Object.values(CourseLevel),
    default: CourseLevel.BEGINNER,
  })
  level!: CourseLevel;

  @Prop({ default: 'en' })
  language!: string;

  @Prop({ default: 'python' })
  programmingLanguage!: string;

  @Prop({ default: 0, min: 0 })
  totalChapters!: number;

  @Prop({ default: 0, min: 0 })
  totalLessons!: number;

  @Prop({ default: 0, min: 0 })
  estimatedMinutes!: number;

  @Prop({ required: true, default: 1, min: 1 })
  order!: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: true })
  isPublished!: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
