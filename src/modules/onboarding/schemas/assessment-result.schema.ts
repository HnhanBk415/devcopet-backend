import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AssessmentResultDocument = HydratedDocument<AssessmentResult>;

@Schema({ timestamps: true })
export class AssessmentResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Map, of: String, required: true })
  answers!: Map<string, string>;

  @Prop({ default: 0 })
  guidanceNeedRaw!: number;

  @Prop({ default: 0 })
  decisivenessRaw!: number;

  @Prop({ default: 0 })
  failureSensitivityRaw!: number;

  @Prop({ default: 0 })
  explorationRaw!: number;

  @Prop({ default: 0 })
  precisionRaw!: number;

  @Prop({ default: 0 })
  motivationStyleRaw!: number;

  @Prop({ default: 0 })
  guidanceNeedNorm!: number;

  @Prop({ default: 0 })
  decisivenessNorm!: number;

  @Prop({ default: 0 })
  failureSensitivityNorm!: number;

  @Prop({ default: 0 })
  explorationNorm!: number;

  @Prop({ default: 0 })
  precisionNorm!: number;

  @Prop({ default: 0 })
  motivationStyleNorm!: number;

  @Prop({ default: 'Balanced' })
  primaryPersonality!: string;

  @Prop({ default: null })
  secondaryPersonality!: string | null;

  @Prop({ default: null })
  secondaryModifier!: string | null;
}

export const AssessmentResultSchema =
  SchemaFactory.createForClass(AssessmentResult);
