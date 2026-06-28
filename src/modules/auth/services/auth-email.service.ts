import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

@Injectable()
export class AuthEmailService {
  private readonly logger = new Logger(AuthEmailService.name);
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    expiresInMinutes: number,
  ) {
    const transporter = this.getTransporter();

    if (!transporter) {
      this.logDevVerificationEmail(email, verificationCode, expiresInMinutes);
      return;
    }

    const appName = this.configService.get<string>('APP_NAME') ?? 'DevCoPet';
    const mailFrom =
      this.configService.get<string>('MAIL_FROM') ??
      this.configService.getOrThrow<string>('SMTP_USER');

    try {
      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: `${verificationCode} is your ${appName} verification code`,
        text: [
          'Verify your email',
          '',
          `Your verification code is: ${verificationCode}`,
          '',
          `This code expires in ${expiresInMinutes} minutes.`,
          'If you did not sign up, you can ignore this email.',
        ].join('\n'),
        html: this.buildVerificationHtml(
          appName,
          verificationCode,
          expiresInMinutes,
        ),
      });
    } catch (error) {
      this.transporter = undefined;
      const message =
        error instanceof Error ? error.message : 'Unknown SMTP error';
      this.logger.error(`Failed to send verification email: ${message}`);

      if (this.configService.get<string>('NODE_ENV') !== 'production') {
        this.logDevVerificationEmail(email, verificationCode, expiresInMinutes);
        return;
      }

      throw new ServiceUnavailableException(
        'Unable to send verification email. Please try again later.',
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
    expiresInMinutes: number,
  ) {
    const transporter = this.getTransporter();

    if (!transporter) {
      this.logDevPasswordResetEmail(email, resetCode, expiresInMinutes);
      return;
    }

    const appName = this.configService.get<string>('APP_NAME') ?? 'DevCoPet';
    const mailFrom =
      this.configService.get<string>('MAIL_FROM') ??
      this.configService.getOrThrow<string>('SMTP_USER');

    try {
      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: `${resetCode} is your ${appName} password reset code`,
        text: [
          'Reset your password',
          '',
          `Your password reset code is: ${resetCode}`,
          '',
          `This code expires in ${expiresInMinutes} minutes.`,
          'If you did not request a password reset, you can ignore this email.',
        ].join('\n'),
        html: this.buildPasswordResetHtml(appName, resetCode, expiresInMinutes),
      });
    } catch (error) {
      this.transporter = undefined;
      const message =
        error instanceof Error ? error.message : 'Unknown SMTP error';
      this.logger.error(`Failed to send password reset email: ${message}`);

      if (this.configService.get<string>('NODE_ENV') !== 'production') {
        this.logDevPasswordResetEmail(email, resetCode, expiresInMinutes);
        return;
      }

      throw new ServiceUnavailableException(
        'Unable to send password reset email. Please try again later.',
      );
    }
  }

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      return null;
    }

    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  private logDevVerificationEmail(
    email: string,
    verificationCode: string,
    expiresInMinutes: number,
  ) {
    const mailFrom = this.configService.get<string>('MAIL_FROM');

    this.logger.log(
      [
        'Email verification requested. SMTP is not configured or failed, using dev console mailer.',
        `To: ${email}`,
        mailFrom ? `From: ${mailFrom}` : 'From: dev console mailer',
        `Code: ${verificationCode}`,
        `Expires in: ${expiresInMinutes} minutes`,
      ].join('\n'),
    );
  }

  private logDevPasswordResetEmail(
    email: string,
    resetCode: string,
    expiresInMinutes: number,
  ) {
    const mailFrom = this.configService.get<string>('MAIL_FROM');

    this.logger.log(
      [
        'Password reset requested. SMTP is not configured or failed, using dev console mailer.',
        `To: ${email}`,
        mailFrom ? `From: ${mailFrom}` : 'From: dev console mailer',
        `Code: ${resetCode}`,
        `Expires in: ${expiresInMinutes} minutes`,
      ].join('\n'),
    );
  }
  private buildVerificationHtml(
    appName: string,
    verificationCode: string,
    expiresInMinutes: number,
  ) {
    return `
      <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 24px; margin: 0 0 16px;">Verify your email</h1>
        <p style="font-size: 16px; margin: 0 0 8px;"><strong>Check your inbox</strong></p>
        <p style="font-size: 16px; margin: 0 0 16px;">Enter this code to finish signing up for ${this.escapeHtml(appName)}.</p>
        <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; background: #f2f7f7; border: 1px solid #d7e7e5; border-radius: 8px; padding: 16px 20px; text-align: center; color: #087b76;">${this.escapeHtml(verificationCode)}</div>
        <p style="font-size: 13px; color: #666; margin: 18px 0 0;">This code expires in ${expiresInMinutes} minutes.</p>
      </div>
    `;
  }

  private buildPasswordResetHtml(
    appName: string,
    resetCode: string,
    expiresInMinutes: number,
  ) {
    return `
      <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 24px; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 16px; margin: 0 0 8px;"><strong>Use this reset code</strong></p>
        <p style="font-size: 16px; margin: 0 0 16px;">Enter this code to reset your password for ${this.escapeHtml(appName)}.</p>
        <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; background: #f2f7f7; border: 1px solid #d7e7e5; border-radius: 8px; padding: 16px 20px; text-align: center; color: #087b76;">${this.escapeHtml(resetCode)}</div>
        <p style="font-size: 13px; color: #666; margin: 18px 0 0;">This code expires in ${expiresInMinutes} minutes.</p>
      </div>
    `;
  }
  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
