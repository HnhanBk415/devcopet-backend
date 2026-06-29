import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { DailyMissionSetDocument } from '../schemas/daily-mission-set.schema';
import {
  DailyMissionSummary,
  DailyMissionSummaryDocument,
} from '../schemas/daily-mission-summary.schema';

@Injectable()
export class MissionSummaryService {
  constructor(
    @InjectModel(DailyMissionSummary.name)
    private readonly summaryModel: Model<DailyMissionSummaryDocument>,
  ) {}

  async sync(set: DailyMissionSetDocument) {
    const normal = set.missions.filter(
      (mission) => mission.missionKind === 'NORMAL',
    );
    const completedItems = set.missions
      .filter((mission) => mission.status === 'COMPLETED')
      .map((mission) => ({
        missionId: mission.missionId,
        missionIndex: mission.missionIndex,
        missionKind: mission.missionKind,
        actionType: mission.actionType,
        targetType: mission.targetType,
        targetId: mission.targetId,
        title: mission.title,
        rewardXp: mission.rewardSnapshot?.xp ?? 0,
        completedAt: mission.completedAt,
      }));

    return this.summaryModel
      .findOneAndUpdate(
        { userId: set.userId, localDate: set.localDate },
        {
          $set: {
            timezone: set.timezone,
            completedNormal: normal.filter(
              (mission) => mission.status === 'COMPLETED',
            ).length,
            dismissedNormal: normal.filter(
              (mission) => mission.status === 'DISMISSED',
            ).length,
            expiredNormal: normal.filter(
              (mission) => mission.status === 'EXPIRED',
            ).length,
            hardcoreCompleted: set.missions.some(
              (mission) =>
                mission.missionKind === 'HARDCORE' &&
                mission.status === 'COMPLETED',
            ),
            totalEstimatedMinutes: set.missions.reduce(
              (sum, mission) => sum + (mission.estimatedMinutes ?? 0),
              0,
            ),
            totalRewardXp: set.totalRewardXp,
            completedItems,
            status: set.status,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  async history(userId: string, days = 30) {
    return this.summaryModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ localDate: -1 })
      .limit(Math.min(Math.max(days, 1), 365))
      .lean()
      .exec();
  }

  async stats(userId: string, days = 30) {
    const rows = await this.history(userId, days);
    return {
      days: rows,
      totals: {
        activeDays: rows.length,
        completedNormal: rows.reduce(
          (sum, row) => sum + row.completedNormal,
          0,
        ),
        hardcoreCompleted: rows.filter((row) => row.hardcoreCompleted).length,
        rewardXp: rows.reduce((sum, row) => sum + row.totalRewardXp, 0),
        perfectDays: rows.filter((row) => row.completedNormal === 5).length,
      },
    };
  }
}
