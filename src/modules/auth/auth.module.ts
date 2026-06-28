import { Module } from '@nestjs/common';
import {
  JwtModule,
  type JwtModuleOptions,
  type JwtSignOptions,
} from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { UsersModule } from '../users/users.module';
import { AuthEmailService } from './services/auth-email.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import {
  EmailVerificationToken,
  EmailVerificationTokenSchema,
} from './schemas/email-verification-token.schema';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset-token.schema';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([
      {
        name: EmailVerificationToken.name,
        schema: EmailVerificationTokenSchema,
      },
      {
        name: PasswordResetToken.name,
        schema: PasswordResetTokenSchema,
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
            '15m') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GithubStrategy,
    GoogleStrategy,
    FacebookStrategy,
    AuthEmailService,
    EmailVerificationService,
    PasswordResetService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
