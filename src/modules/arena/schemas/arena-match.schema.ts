import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import type {
  ArenaMatchStatus,
  ArenaMode,
  ArenaRank,
  ArenaResultType,
} from '../types/arena.types';

export type ArenaMatchDocument = HydratedDocument<ArenaMatch>;

@Schema({ _id: false })
export class ArenaMatchPlayer {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true })
  isBot!: boolean;

  @Prop()
  botDifficulty?: string;

  @Prop({ required: true })
  arenaRank!: string;

  @Prop({ required: true })
  ratingBefore!: number;

  @Prop({ required: true })
  ratingAfter!: number;

  @Prop({ required: true })
  ratingDelta!: number;

  @Prop({ required: true })
  score!: number;

  @Prop({ required: true })
  correctCount!: number;

  @Prop({ required: true })
  wrongCount!: number;

  @Prop({ required: true })
  timeoutCount!: number;

  @Prop({ required: true })
  avgAnswerTimeMs!: number;
}

export const ArenaMatchPlayerSchema =
  SchemaFactory.createForClass(ArenaMatchPlayer);

@Schema({ _id: false })
export class ArenaMatchAnswer {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  isBot!: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  answer!: unknown;

  @Prop({ required: true })
  isCorrect!: boolean;

  @Prop({ required: true })
  earnedScore!: number;

  @Prop({ required: true })
  answerTimeMs!: number;

  @Prop({ required: true })
  remainingSeconds!: number;
}

export const ArenaMatchAnswerSchema =
  SchemaFactory.createForClass(ArenaMatchAnswer);

@Schema({ _id: false })
export class ArenaQuestionResult {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArenaQuestion',
    required: true,
  })
  questionId!: Types.ObjectId;

  @Prop({ required: true })
  difficulty!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  correctAnswer!: unknown;

  @Prop({ type: [ArenaMatchAnswerSchema], default: [] })
  answers!: ArenaMatchAnswer[];
}

export const ArenaQuestionResultSchema =
  SchemaFactory.createForClass(ArenaQuestionResult);

@Schema({ timestamps: true, collection: 'arena_matches' })
export class ArenaMatch {
  @Prop({ required: true, unique: true })
  roomId!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  courseSlug!: string;

  @Prop({
    type: String,
    enum: ['ranked', 'casual', 'practice'],
    required: true,
  })
  mode!: ArenaMode;

  @Prop({
    type: String,
    enum: ['Beginner', 'Fresher', 'Senior', 'Expert'],
    required: true,
  })
  matchTier!: ArenaRank;

  @Prop({ type: [ArenaMatchPlayerSchema], default: [] })
  players!: ArenaMatchPlayer[];

  @Prop({ type: [ArenaQuestionResultSchema], default: [] })
  questionResults!: ArenaQuestionResult[];

  @Prop({ type: mongoose.Schema.Types.Mixed, default: [] })
  finalScoreboard!: unknown[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  winnerUserId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['win', 'draw', 'cancelled', 'disconnected'],
    required: true,
  })
  resultType!: ArenaResultType;

  @Prop({
    type: String,
    enum: ['completed', 'cancelled', 'disconnected'],
    required: true,
  })
  status!: ArenaMatchStatus;

  @Prop({ required: true })
  startedAt!: Date;

  @Prop({ required: true })
  finishedAt!: Date;
}

export const ArenaMatchSchema = SchemaFactory.createForClass(ArenaMatch);

ArenaMatchSchema.index({ roomId: 1 }, { unique: true });
ArenaMatchSchema.index({ 'players.userId': 1 });
ArenaMatchSchema.index({ courseSlug: 1, createdAt: 1 });
ArenaMatchSchema.index({ winnerUserId: 1 });
ArenaMatchSchema.index({ status: 1 });
