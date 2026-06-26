import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiChatService } from './ai-chat.service';
import { AskRoadmapAiDto } from './dto/ask-roadmap-ai.dto';
import type { RoadmapMode } from './ai-chat.types';

@UseGuards(JwtAuthGuard)
@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Get('usage/today')
  async getUsageToday(@Req() req: { user: { userId: string } }) {
    return this.aiChatService.getUsageToday(req.user.userId);
  }

  @Get('roadmap/:mode/nodes/:nodeId/prompts')
  async getRoadmapPrompts(
    @Param('mode') mode: RoadmapMode,
    @Param('nodeId') nodeId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.aiChatService.getRoadmapPromptOptions(
      req.user.userId,
      mode,
      nodeId,
    );
  }

  @Post('roadmap/:mode/nodes/:nodeId/ask')
  async askRoadmapAi(
    @Param('mode') mode: RoadmapMode,
    @Param('nodeId') nodeId: string,
    @Body() body: AskRoadmapAiDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.aiChatService.askRoadmapAi(
      req.user.userId,
      mode,
      nodeId,
      body.promptId,
    );
  }
}
