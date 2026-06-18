import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AssessmentResultDocument = HydratedDocument<AssessmentResult>;

@Schema({ timestamps: true })
export class AssessmentResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  /** Version of assessment questions used */
  @Prop({ default: 'v1' })
  assessmentVersion!: string;

  /** Version of scoring algorithm used */
  @Prop({ default: 'v1' })
  scoringVersion!: string;

  /** Raw answers: { "1": "A", "2": "C", ... } */
  @Prop({ type: Map, of: String, required: true })
  answers!: Map<string, string>;

  // ── 8 Personality Trait Raw Scores ──

  @Prop({ default: 0 })
  analytical!: number;

  @Prop({ default: 0 })
  creative!: number;

  @Prop({ default: 0 })
  disciplined!: number;

  @Prop({ default: 0 })
  independent!: number;

  @Prop({ default: 0 })
  empathetic!: number;

  @Prop({ default: 0 })
  competitive!: number;

  @Prop({ default: 0 })
  adaptable!: number;

  @Prop({ default: 0 })
  curious!: number;

  // ── 8 Personality Trait Normalized Scores (0-1) ──

  @Prop({ default: 0 })
  analyticalNorm!: number;

  @Prop({ default: 0 })
  creativeNorm!: number;

  @Prop({ default: 0 })
  disciplinedNorm!: number;

  @Prop({ default: 0 })
  independentNorm!: number;

  @Prop({ default: 0 })
  empatheticNorm!: number;

  @Prop({ default: 0 })
  competitiveNorm!: number;

  @Prop({ default: 0 })
  adaptableNorm!: number;

  @Prop({ default: 0 })
  curiousNorm!: number;

  // ── Top 3 Dominant Traits ──

  @Prop({ required: true })
  primaryPersonality!: string;

  @Prop({ type: String, default: null })
  secondaryPersonality!: string | null;

  @Prop({ type: String, default: null })
  secondaryModifier!: string | null;

  @Prop({ type: String, default: null })
  tertiaryPersonality!: string | null;

  @Prop()
  completedAt!: Date;
}

export const AssessmentResultSchema =
  SchemaFactory.createForClass(AssessmentResult);
