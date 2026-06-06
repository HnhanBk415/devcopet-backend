import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  CODE_OUTPUT = 'code_output',
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Schema({ _id: false })
export class QuizOption {
  @Prop({ required: true, trim: true })
  id!: string;

  @Prop({ required: true })
  text!: string;
}

export const QuizOptionSchema = SchemaFactory.createForClass(QuizOption);

@Schema({ _id: false })
export class QuizQuestion {
  @Prop({
    type: String,
    enum: Object.values(QuestionType),
    required: true,
  })
  type!: QuestionType;

  @Prop({ required: true })
  question!: string;

  @Prop({ default: '' })
  codeSnippet!: string;

  @Prop({ type: [QuizOptionSchema], default: [] })
  options!: QuizOption[];

  @Prop({ type: [String], default: [] })
  correctOptionIds!: string[];

  @Prop({ default: '' })
  correctAnswerText!: string;

  @Prop({ type: [String], default: [] })
  acceptedAnswers!: string[];

  @Prop({ default: '' })
  explanation!: string;

  @Prop({
    type: String,
    enum: Object.values(QuestionDifficulty),
    default: QuestionDifficulty.EASY,
  })
  difficulty!: QuestionDifficulty;

  @Prop({ default: 1, min: 1 })
  points!: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

@Schema({ timestamps: true, collection: 'quizzes' })
export class Quiz {
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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  })
  lessonId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: 1, min: 1 })
  order!: number;

  @Prop({ type: [QuizQuestionSchema], default: [] })
  questions!: QuizQuestion[];

  @Prop({ default: 0, min: 0 })
  passingScore!: number;

  @Prop({ default: true })
  isPublished!: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.index({ lessonId: 1 }, { unique: true });
