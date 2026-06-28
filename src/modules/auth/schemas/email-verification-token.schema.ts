import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type EmailVerificationTokenDocument =
  HydratedDocument<EmailVerificationToken>;

@Schema({ timestamps: true })
export class EmailVerificationToken {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  usedAt?: Date;
}

export const EmailVerificationTokenSchema = SchemaFactory.createForClass(
  EmailVerificationToken,
);

EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailVerificationTokenSchema.index({ userId: 1, usedAt: 1 });
