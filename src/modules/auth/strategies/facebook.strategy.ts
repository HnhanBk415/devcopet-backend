import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'NOT_CONFIGURED',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'NOT_CONFIGURED',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || '',
      scope: ['email'],
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    try {
      // Facebook may not return email (privacy settings)
      const email =
        profile.emails?.[0]?.value ??
        `facebook_${profile.id}@devcopet.local`;

      const result = await this.authService.validateOrCreateSocialUser({
        provider: 'facebook',
        providerId: profile.id,
        email,
        username: profile.displayName ?? `facebook_${profile.id}`,
        avatarUrl: profile.photos?.[0]?.value,
      });

      done(null, result);
    } catch (err) {
      done(err as Error);
    }
  }
}
