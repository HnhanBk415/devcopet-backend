import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
}

export const AUTH_PROVIDERS = [
  'local',
  'google',
  'github',
  'facebook',
] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
export type SocialProvider = Exclude<AuthProvider, 'local'>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  username!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop()
  passwordHash?: string;

  @Prop()
  emailVerified?: boolean;

  @Prop()
  emailVerifiedAt?: Date;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Prop({ type: String, default: null })
  avatarUrl?: string | null;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ default: 'Asia/Ho_Chi_Minh', trim: true })
  timezone!: string;

  @Prop({ unique: true, sparse: true })
  githubId?: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ unique: true, sparse: true })
  facebookId?: string;

  @Prop({ type: [String], enum: AUTH_PROVIDERS, default: [] })
  authProviders!: AuthProvider[];

  @Prop()
  refreshTokenHash?: string;

  @Prop({ default: 1 })
  level!: number;

  @Prop({ default: 0, min: 0 })
  lifetimeXp!: number;

  @Prop({ default: 0, min: 0 })
  currentXp!: number;

  @Prop({ default: 0 })
  exp!: number;

  @Prop({ default: 0 })
  coins!: number;

  @Prop({ default: false })
  onboardingCompleted!: boolean;

  @Prop({ default: false })
  petProfileInitialized!: boolean;

  @Prop({ default: 'Axo-Script', trim: true })
  petName!: string;

  @Prop({ default: 1000, min: 1000 })
  arenaRating!: number;

  @Prop({
    type: String,
    enum: ['Beginner', 'Fresher', 'Senior', 'Expert'],
    default: 'Beginner',
  })
  arenaRank!: string;

  @Prop({ default: 0, min: 0 })
  arenaTotalMatches!: number;

  @Prop({ default: 0, min: 0 })
  arenaWins!: number;

  @Prop({ default: 0, min: 0 })
  arenaLosses!: number;

  @Prop({ default: 0, min: 0 })
  arenaDraws!: number;

  @Prop({ default: 0, min: 0 })
  matchesInCurrentRank!: number;

  @Prop({ default: 0, min: 0 })
  winsInCurrentRank!: number;

  @Prop({ default: 0, min: 0 })
  lossesInCurrentRank!: number;

  @Prop({ type: [Types.ObjectId], default: [] })
  recentArenaQuestionIds!: Types.ObjectId[];

  @Prop()
  lastArenaPlayedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ lifetimeXp: -1 });
