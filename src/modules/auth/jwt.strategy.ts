import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const ACCESS_TOKEN_COOKIE = 'dc_access_token';

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

function jwtCookieExtractor(request: Request | null) {
  return getCookieValue(request?.headers.cookie, ACCESS_TOKEN_COOKIE);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        jwtCookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: { sub: string; email: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
