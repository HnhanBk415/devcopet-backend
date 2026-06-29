import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

type FacebookProfile = Profile & {
  _json?: unknown;
};

function getFacebookPictureUrl(json: unknown): string | undefined {
  if (!json || typeof json !== 'object') return undefined;

  const picture = (json as { picture?: unknown }).picture;
  if (!picture || typeof picture !== 'object') return undefined;

  const data = (picture as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return undefined;

  const url = (data as { url?: unknown }).url;
  return typeof url === 'string' && url.trim() ? url : undefined;
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
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
      const facebookProfile = profile as FacebookProfile;
      const email =
        profile.emails?.[0]?.value ?? `facebook_${profile.id}@devcopet.local`;

      const result = await this.authService.validateOrCreateSocialUser({
        provider: 'facebook',
        providerId: profile.id,
        email,
        username: profile.displayName ?? `facebook_${profile.id}`,
        avatarUrl:
          profile.photos?.[0]?.value ??
          getFacebookPictureUrl(facebookProfile._json),
      });

      done(null, result);
    } catch (err) {
      done(err as Error);
    }
  }
}
