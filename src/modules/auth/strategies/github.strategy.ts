import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    try {
      const email =
        profile.emails?.find((e) => e.value)?.value ??
        `github_${profile.id}@devcopet.local`;

      const result = await this.authService.validateOrCreateSocialUser({
        provider: 'github',
        providerId: profile.id,
        email,
        username:
          profile.username ?? profile.displayName ?? `github_${profile.id}`,
        avatarUrl: profile.photos?.[0]?.value,
      });

      done(null, result);
    } catch (err) {
      done(err as Error);
    }
  }
}
