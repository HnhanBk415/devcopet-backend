import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user: { userId: string } }) {
    return this.usersService.findSafeById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  async getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @UseGuards(JwtAuthGuard)
  @Get('match')
  async getRandomOpponent(@Req() req: { user: { userId: string } }) {
    const opponent = await this.usersService.getRandomOpponent(req.user.userId);
    if (!opponent) {
      return {
        _id: 'mock-opponent',
        username: 'ByteMaster',
        level: 40,
        exp: 39500,
        avatarUrl: 'https://i.pravatar.cc/150?u=byte',
        bio: 'Ready to battle!',
      };
    }
    return opponent;
  }

  @UseGuards(JwtAuthGuard)
  @Post('battle/submit')
  async submitBattle(@Req() req: { user: { userId: string } }) {
    return this.usersService.awardBattleWinXp(req.user.userId);
  }
}
