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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';

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

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: { user: JwtUser }) {
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

  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  facebookLogin() {
    // Passport redirects to Facebook.
  }

  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  facebookCallback(@Req() req: { user: AuthResult }, @Res() res: Response) {
    return this.redirectToFrontendAuthCallback(req.user, res);
  }

  private redirectToFrontendAuthCallback(result: AuthResult, res: Response) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
