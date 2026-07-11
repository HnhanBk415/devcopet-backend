import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
    this.setNoStoreHeaders(res);
    return result;
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(dto.refreshToken);
    this.setNoStoreHeaders(res);
    return { message: 'Session refreshed', ...result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: { user: JwtUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    this.setNoStoreHeaders(res);
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
    this.setNoStoreHeaders(res);
    const authFragment = this.buildAuthCallbackFragment(result);

    return res.redirect(`${frontendUrl}/auth/callback#${authFragment}`);
  }

  private buildAuthCallbackFragment(result: AuthResult) {
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: Buffer.from(JSON.stringify(result.user), 'utf8').toString(
        'base64url',
      ),
    });

    return params.toString();
  }

  private setNoStoreHeaders(res: Response) {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
  }
}
