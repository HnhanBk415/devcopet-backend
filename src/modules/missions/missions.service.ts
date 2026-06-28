import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { RecordActivityEventInput } from '../learning-history/learning-history.types';
import { LearningHistoryService } from '../learning-history/learning-history.service';
import { UsersService } from '../users/users.service';
import type {
  AiSelectedMission,
  MissionActionType,
  MissionCandidate,
  MissionKind,
} from './missions.types';
import {
  DailyMissionItem,
  DailyMissionSet,
  DailyMissionSetDocument,
} from './schemas/daily-mission-set.schema';
import { MissionAiSelectorService } from './services/mission-ai-selector.service';
import { MissionCandidateService } from './services/mission-candidate.service';
import { MissionNotificationService } from './services/mission-notification.service';
import { MissionRewardService } from './services/mission-reward.service';
import { MissionSnapshotService } from './services/mission-snapshot.service';
import { MissionSummaryService } from './services/mission-summary.service';
import {
  DEFAULT_MISSION_TIMEZONE,
  getLocalDate,
  getNextLocalMidnight,
  isValidTimeZone,
} from './utils/mission-date.util';

const NORMAL_MISSION_COUNT = 4;
const SET_COMPLETION_BONUS_XP = 50;
const MISSION_RETENTION_DAYS = 30;
const ACTIVE_MISSION_STATUSES = ['PENDING', 'OPENED'] as const;

@Injectable()
export class MissionsService {
  constructor(
    @InjectModel(DailyMissionSet.name)
    private readonly missionSetModel: Model<DailyMissionSetDocument>,
    private readonly usersService: UsersService,
    private readonly learningHistoryService: LearningHistoryService,
    private readonly snapshotService: MissionSnapshotService,
    private readonly candidateService: MissionCandidateService,
    private readonly aiSelector: MissionAiSelectorService,
    private readonly rewardService: MissionRewardService,
    private readonly summaryService: MissionSummaryService,
    private readonly notificationService: MissionNotificationService,
  ) {}

  async getToday(userId: string) {
    const now = new Date();
    const timezone = await this.getUserTimezone(userId);
    await this.expireOldSets(userId, now);

    const localDate = getLocalDate(now, timezone);
    let set = await this.missionSetModel
      .findOne({ userId: new Types.ObjectId(userId), localDate })
      .exec();

    if (!set) {
      set = await this.generateNormalSet(userId, timezone, now);
    }

    return this.toResponse(set, now);
  }

  async getMyMissions(userId: string) {
    const today = await this.getToday(userId);
    return today.missions;
  }

  async openMission(userId: string, missionId: string) {
    const now = new Date();
    await this.expireOldSets(userId, now);
    const set = await this.findActiveSetByMission(userId, missionId, now);
    const mission = set.missions.find((item) => item.missionId === missionId);
    if (!mission) throw new NotFoundException('Mission not found');
    if (mission.status === 'PENDING') {
      mission.status = 'OPENED';
      mission.openedAt = now;
      await set.save();
      await this.learningHistoryService.recordEvent({
        userId,
        eventType: 'MISSION_OPENED',
        idempotencyKey: `mission-opened:${userId}:${missionId}`,
        targetType: mission.targetType,
        targetId: mission.targetId,
        topic: mission.topic,
        metadata: { missionId, localDate: set.localDate },
        occurredAt: now,
      });
      await this.summaryService.sync(set);
    }
    return this.toResponse(set, now);
  }

  async dismissMission(userId: string, missionId: string, reason?: string) {
    const now = new Date();
    await this.expireOldSets(userId, now);
    const set = await this.findActiveSetByMission(userId, missionId, now);
    const mission = set.missions.find((item) => item.missionId === missionId);
    if (!mission) throw new NotFoundException('Mission not found');
    if (mission.missionKind !== 'NORMAL') {
      throw new BadRequestException('Hardcore mission cannot be dismissed.');
    }
    if (!ACTIVE_MISSION_STATUSES.includes(mission.status as never)) {
      throw new BadRequestException('Mission is not dismissible.');
    }

    mission.status = 'DISMISSED';
    mission.dismissedAt = now;
    mission.dismissReason = reason?.slice(0, 160);
    await set.save();
    await this.learningHistoryService.recordEvent({
      userId,
      eventType: 'MISSION_DISMISSED',
      idempotencyKey: `mission-dismissed:${userId}:${missionId}`,
      targetType: mission.targetType,
      targetId: mission.targetId,
      topic: mission.topic,
      metadata: { missionId, localDate: set.localDate, reason },
      occurredAt: now,
    });
    await this.recalculateSet(userId, set, now);
    return this.toResponse(set, now);
  }

