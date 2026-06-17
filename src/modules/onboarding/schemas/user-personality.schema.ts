import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserPersonalityDocument = HydratedDocument<UserPersonality>;

/**
 * UserPersonality — Live personality profile per user.
 *
 * Created after onboarding assessment completion.
 * Pet logic (PersonalityEngine) reads this document to personalize
 * reminders, tone, challenge level, etc.
 *
 * One document per user (upsert on assessment).
 */
@Schema({ timestamps: true })
export class UserPersonality {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  // ── 8 Trait Raw Scores ──

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

  // ── 8 Trait Normalized Scores (0-1) ──

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

  @Prop({ type: [String], default: [] })
  dominantTraits!: string[];

  /** Where the personality data came from */
  @Prop({ default: 'onboarding' })
  lastUpdatedFrom!: string;

  /** Ref to the AssessmentResult that created/updated this */
  @Prop({ type: Types.ObjectId, ref: 'AssessmentResult', default: null })
  sourceAssessmentId!: Types.ObjectId | null;
}

export const UserPersonalitySchema =
  SchemaFactory.createForClass(UserPersonality);
