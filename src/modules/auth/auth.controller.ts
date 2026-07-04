import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

interface JwtUser {
  userId: string;
  email: string;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

const ACCESS_TOKEN_COOKIE = 'dc_access_token';
const REFRESH_TOKEN_COOKIE = 'dc_refresh_token';
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.email,
      dto.petName,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post('refresh')
  async refresh(
    @Body() dto: Partial<RefreshTokenDto>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      dto?.refreshToken ?? this.getCookieValue(req, REFRESH_TOKEN_COOKIE);
    const result = await this.authService.refresh(refreshToken ?? '');
    this.setAuthCookies(res, result);
    return { message: 'Session refreshed' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: { user: JwtUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    this.clearAuthCookies(res);
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(GithubAuthGuard)
  @Get('github')
  githubLogin() {
    // Passport redirects to GitHub.
  }

  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  githubCallback(@Req() req: { user: AuthResult }, @Res() res: Response) {
    return this.redirectToFrontendAuthCallback(req.user, res);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {
    // Passport redirects to Google.
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Req() req: { user: AuthResult }, @Res() res: Response) {
    return this.redirectToFrontendAuthCallback(req.user, res);
  }

  private redirectToFrontendAuthCallback(result: AuthResult, res: Response) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    this.setAuthCookies(res, result);

    return res.redirect(`${frontendUrl}/auth/callback`);
  }

  private setAuthCookies(
    res: Response,
    result: Pick<AuthResult, 'accessToken' | 'refreshToken'>,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }

  private clearAuthCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
  }

  private getCookieValue(req: Request, name: string) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const cookie = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
  }
}
