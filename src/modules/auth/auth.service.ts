import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialProvider, UserRole } from '../users/schemas/user.schema';
import { PasswordResetService } from './services/password-reset.service';
import * as bcryptjs from 'bcryptjs';

export interface SocialProfile {
  provider: SocialProvider;
  providerId: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private normalizeAvatarUrl(avatarUrl?: string | null): string | null {
    const normalized = avatarUrl?.trim();
    return normalized || null;
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private async findUserIdAfterDuplicate(
    provider: SocialProvider,
    providerId: string,
    email: string,
  ): Promise<string | null> {
    const userBySocialId = await this.usersService.findBySocialId(
      provider,
      providerId,
    );
    if (userBySocialId) return String(userBySocialId._id);

    const userByEmail = await this.usersService.findByEmail(email);
    return userByEmail ? String(userByEmail._id) : null;
  }

  private signAccessToken(userId: string, email: string): string {
    const opts: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
        '15m') as JwtSignOptions['expiresIn'],
    };
    return this.jwtService.sign({ sub: userId, email }, opts);
  }

  private signRefreshToken(userId: string): string {
    const opts: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '7d') as JwtSignOptions['expiresIn'],
    };
    return this.jwtService.sign({ sub: userId }, opts);
  }

  private buildSafeUser(user: {
    _id: unknown;
    username: string;
    email: string;
    role?: string;
    avatarUrl?: string | null;
    level?: number;
    lifetimeXp?: number;
    currentXp?: number;
    exp?: number;
    coins?: number;
    onboardingCompleted?: boolean;
    petProfileInitialized?: boolean;
    petName?: string;
    authProviders?: string[];
    emailVerified?: boolean;
  }) {
    return {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
      level: user.level,
      lifetimeXp: user.lifetimeXp ?? user.exp ?? 0,
      currentXp: user.currentXp ?? user.lifetimeXp ?? user.exp ?? 0,
      exp: user.exp,
      coins: user.coins,
      onboardingCompleted: user.onboardingCompleted,
      petProfileInitialized: user.petProfileInitialized,
      petName: user.petName ?? 'Axo-Script',
      authProviders: user.authProviders,
      emailVerified: user.emailVerified === true,
    };
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password, confirmPassword } = registerDto;
    const normalizedEmail = this.normalizeEmail(email);

    if (confirmPassword !== undefined && confirmPassword !== password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.usersService.findByEmail(normalizedEmail);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    try {
      const user = await this.usersService.create({
        username: username.trim(),
        email: normalizedEmail,
        passwordHash,
        role: UserRole.STUDENT,
        authProviders: ['local'],
        level: 1,
        lifetimeXp: 0,
        currentXp: 0,
        exp: 0,
        coins: 0,
        onboardingCompleted: false,
        petProfileInitialized: false,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });

      return {
        message: 'Register successful',
        verificationRequired: false,
        user: this.buildSafeUser(user),
      };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new BadRequestException('Email already registered');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = String(user._id);
    const accessToken = this.signAccessToken(userId, user.email);
    const refreshToken = this.signRefreshToken(userId);

    const hashedRefresh = await bcryptjs.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefresh);

    return {
      accessToken,
      refreshToken,
      user: this.buildSafeUser(user),
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenMatches = await bcryptjs.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = String(user._id);
    const newAccessToken = this.signAccessToken(userId, user.email);
    const newRefreshToken = this.signRefreshToken(userId);

    const newHashedRefresh = await bcryptjs.hash(newRefreshToken, 10);
    await this.usersService.updateRefreshToken(userId, newHashedRefresh);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  forgotPassword(email: string) {
    return this.passwordResetService.sendResetCode(email);
  }

  async resetPassword(
    email: string,
    petName: string,
    newPassword: string,
    confirmPassword?: string,
  ) {
    return this.passwordResetService.resetPassword(
      email,
      petName,
      newPassword,
      confirmPassword,
    );
  }

  async validateOrCreateSocialUser(profile: SocialProfile) {
    const provider = profile.provider;
    const providerIdField = `${provider}Id`;
    const avatarUrl = this.normalizeAvatarUrl(profile.avatarUrl);
    const normalizedEmail = this.normalizeEmail(
      profile.email || `${provider}_${profile.providerId}@devcopet.local`,
    );

    let userId: string;

    const userBySocialId = await this.usersService.findBySocialId(
      provider,
      profile.providerId,
    );

    if (userBySocialId) {
      userId = String(userBySocialId._id);
    } else {
      const userByEmail = await this.usersService.findByEmail(normalizedEmail);

      if (userByEmail) {
        try {
          await this.usersService.linkSocialProvider(
            String(userByEmail._id),
            provider,
            profile.providerId,
            avatarUrl,
          );

          if (userByEmail.emailVerified !== true) {
            await this.usersService.markEmailVerified(
              String(userByEmail._id),
              new Date(),
            );
          }
          userId = String(userByEmail._id);
        } catch (error) {
          if (!this.isDuplicateKeyError(error)) throw error;

          const recoveredUserId = await this.findUserIdAfterDuplicate(
            provider,
            profile.providerId,
            normalizedEmail,
          );
          if (!recoveredUserId) throw error;
          userId = recoveredUserId;
        }
      } else {
        const fallbackUsername =
          profile.username?.trim() || `user_${Date.now().toString(36)}`;

        try {
          const newUser = await this.usersService.create({
            username: fallbackUsername,
            email: normalizedEmail,
            [providerIdField]: profile.providerId,
            authProviders: [provider],
            emailVerified: true,
            emailVerifiedAt: new Date(),
            avatarUrl,
            role: UserRole.STUDENT,
            level: 1,
            lifetimeXp: 0,
            currentXp: 0,
            exp: 0,
            coins: 0,
            onboardingCompleted: false,
            petProfileInitialized: false,
          });
          userId = String(newUser._id);
        } catch (error) {
          if (!this.isDuplicateKeyError(error)) throw error;

          const recoveredUserId = await this.findUserIdAfterDuplicate(
            provider,
            profile.providerId,
            normalizedEmail,
          );
          if (!recoveredUserId) throw error;
          userId = recoveredUserId;
        }
      }
    }

    const finalUser = await this.usersService.findById(userId);
    if (!finalUser) throw new UnauthorizedException('Social login failed');

    if (avatarUrl && finalUser.avatarUrl !== avatarUrl) {
      finalUser.avatarUrl = avatarUrl;
      await finalUser.save();
    }

    const accessToken = this.signAccessToken(userId, finalUser.email);
    const refreshToken = this.signRefreshToken(userId);
    const hashedRefresh = await bcryptjs.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefresh);

    return {
      accessToken,
      refreshToken,
      user: this.buildSafeUser(finalUser),
    };
  }
}
