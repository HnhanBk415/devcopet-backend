import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PetDocument = HydratedDocument<Pet>;

@Schema({ timestamps: true })
export class Pet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: 'default' })
  type!: string;

  @Prop({ default: 1, min: 1 })
  level!: number;

  @Prop({ default: 0, min: 0 })
  exp!: number;

  @Prop({ default: 1, min: 1 })
  evolutionStage!: number;

  @Prop({ default: 100, min: 0 })
  energy!: number;

  @Prop({ default: 'default_skin' })
  equippedSkin!: string;

  @Prop({ type: [String], default: ['default_skin'] })
  unlockedSkins!: string[];

  // onboarding traits
  @Prop({ default: 0 })
  guidanceNeed!: number;

  @Prop({ default: 0 })
  decisiveness!: number;

  @Prop({ default: 0 })
  failureSensitivity!: number;

  @Prop({ default: 0 })
  exploration!: number;

  @Prop({ default: 0 })
  precision!: number;

  @Prop({ default: 0 })
  motivationStyle!: number;

  // inferred personality
  @Prop({ default: 'Balanced' })
  primaryPersonality!: string;

  @Prop({ type: String, default: null })
  secondaryPersonality!: string | null;

  @Prop({ type: String, default: null })
  secondaryModifier!: string | null;

  @Prop({ default: 'neutral' })
  toneStyle!: string;

  @Prop({ default: 'guided' })
  hintStyle!: string;

  @Prop({ default: 'warm' })
  praiseStyle!: string;

  @Prop({ default: 'soft' })
  reminderStyle!: string;

  // behavior analysis
  @Prop({ type: [String], default: [] })
  currentWeakTopics!: string[];

  @Prop({ type: [String], default: [] })
  currentMistakePatterns!: string[];

  @Prop({
    type: Object,
    default: {
      hintFrequency: 1,
      encouragementLevel: 1,
      triggerSensitivity: 1,
    },
  })
  supportTuning!: {
    hintFrequency: number;
    encouragementLevel: number;
    triggerSensitivity: number;
  };
}

export const PetSchema = SchemaFactory.createForClass(Pet);
