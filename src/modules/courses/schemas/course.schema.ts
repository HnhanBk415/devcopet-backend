import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, trim: true })
  language!: string;

  @Prop({ required: true, min: 1 })
  order!: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
