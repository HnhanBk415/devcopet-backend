import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileLearningService } from './profile-learning.service';

@UseGuards(JwtAuthGuard)
@Controller('profile/learning-progress')
export class ProfileLearningController {
  constructor(
    private readonly profileLearningService: ProfileLearningService,
  ) {}

  @Get()
  getLearningProgress(@Req() req: { user: { userId: string } }) {
    return this.profileLearningService.getLearningProgress(req.user.userId);
  }
}
