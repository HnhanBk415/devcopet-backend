import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Chapter', required: true })
  chapterId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  overview!: string;

  @Prop({ required: true })
  document!: string;

  @Prop({ type: [Object], default: [] })
  codeExamples!: Record<string, any>[];

  @Prop({ default: null })
  listeningAudioUrl!: string | null;

  @Prop({ type: [Object], default: [] })
  quiz!: Record<string, any>[];

  @Prop({ default: 0, min: 0 })
  rewardExp!: number;

  @Prop({ required: true, min: 1 })
  order!: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