  async processActivityEvent(input: RecordActivityEventInput) {
    const now = input.occurredAt ?? new Date();
    const userId = input.userId;
    const timezone = await this.getUserTimezone(userId);
    await this.expireOldSets(userId, now);

    const set = await this.missionSetModel
      .findOne({
        userId: new Types.ObjectId(userId),
        localDate: getLocalDate(now, timezone),
        status: 'ACTIVE',
        expiresAt: { $gt: now },
      })
      .exec();
    if (!set) return { matched: false, completed: false };

    const mission = set.missions.find((item) => this.matchesEvent(item, input));
    if (!mission) return { matched: false, completed: false };

    mission.status = 'COMPLETED';
    mission.progress = mission.target;
    mission.completedAt = now;
    await set.save();

    const reward = await this.rewardService.grant({
      userId,
      missionSetId: String(set._id),
      missionId: mission.missionId,
      rewardKey: `mission:${set.localDate}:${userId}:${mission.missionId}`,
      rewardKind: 'MISSION',
      xp: mission.rewardSnapshot?.xp ?? 0,
    });
    if (reward.granted) {
      set.totalRewardXp += reward.xp;
      await set.save();
    }

    await this.learningHistoryService.recordEvent({
      userId,
      eventType: 'MISSION_COMPLETED',
      idempotencyKey: `mission-completed:${userId}:${mission.missionId}`,
      targetType: mission.targetType,
      targetId: mission.targetId,
      topic: mission.topic,
      metadata: {
        missionId: mission.missionId,
        missionKind: mission.missionKind,
        localDate: set.localDate,
        sourceEvent: input.eventType,
      },
      occurredAt: now,
    });
    await this.notificationService.create({
      userId,
      type: 'MISSION_COMPLETED',
      title: 'Mission hoàn thành',
      message: `Bạn nhận +${mission.rewardSnapshot?.xp ?? 0} XP từ ${mission.title}.`,
      missionId: mission.missionId,
    });

    await this.recalculateSet(userId, set, now);
    return { matched: true, completed: true, missionId: mission.missionId };
  }

  getHistory(userId: string, days = 30) {
    return this.summaryService.history(userId, days);
  }

  getSummary(userId: string, days = 30) {
    return this.summaryService.stats(userId, days);
  }

  getNotifications(userId: string, limit = 20) {
    return this.notificationService.list(userId, limit);
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await this.notificationService.markRead(
      userId,
      notificationId,
    );
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  private async generateNormalSet(userId: string, timezone: string, now: Date) {
    const snapshot = await this.snapshotService.build(userId);
    const candidates = await this.candidateService.build(
      userId,
      snapshot,
      'NORMAL',
    );
    const selection = await this.aiSelector.select(
      snapshot,
      candidates,
      'NORMAL',
    );
    const missions = this.buildMissionItems(
      selection.missions,
      candidates,
      'NORMAL',
    );
    const localDate = getLocalDate(now, timezone);
    const expiresAt = getNextLocalMidnight(now, timezone);

    try {
      const set = await this.missionSetModel.create({
        userId: new Types.ObjectId(userId),
        localDate,
        timezone,
        status:
          missions.length >= NORMAL_MISSION_COUNT ? 'ACTIVE' : 'NEEDS_COURSE',
        generationSource: selection.source,
        generationStatus: missions.length > 0 ? 'READY' : 'FAILED',
        missions,
        completedNormal: 0,
        resolvedNormal: 0,
        hardcoreUnlocked: false,
        hardcoreGenerationStatus: 'LOCKED',
        setBonusGranted: false,
        totalRewardXp: 0,
        analysisSummary: selection.analysisSummary ?? {},
        aiMetadata: selection.aiMetadata ?? {},
        expiresAt,
        purgeAt: new Date(
          expiresAt.getTime() + MISSION_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        ),
      });
      await this.summaryService.sync(set);
      return set;
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) throw error;
      const existing = await this.missionSetModel
        .findOne({ userId: new Types.ObjectId(userId), localDate })
        .orFail()
        .exec();
      return existing;
    }
  }

