import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiChatLog, AiChatLogDocument } from '../schemas/ai-chat-log.schema';
import type { AiPromptId, RoadmapMode } from '../ai-chat.types';

interface BaseLogInput {
  userId: string;
  nodeId: string;
  mode: RoadmapMode;
  promptId: AiPromptId;
  provider: string;
  model: string;
}

@Injectable()
export class AiChatLogService {
  constructor(
    @InjectModel(AiChatLog.name)
    private readonly logModel: Model<AiChatLogDocument>,
  ) {}

  async logSuccess(
    input: BaseLogInput & {
      answer: string;
      inputTokens: number;
      outputTokens: number;
    },
  ) {
    await this.logModel.create({
      userId: new Types.ObjectId(input.userId),
      nodeId: input.nodeId,
      mode: input.mode,
      promptId: input.promptId,
      provider: input.provider,
      model: input.model,
      status: 'success',
      answer: input.answer,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
    });
  }

  async logError(input: BaseLogInput & { error: unknown }) {
    await this.logModel.create({
      userId: new Types.ObjectId(input.userId),
      nodeId: input.nodeId,
      mode: input.mode,
      promptId: input.promptId,
      provider: input.provider,
      model: input.model,
      status: 'error',
      errorMessage:
        input.error instanceof Error
          ? input.error.message
          : 'Unknown AI provider error',
    });
  }
}
