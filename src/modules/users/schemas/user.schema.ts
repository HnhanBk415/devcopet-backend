import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  username!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  // Optional — social users may have no local password
  @Prop()
  passwordHash?: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Prop()
  avatarUrl?: string;

  // Social provider IDs — sparse index allows null but enforces uniqueness when set
  @Prop({ sparse: true })
  githubId?: string;

  @Prop({ sparse: true })
  googleId?: string;

  @Prop({ sparse: true })
  facebookId?: string;

  // Tracks which auth methods this account has used e.g. ['local', 'github', 'google']
  @Prop({ type: [String], default: [] })
  authProviders!: string[];

  // Hashed refresh token — null when logged out
  @Prop()
  refreshTokenHash?: string;

  // Game state
  @Prop({ default: 1 })
  level!: number;

  @Prop({ default: 0 })
  exp!: number;

  @Prop({ default: 0 })
  coins!: number;

  @Prop({ default: false })
  onboardingCompleted!: boolean;

  @Prop({ default: false })
  petProfileInitialized!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
