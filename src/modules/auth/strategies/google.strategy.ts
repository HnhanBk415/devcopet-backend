import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'NOT_CONFIGURED',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'NOT_CONFIGURED',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const email =
        profile.emails?.[0]?.value ??
        `google_${profile.id}@devcopet.local`;

      const result = await this.authService.validateOrCreateSocialUser({
        provider: 'google',
        providerId: profile.id,
        email,
        username: profile.displayName ?? `google_${profile.id}`,
        avatarUrl: profile.photos?.[0]?.value,
      });

      done(null, result);
    } catch (err) {
      done(err as Error);
    }
  }
}
