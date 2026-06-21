import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Socket } from 'socket.io';
import type { ArenaSocketUser } from '../types/arena.types';

@Injectable()
export class ArenaAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async authenticateSocket(client: Socket): Promise<ArenaSocketUser> {
    const token = this.extractToken(client);
    if (!token) {
      throw new UnauthorizedException('Missing access token.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      const user = {
        userId: payload.sub,
        email: payload.email,
      };
      const socketData = client.data as { user?: ArenaSocketUser };
      socketData.user = user;
      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as { token?: unknown } | undefined;
    const authToken = auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return this.normalizeToken(authToken);
    }

    const authorization = client.handshake.headers.authorization;
    if (typeof authorization === 'string') {
      const [scheme, token] = authorization.split(' ');
      if (scheme?.toLowerCase() === 'bearer' && token) {
        return this.normalizeToken(token);
      }
    }

    // Trích xuất từ Cookie của Handshake Headers (dc_access_token)
    const cookieHeader = client.handshake.headers.cookie;
    if (cookieHeader) {
      const cookieToken = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('dc_access_token='));
      if (cookieToken) {
        const token = decodeURIComponent(
          cookieToken.slice('dc_access_token='.length),
        );
        return this.normalizeToken(token);
      }
    }

    return null;
  }

  private normalizeToken(value: string): string | null {
    const token = value.trim();
    if (!token) return null;

    const [scheme, ...rest] = token.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && rest.length > 0) {
      return rest.join(' ').trim() || null;
    }

    return token;
  }
}