  private buildMissionItems(
    selected: AiSelectedMission[],
    candidates: MissionCandidate[],
    kind: MissionKind,
  ): DailyMissionItem[] {
    const candidatesById = new Map(
      candidates.map((candidate) => [candidate.candidateId, candidate]),
    );
    const items: DailyMissionItem[] = [];

    selected.forEach((mission, index) => {
      const candidate = candidatesById.get(mission.candidateId);
      if (!candidate) return;

      const item: DailyMissionItem = {
        missionId: randomUUID(),
        missionIndex: kind === 'HARDCORE' ? 5 : index + 1,
        missionKind: kind,
        status: 'PENDING',
        candidateId: candidate.candidateId,
        actionType: candidate.actionType,
        targetType: candidate.targetType,
        targetId: candidate.targetId,
        topic: candidate.topic,
        href: candidate.href,
        title: mission.title || candidate.title,
        message: mission.message || candidate.message,
        reasonCode: mission.reasonCode,
        progress: 0,
        target: 1,
        estimatedMinutes: candidate.estimatedMinutes,
        rewardSnapshot: { xp: candidate.rewardXp },
        expectedEventTypes: candidate.expectedEventTypes,
        metadata: candidate.metadata ?? {},
      };

      items.push(item);
    });

    return items;
  }

  private async recalculateSet(
    userId: string,
    set: DailyMissionSetDocument,
    now: Date,
  ) {
    const normal = set.missions.filter(
      (mission) => mission.missionKind === 'NORMAL',
    );
    set.completedNormal = normal.filter(
      (mission) => mission.status === 'COMPLETED',
    ).length;
    set.resolvedNormal = normal.filter((mission) =>
      ['COMPLETED', 'DISMISSED', 'EXPIRED'].includes(mission.status),
    ).length;

    const hardcore = set.missions.find(
      (mission) => mission.missionKind === 'HARDCORE',
    );
    set.status = hardcore?.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE';
    await set.save();

    if (set.completedNormal >= NORMAL_MISSION_COUNT && !set.setBonusGranted) {
      const reward = await this.rewardService.grant({
        userId,
        missionSetId: String(set._id),
        rewardKey: `set-bonus:${set.localDate}:${userId}`,
        rewardKind: 'SET_BONUS',
        xp: SET_COMPLETION_BONUS_XP,
      });
      if (reward.granted) {
        set.setBonusGranted = true;
        set.totalRewardXp += reward.xp;
        await set.save();
      }
      await this.learningHistoryService.recordEvent({
        userId,
        eventType: 'MISSION_SET_COMPLETED',
        idempotencyKey: `mission-set-completed:${userId}:${set.localDate}`,
        metadata: {
          localDate: set.localDate,
          bonusXp: SET_COMPLETION_BONUS_XP,
        },
        occurredAt: now,
      });
    }

    if (set.completedNormal >= NORMAL_MISSION_COUNT && !set.hardcoreUnlocked) {
      set.hardcoreUnlocked = true;
      set.hardcoreGenerationStatus = 'GENERATING';
      await set.save();
      await this.learningHistoryService.recordEvent({
        userId,
        eventType: 'HARDCORE_UNLOCKED',
        idempotencyKey: `hardcore-unlocked:${userId}:${set.localDate}`,
        metadata: { localDate: set.localDate },
        occurredAt: now,
      });
      await this.notificationService.create({
        userId,
        type: 'HARDCORE_UNLOCKED',
        title: 'Hardcore đã mở khóa',
        message: 'Bạn hoàn thành 4/4 mission. Thử thách cuối ngày đã sẵn sàng!',
      });
      await this.generateHardcoreMission(userId, set, now);
    }

    await this.summaryService.sync(set);
  }

  private async generateHardcoreMission(
    userId: string,
    set: DailyMissionSetDocument,
    now: Date,
  ) {
    if (now >= set.expiresAt) {
      set.hardcoreGenerationStatus = 'FAILED';
      await set.save();
      return;
    }

    const snapshot = await this.snapshotService.build(userId);
    const candidates = await this.candidateService.build(
      userId,
      snapshot,
      'HARDCORE',
    );
    const selection = await this.aiSelector.select(
      snapshot,
      candidates,
      'HARDCORE',
    );
    const missions = this.buildMissionItems(
      selection.missions,
      candidates,
      'HARDCORE',
    );
    const hardcore = missions[0];
    if (!hardcore) {
      set.hardcoreGenerationStatus = 'FAILED';
      await set.save();
      return;
    }

    set.missions.push(hardcore);
    set.hardcoreGenerationStatus = 'READY';
    set.analysisSummary = {
      ...(set.analysisSummary ?? {}),
      hardcore: selection.analysisSummary ?? {},
    };
    set.aiMetadata = {
      ...(set.aiMetadata ?? {}),
      hardcore: selection.aiMetadata ?? {},
    };
    await set.save();
    await this.summaryService.sync(set);
  }

