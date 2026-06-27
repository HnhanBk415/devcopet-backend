import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../../users/users.service';
import {
  MissionRewardGrant,
  MissionRewardGrantDocument,
} from '../schemas/mission-reward-grant.schema';

@Injectable()
export class MissionRewardService {
  private readonly logger = new Logger(MissionRewardService.name);

  constructor(
    @InjectModel(MissionRewardGrant.name)
    private readonly grantModel: Model<MissionRewardGrantDocument>,
    private readonly usersService: UsersService,
  ) {}

  async grant(input: {
    userId: string;
    missionSetId: string;
    rewardKey: string;
    missionId?: string;
    rewardKind: 'MISSION' | 'SET_BONUS';
    xp: number;
  }) {
    const existing = await this.grantModel
      .findOne({ rewardKey: input.rewardKey })
      .lean()
      .exec();
    if (existing) {
      return { granted: existing.status === 'GRANTED', xp: 0, existing: true };
    }

    let grant: MissionRewardGrantDocument;
    try {
      grant = await this.grantModel.create({
        userId: new Types.ObjectId(input.userId),
        missionSetId: new Types.ObjectId(input.missionSetId),
        rewardKey: input.rewardKey,
        missionId: input.missionId,
        rewardKind: input.rewardKind,
        xp: Math.max(0, Math.trunc(input.xp)),
        status: 'PROCESSING',
      });
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) throw error;
      return { granted: false, xp: 0, existing: true };
    }

    try {
      if (grant.xp > 0) {
        await this.usersService.awardXp(input.userId, grant.xp);
      }
      grant.status = 'GRANTED';
      grant.grantedAt = new Date();
      await grant.save();
      return { granted: true, xp: grant.xp, existing: false };
    } catch (error) {
      grant.status = 'FAILED';
      grant.error = error instanceof Error ? error.message : 'Reward failed';
      await grant.save();
      this.logger.error(`Mission reward failed for ${input.rewardKey}`);
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
