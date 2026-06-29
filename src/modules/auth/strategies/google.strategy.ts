import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

type GoogleProfile = Profile & {
  picture?: string;
  _json?: {
    picture?: string;
  };
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
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
      const googleProfile = profile as GoogleProfile;
      const email =
        profile.emails?.[0]?.value ?? `google_${profile.id}@devcopet.local`;

      const result = await this.authService.validateOrCreateSocialUser({
        provider: 'google',
        providerId: profile.id,
        email,
        username: profile.displayName ?? `google_${profile.id}`,
        avatarUrl:
          profile.photos?.[0]?.value ??
          googleProfile.picture ??
          googleProfile._json?.picture,
      });

      done(null, result);
    } catch (err) {
      done(err as Error);
    }
  }
}