  private matchesEvent(
    mission: DailyMissionItem,
    event: RecordActivityEventInput,
  ) {
    if (!ACTIVE_MISSION_STATUSES.includes(mission.status as never))
      return false;
    if (!mission.expectedEventTypes.includes(event.eventType)) return false;

    const actionType = mission.actionType as MissionActionType;
    if (actionType === 'FEED_PET') return event.eventType === 'PET_FED';

    if (actionType === 'PRACTICE_TOPIC') {
      return (
        event.passed === true &&
        this.normalize(event.topic) === this.normalize(mission.topic)
      );
    }

    if (['PASS_QUIZ', 'REVIEW_LESSON'].includes(actionType)) {
      return event.passed === true && event.targetId === mission.targetId;
    }

    if (['RETRY_NODE', 'COMPLETE_ROADMAP_NODE'].includes(actionType)) {
      return (
        event.eventType === 'ROADMAP_NODE_COMPLETED' &&
        event.targetId === mission.targetId
      );
    }

    if (actionType === 'CONTINUE_LESSON') {
      return (
        event.eventType === 'LESSON_COMPLETED' &&
        event.targetId === mission.targetId
      );
    }

    return event.targetId === mission.targetId;
  }

  private async findActiveSetByMission(
    userId: string,
    missionId: string,
    now: Date,
  ) {
    const set = await this.missionSetModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: 'ACTIVE',
        expiresAt: { $gt: now },
        'missions.missionId': missionId,
      })
      .exec();
    if (!set) throw new NotFoundException('Mission not found or expired');
    return set;
  }

  private async expireOldSets(userId: string, now: Date) {
    const sets = await this.missionSetModel
      .find({
        userId: new Types.ObjectId(userId),
        status: 'ACTIVE',
        expiresAt: { $lte: now },
      })
      .limit(20)
      .exec();

    for (const set of sets) {
      for (const mission of set.missions) {
        if (ACTIVE_MISSION_STATUSES.includes(mission.status as never)) {
          mission.status = 'EXPIRED';
          mission.expiredAt = now;
        }
      }
      set.status = 'EXPIRED';
      await set.save();
      await this.summaryService.sync(set);
    }
  }

  private async getUserTimezone(userId: string) {
    const user = await this.usersService.findById(userId);
    const timezone = (user as { timezone?: string } | null)?.timezone;
    return timezone && isValidTimeZone(timezone)
      ? timezone
      : DEFAULT_MISSION_TIMEZONE;
  }

  private toResponse(set: DailyMissionSetDocument, now = new Date()) {
    const normal = set.missions.filter(
      (mission) => mission.missionKind === 'NORMAL',
    );
    const completedNormal = normal.filter(
      (mission) => mission.status === 'COMPLETED',
    ).length;
    const activeMission = set.missions.find((mission) =>
      ACTIVE_MISSION_STATUSES.includes(mission.status as never),
    );

    return {
      id: String(set._id),
      localDate: set.localDate,
      timezone: set.timezone,
      status: set.status,
      generationSource: set.generationSource,
      generationStatus: set.generationStatus,
      serverNow: now.toISOString(),
      expiresAt: set.expiresAt,
      progress: {
        completedNormal,
        totalNormal: NORMAL_MISSION_COUNT,
        resolvedNormal: set.resolvedNormal,
        hardcoreUnlocked: set.hardcoreUnlocked,
        hardcoreGenerationStatus: set.hardcoreGenerationStatus,
        setBonusGranted: set.setBonusGranted,
      },
      activeMissionId: activeMission?.missionId,
      missions: set.missions
        .sort((a, b) => a.missionIndex - b.missionIndex)
        .map((mission) => ({
          missionId: mission.missionId,
          missionIndex: mission.missionIndex,
          missionKind: mission.missionKind,
          status: mission.status,
          actionType: mission.actionType,
          targetType: mission.targetType,
          targetId: mission.targetId,
          topic: mission.topic,
          href: mission.href,
          title: mission.title,
          message: mission.message,
          reasonCode: mission.reasonCode,
          progress: mission.progress,
          target: mission.target,
          estimatedMinutes: mission.estimatedMinutes,
          reward: mission.rewardSnapshot,
          openedAt: mission.openedAt,
          completedAt: mission.completedAt,
          dismissedAt: mission.dismissedAt,
          expiredAt: mission.expiredAt,
        })),
      analysisSummary: set.analysisSummary,
      totalRewardXp: set.totalRewardXp,
    };
  }

  private normalize(value?: string) {
    return value?.trim().toLowerCase() || '';
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
