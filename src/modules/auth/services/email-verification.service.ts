import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomInt } from 'crypto';
import { Model } from 'mongoose';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import {
  EmailVerificationToken,
  EmailVerificationTokenDocument,
} from '../schemas/email-verification-token.schema';
import { AuthEmailService } from './auth-email.service';

const DEFAULT_VERIFICATION_EXPIRES_MINUTES = 10;

@Injectable()
export class EmailVerificationService {
  private readonly genericResendMessage =
    'If the email can be verified, a verification code has been sent.';

  constructor(
    @InjectModel(EmailVerificationToken.name)
    private readonly tokenModel: Model<EmailVerificationTokenDocument>,
    private readonly usersService: UsersService,
    private readonly authEmailService: AuthEmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(user: UserDocument): Promise<void> {
    const code = this.generateCode();
    const tokenHash = this.hashCode(user.email, code);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.getExpiresMinutes() * 60 * 1000,
    );

    await this.tokenModel.updateMany(
      { userId: user._id, usedAt: { $exists: false } },
      { $set: { usedAt: now } },
    );

    await this.tokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    await this.authEmailService.sendVerificationEmail(
      user.email,
      code,
      this.getExpiresMinutes(),
    );
  }

  async verifyEmail(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user || !user.authProviders?.includes('local')) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (user.emailVerified === true) {
      return { message: 'Email verified successfully' };
    }

    const tokenHash = this.hashCode(normalizedEmail, code);
    const verificationToken = await this.tokenModel.findOne({
      userId: user._id,
      tokenHash,
    });

    if (
      !verificationToken ||
      verificationToken.usedAt ||
      verificationToken.expiresAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.usersService.markEmailVerified(String(user._id), new Date());

    verificationToken.usedAt = new Date();
    await verificationToken.save();

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (
      user &&
      user.authProviders?.includes('local') &&
      user.emailVerified !== true
    ) {
      await this.sendVerificationEmail(user);
    }

    return { message: this.genericResendMessage };
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private hashCode(email: string, code: string): string {
    return createHash('sha256')
      .update(`${email.toLowerCase().trim()}:${code.trim()}`)
      .digest('hex');
  }

  private getExpiresMinutes(): number {
    const configured = Number(
      this.configService.get<string>('EMAIL_VERIFY_EXPIRES_MINUTES'),
    );

    if (Number.isFinite(configured) && configured > 0) {
      return configured;
    }

    return DEFAULT_VERIFICATION_EXPIRES_MINUTES;
  }
}
