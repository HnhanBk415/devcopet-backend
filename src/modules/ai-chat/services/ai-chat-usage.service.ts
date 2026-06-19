import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiChatLog, AiChatLogDocument } from '../schemas/ai-chat-log.schema';
import {
  AiChatUsage,
  AiChatUsageDocument,
} from '../schemas/ai-chat-usage.schema';
import { getVietnamDateKey, getVietnamResetAtIso } from '../utils/ai-date.util';

@Injectable()
export class AiChatUsageService {
  private readonly pendingAskUserIds = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AiChatUsage.name)
    private readonly usageModel: Model<AiChatUsageDocument>,
    @InjectModel(AiChatLog.name)
    private readonly logModel: Model<AiChatLogDocument>,
  ) {}

  acquirePendingAsk(userId: string) {
    if (this.pendingAskUserIds.has(userId)) {
      throw new HttpException(
        {
          code: 'AI_REQUEST_IN_PROGRESS',
          message: 'Please wait for the current AI answer to finish.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.pendingAskUserIds.add(userId);
  }

  releasePendingAsk(userId: string) {
    this.pendingAskUserIds.delete(userId);
  }

  getDailyLimit(level: number) {
    if (level >= 10) return this.getNumberEnv('AI_LEVEL_10_DAILY_LIMIT', 7);
    if (level >= 5) return this.getNumberEnv('AI_LEVEL_5_DAILY_LIMIT', 5);
    return this.getNumberEnv('AI_BASE_DAILY_LIMIT', 3);
  }

  getGlobalDailyLimit() {
    return this.getNumberEnv('AI_GLOBAL_DAILY_LIMIT', 500);
  }

  getResetAtIso() {
    return getVietnamResetAtIso();
  }

  async getUsageSnapshot(userId: string) {
    const dateKey = getVietnamDateKey();
    const [userUsage, globalUsage] = await Promise.all([
      this.usageModel.findOne({
        scope: 'user',
        userId: new Types.ObjectId(userId),
        dateKey,
      }),
      this.usageModel.findOne({
        scope: 'global',
        userId: null,
        dateKey,
      }),
    ]);

    return {
      userUsed: userUsage?.usedCount ?? 0,
      globalUsed: globalUsage?.usedCount ?? 0,
      globalLimit: globalUsage?.dailyLimit ?? this.getGlobalDailyLimit(),
    };
  }

  async reserveUsage(userId: string, dailyLimit: number, globalLimit: number) {
    const dateKey = getVietnamDateKey();
    const userObjectId = new Types.ObjectId(userId);

    await Promise.all([
      this.usageModel.updateOne(
        { scope: 'user', userId: userObjectId, dateKey },
        {
          $setOnInsert: {
            scope: 'user',
            userId: userObjectId,
            dateKey,
            usedCount: 0,
          },
          $set: { dailyLimit },
        },
        { upsert: true },
      ),
      this.usageModel.updateOne(
        { scope: 'global', userId: null, dateKey },
        {
          $setOnInsert: {
            scope: 'global',
            userId: null,
            dateKey,
            usedCount: 0,
          },
          $set: { dailyLimit: globalLimit },
        },
        { upsert: true },
      ),
    ]);

    const userReservation = await this.usageModel.findOneAndUpdate(
      {
        scope: 'user',
        userId: userObjectId,
        dateKey,
        usedCount: { $lt: dailyLimit },
      },
      {
        $set: { dailyLimit },
        $inc: { usedCount: 1 },
      },
      { new: true },
    );

    if (!userReservation) {
      const userUsage = await this.usageModel.findOne({
        scope: 'user',
        userId: userObjectId,
        dateKey,
      });

      throw new HttpException(
        {
          code: 'DAILY_LIMIT_REACHED',
          message: 'You have used all AI helps for today.',
          dailyLimit,
          used: userUsage?.usedCount ?? dailyLimit,
          remaining: 0,
          resetAt: getVietnamResetAtIso(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const globalReservation = await this.usageModel.findOneAndUpdate(
      {
        scope: 'global',
        userId: null,
        dateKey,
        usedCount: { $lt: globalLimit },
      },
      {
        $set: { dailyLimit: globalLimit },
        $inc: { usedCount: 1 },
      },
      { new: true },
    );

    if (!globalReservation) {
      await this.refundUserUsage(userId);

      throw new HttpException(
        {
          code: 'AI_GLOBAL_LIMIT_REACHED',
          message: 'AI helper is resting for today. Please try again tomorrow.',
          globalLimit,
          resetAt: getVietnamResetAtIso(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async refundUsage(userId: string) {
    await Promise.all([this.refundUserUsage(userId), this.refundGlobalUsage()]);
  }

  async assertCooldown(userId: string) {
    const seconds = this.getNumberEnv('AI_COOLDOWN_SECONDS', 5);
    const since = new Date(Date.now() - seconds * 1000);
    const recentLog = await this.logModel.findOne({
      userId: new Types.ObjectId(userId),
      status: 'success',
      createdAt: { $gte: since },
    });

    if (recentLog) {
      throw new HttpException(
        {
          code: 'AI_COOLDOWN',
          message: 'Please wait a few seconds before asking again.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async refundUserUsage(userId: string) {
    const dateKey = getVietnamDateKey();
    await this.usageModel.updateOne(
      {
        scope: 'user',
        userId: new Types.ObjectId(userId),
        dateKey,
        usedCount: { $gt: 0 },
      },
      { $inc: { usedCount: -1 } },
    );
  }

  private async refundGlobalUsage() {
    const dateKey = getVietnamDateKey();
    await this.usageModel.updateOne(
      {
        scope: 'global',
        userId: null,
        dateKey,
        usedCount: { $gt: 0 },
      },
      { $inc: { usedCount: -1 } },
    );
  }

  private getNumberEnv(key: string, fallback: number) {
    const raw = this.configService.get<string>(key);
    const parsed = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
