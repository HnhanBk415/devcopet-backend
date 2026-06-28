import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomInt } from 'crypto';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from '../../users/users.service';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from '../schemas/password-reset-token.schema';
import { AuthEmailService } from './auth-email.service';

const DEFAULT_RESET_EXPIRES_MINUTES = 10;

@Injectable()
export class PasswordResetService {
  private readonly genericForgotMessage =
    'If an account can be reset, a reset code has been sent.';

  constructor(
    @InjectModel(PasswordResetToken.name)
    private readonly tokenModel: Model<PasswordResetTokenDocument>,
    private readonly usersService: UsersService,
    private readonly authEmailService: AuthEmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendResetCode(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user?.authProviders?.includes('local') && user.passwordHash) {
      const code = this.generateCode();
      const tokenHash = this.hashCode(normalizedEmail, code);
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

      await this.authEmailService.sendPasswordResetEmail(
        normalizedEmail,
        code,
        this.getExpiresMinutes(),
      );
    }

    return { message: this.genericForgotMessage };
  }

  async verifyResetCode(email: string, code: string) {
    await this.findValidResetToken(email, code);
    return { verified: true };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword?: string,
  ) {
    if (confirmPassword !== undefined && confirmPassword !== newPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const { user, resetToken } = await this.findValidResetToken(email, code);

    const passwordHash = await bcryptjs.hash(newPassword, 10);
    await this.usersService.updatePasswordHash(String(user._id), passwordHash);

    resetToken.usedAt = new Date();
    await resetToken.save();

    return { message: 'Password reset successfully' };
  }

  private async findValidResetToken(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user?.authProviders?.includes('local') || !user.passwordHash) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const tokenHash = this.hashCode(normalizedEmail, code);
    const resetToken = await this.tokenModel.findOne({
      userId: user._id,
      tokenHash,
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    return { user, resetToken };
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
      this.configService.get<string>('PASSWORD_RESET_EXPIRES_MINUTES'),
    );

    if (Number.isFinite(configured) && configured > 0) {
      return configured;
    }

    return DEFAULT_RESET_EXPIRES_MINUTES;
  }
}
