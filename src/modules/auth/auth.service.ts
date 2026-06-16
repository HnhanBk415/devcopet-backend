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
import { UserRole } from '../users/schemas/user.schema';
import * as bcryptjs from 'bcryptjs';

export interface SocialProfile {
  provider: string; // 'github' | 'google' | 'facebook'
  providerId: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private signAccessToken(userId: string, email: string): string {
    const opts: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
        '15m') as JwtSignOptions['expiresIn'],
    };
    return this.jwtService.sign({ sub: userId, email }, opts);
  }

  private signRefreshToken(userId: string): string {
    const opts: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
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
    avatarUrl?: string;
    level?: number;
    exp?: number;
    coins?: number;
    onboardingCompleted?: boolean;
    petProfileInitialized?: boolean;
    authProviders?: string[];
  }) {
    return {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      level: user.level,
      exp: user.exp,
      coins: user.coins,
      onboardingCompleted: user.onboardingCompleted,
      petProfileInitialized: user.petProfileInitialized,
      authProviders: user.authProviders,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOCAL AUTH
  // ─────────────────────────────────────────────────────────────────────────────

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await this.usersService.findByEmail(normalizedEmail);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const user = await this.usersService.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      role: UserRole.STUDENT,
      authProviders: ['local'],
      level: 1,
      exp: 0,
      coins: 0,
      onboardingCompleted: false,
      petProfileInitialized: false,
    });

    return {
      message: 'Register successful',
      user: this.buildSafeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(normalizedEmail);
    // Generic message to prevent email enumeration
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

    // Hash refresh token before saving
    const hashedRefresh = await bcryptjs.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefresh);

    return {
      accessToken,
      refreshToken,
      user: this.buildSafeUser(user),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────────────────────────────────────────

  async refresh(refreshToken: string) {
    // Verify JWT signature and expiry first
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify the token matches the stored hash
    const tokenMatches = await bcryptjs.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: issue new tokens and save new hash
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

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SOCIAL AUTH
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Called by all three social Passport strategies after OAuth completes.
   * Logic:
   *  1. If an account with this provider ID already exists → return that user
   *  2. If an account with the same email exists → link provider and return
   *  3. Otherwise → create a new user with default Devcopet values
   */
  async validateOrCreateSocialUser(profile: SocialProfile) {
    const providerIdField = `${profile.provider}Id` as
      | 'githubId'
      | 'googleId'
      | 'facebookId';

    let userId: string;

    // 1. Find user by social provider ID first
    const userBySocialId = await this.usersService.findBySocialId(
      profile.provider as 'google' | 'facebook' | 'github',
      profile.providerId,
    );

    if (userBySocialId) {
      userId = String(userBySocialId._id);
    } else {
      // 2. If not found by social ID, look up by email — primary account-linking mechanism
      const userByEmail = profile.email
        ? await this.usersService.findByEmail(profile.email)
        : null;

      if (userByEmail) {
        // Link this social provider to the existing email account
        await this.usersService.linkSocialProvider(
          String(userByEmail._id),
          profile.provider,
          profile.providerId,
          profile.avatarUrl,
        );
        userId = String(userByEmail._id);
      } else {
        // 3. Create a brand new Devcopet user for this social account
        const fallbackUsername =
          profile.username || `user_${Date.now().toString(36)}`;

        const newUser = await this.usersService.create({
          username: fallbackUsername,
          email:
            profile.email ||
            `${profile.provider}_${profile.providerId}@devcopet.local`,
          [providerIdField]: profile.providerId,
          authProviders: [profile.provider],
          avatarUrl: profile.avatarUrl,
          role: UserRole.STUDENT,
          level: 1,
          exp: 0,
          coins: 0,
          onboardingCompleted: false,
          petProfileInitialized: false,
        });
        userId = String(newUser._id);
      }
    }

    // Fetch the final user to get up-to-date fields
    const finalUser = await this.usersService.findById(userId);
    if (!finalUser) throw new UnauthorizedException('Social login failed');

    // Issue tokens
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
