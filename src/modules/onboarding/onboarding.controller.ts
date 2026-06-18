import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * GET /onboarding/questions
   * Public — no auth required.
   * Returns all 15 onboarding questions.
   */
  @Get('questions')
  getQuestions() {
    return this.onboardingService.getQuestions();
  }

  /**
   * POST /onboarding/submit
   * Requires JWT auth.
   * Submits all 15 answers, calculates personality, saves results.
   */
  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitAnswers(
    @Body() dto: SubmitAnswersDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.onboardingService.submitAnswers(req.user.userId, dto);
  }

  /**
   * GET /onboarding/personality
   * Requires JWT auth.
   * Returns current personality profile for the logged-in user.
   */
  @UseGuards(JwtAuthGuard)
  @Get('personality')
  async getPersonality(@Req() req: { user: { userId: string } }) {
    return this.onboardingService.getUserPersonality(req.user.userId);
  }
}
