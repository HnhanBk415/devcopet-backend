import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user: { userId: string } }) {
    return this.petsService.getMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('feed')
  async feed(@Req() req: { user: { userId: string } }) {
    return this.petsService.feed(req.user.userId);
  }
}
