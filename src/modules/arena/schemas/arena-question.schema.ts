import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import type { ArenaDifficulty, ArenaQuestionType } from '../types/arena.types';

export type ArenaQuestionDocument = HydratedDocument<ArenaQuestion>;

@Schema({ _id: false })
export class ArenaCodeSnippet {
  @Prop({ required: true, trim: true })
  language!: string;

  @Prop({ required: true })
  code!: string;
}

export const ArenaCodeSnippetSchema =
  SchemaFactory.createForClass(ArenaCodeSnippet);

@Schema({ _id: false })
export class ArenaQuestionOption {
  @Prop({ required: true, trim: true })
  id!: string;

  @Prop({ required: true })
  text!: string;
}

export const ArenaQuestionOptionSchema =
  SchemaFactory.createForClass(ArenaQuestionOption);
@Schema({ _id: false })
export class ArenaDropZone {
  @Prop({ required: true, trim: true })
  id!: string;

  @Prop({ required: true })
  label!: string;
}

export const ArenaDropZoneSchema = SchemaFactory.createForClass(ArenaDropZone);
@Schema({ timestamps: true, collection: 'arena_questions' })
export class ArenaQuestion {
  @Prop({ required: true, lowercase: true, trim: true })
  courseSlug!: string;

  @Prop({ type: String, enum: ['easy', 'medium', 'hard'], required: true })
  difficulty!: ArenaDifficulty;

  @Prop({ required: true, min: 0 })
  chapterOrder!: number;

  @Prop()
  chapterTitle?: string;

  @Prop()
  lessonSlug?: string;

  @Prop()
  lessonTitle?: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  question!: string;

  @Prop({
    type: String,
    enum: ['multiple_choice', 'drag_drop'],
    required: true,
  })
  type!: ArenaQuestionType;

  @Prop({ type: ArenaCodeSnippetSchema, default: null })
  codeSnippet?: ArenaCodeSnippet | null;

  @Prop()
  template?: string;

  @Prop({ type: [ArenaQuestionOptionSchema], default: [] })
  options?: ArenaQuestionOption[];

  @Prop()
  correctOptionId?: string;

  @Prop({ type: [ArenaQuestionOptionSchema], default: [] })
  poolItems?: ArenaQuestionOption[];

  @Prop({ type: [ArenaDropZoneSchema], default: [] })
  dropZones?: ArenaDropZone[];

  @Prop({ type: mongoose.Schema.Types.Mixed, default: undefined })
  correctDropZoneMap?: Record<string, string>;

  @Prop({ required: true, default: '' })
  explanation!: string;

  @Prop({ type: [String], default: [] })
  conceptTags!: string[];

  @Prop({ min: 0 })
  estimatedSeconds?: number;

  @Prop({ min: 0 })
  baseScore?: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ArenaQuestionSchema = SchemaFactory.createForClass(ArenaQuestion);

ArenaQuestionSchema.index({ courseSlug: 1, difficulty: 1, isActive: 1 });
ArenaQuestionSchema.index({ courseSlug: 1, chapterOrder: 1 });
ArenaQuestionSchema.index({ conceptTags: 1 });
ArenaQuestionSchema.index({ type: 1 });
ArenaQuestionSchema.index({ createdAt: 1 });
