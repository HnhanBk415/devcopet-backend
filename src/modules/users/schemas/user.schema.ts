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

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT,
  })
  role!: UserRole;

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
