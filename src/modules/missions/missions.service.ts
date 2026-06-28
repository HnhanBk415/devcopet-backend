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
} from './utils/mission-date.util';

const NORMAL_MISSION_COUNT = 5;
const SET_COMPLETION_BONUS_XP = 50;
const MISSION_RETENTION_DAYS = 30;
const DAILY_MISSION_VERSION = 'daily-mission-v6-dynamic';
const ACTIVE_MISSION_STATUSES = ['PENDING', 'OPENED'] as const;
const MISSION_EVENT_HISTORY_TYPES = [
  'MISSION_OPENED',
  'MISSION_COMPLETED',
  'MISSION_SET_COMPLETED',
] as const;
const CURRENT_MISSION_STATUSES = [
  'LOCKED',
  'PENDING',
  'OPENED',
  'COMPLETED',
  'FAILED',
] as const;

@Injectable()
export class MissionsService {
  constructor(
    @InjectModel(DailyMissionSet.name)
    private readonly missionSetModel: Model<DailyMissionSetDocument>,
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
    const timezone = this.getUserTimezone(userId);
    await this.expireOldSets(userId, now);

    const localDate = getLocalDate(now, timezone);
    let set = await this.missionSetModel
      .findOne({ userId: new Types.ObjectId(userId), localDate })
      .exec();

    if (set && this.isStaleTodaySet(set)) {
      await this.missionSetModel
        .deleteOne({ _id: set._id, userId: new Types.ObjectId(userId) })
        .exec();
      set = null;
    }

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
    if (mission.status === 'LOCKED') {
      throw new BadRequestException('Locked mission cannot be opened.');
    }
    if (mission.status === 'PENDING') {
      mission.status = 'OPENED';
      mission.openedAt = now;
      set.markModified('missions');
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

  dismissMission(userId: string, missionId: string, reason?: string) {
    void userId;
    void missionId;
    void reason;
    throw new BadRequestException('Daily missions cannot be dismissed.');
  }

  async processActivityEvent(input: RecordActivityEventInput) {
    const now = input.occurredAt ?? new Date();
    const userId = input.userId;
    const timezone = this.getUserTimezone(userId);
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

    await this.completeMissionInSet(userId, set, mission, now, input.eventType);
    return { matched: true, completed: true, missionId: mission.missionId };
  }

  async completeMatchingDailyMissions(input: {
    userId: string;
    actionType?: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const now = new Date();
    const timezone = this.getUserTimezone(input.userId);
    await this.expireOldSets(input.userId, now);

    const set = await this.missionSetModel
      .findOne({
        userId: new Types.ObjectId(input.userId),
        localDate: getLocalDate(now, timezone),
        status: 'ACTIVE',
        expiresAt: { $gt: now },
      })
      .exec();
    if (!set) return;

    const mission = set.missions.find((item) => {
      if (!ACTIVE_MISSION_STATUSES.includes(item.status as never)) return false;
      if (input.actionType && item.actionType !== input.actionType)
        return false;
      if (input.targetType && item.targetType !== input.targetType)
        return false;
      return !input.targetId || item.targetId === input.targetId;
    });
    if (!mission) return;

    await this.completeMissionInSet(
      input.userId,
      set,
      mission,
      now,
      'internal',
    );
  }

  getHistory(userId: string, days = 30) {
    return this.summaryService.history(userId, days);
  }

  getSummary(userId: string, days = 30) {
    return this.summaryService.stats(userId, days);
  }

  async getNotifications(userId: string, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const [notifications, history] = await Promise.all([
      this.notificationService.list(userId, safeLimit),
      this.learningHistoryService.getActivityHistory(userId, safeLimit * 3),
    ]);

    return {
      ...notifications,
      history: history
        .filter((event) =>
          MISSION_EVENT_HISTORY_TYPES.includes(event.eventType as never),
        )
        .slice(0, safeLimit),
    };
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
      now,
    );

    const localDate = getLocalDate(now, timezone);
    const expiresAt = getNextLocalMidnight(now, timezone);

    try {
      const normalMissionCount = missions.filter(
        (mission) => mission.missionKind === 'NORMAL',
      ).length;
      const set = await this.missionSetModel.create({
        userId: new Types.ObjectId(userId),
        localDate,
        timezone,
        status:
          normalMissionCount >= NORMAL_MISSION_COUNT
            ? 'ACTIVE'
            : 'NEEDS_COURSE',
        generationSource: selection.source,
        generationStatus: normalMissionCount > 0 ? 'READY' : 'FAILED',
        missions,
        completedNormal: 0,
        resolvedNormal: 0,

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
    generatedAt: Date,
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
        status: kind === 'HARDCORE' ? 'LOCKED' : 'PENDING',
        candidateId: candidate.candidateId,
        generationVersion: DAILY_MISSION_VERSION,
        actionType: candidate.actionType,
        targetType: candidate.targetType,
        targetId: candidate.targetId,
        topic: candidate.topic,
        href: candidate.href,
        ctaLabel:
          candidate.ctaLabel ?? this.buildDailyMissionCtaLabel(candidate),
        ctaPath: this.buildDailyMissionCtaPath(candidate),
        title: mission.title || candidate.title,
        message: mission.message || candidate.message,
        detailMessage: candidate.detailMessage,
        sourceType: candidate.sourceType ?? 'FALLBACK',
        generatedReason:
          candidate.generatedReason ||
          mission.reasonCode ||
          'Rule-based daily mission.',
        generatedAt,
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
      ['COMPLETED', 'FAILED'].includes(mission.status),
    ).length;

    set.status =
      set.completedNormal >= NORMAL_MISSION_COUNT ? 'COMPLETED' : 'ACTIVE';
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

    await this.summaryService.sync(set);
  }

  private async completeMissionInSet(
    userId: string,
    set: DailyMissionSetDocument,
    mission: DailyMissionItem,
    now: Date,
    sourceEvent: string,
  ) {
    if (mission.status === 'COMPLETED') return;

    mission.status = 'COMPLETED';
    mission.progress = mission.target;
    mission.completedAt = now;
    set.markModified('missions');
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
        sourceEvent,
      },
      occurredAt: now,
    });
    await this.notificationService.create({
      userId,
      type: 'MISSION_COMPLETED',
      title: 'Mission completed',
      message: `You earned +${mission.rewardSnapshot?.xp ?? 0} XP from ${mission.title}.`,
      missionId: mission.missionId,
    });

    await this.recalculateSet(userId, set, now);
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
    if (actionType === 'ENTER_ARENA')
      return event.eventType === 'ARENA_MATCH_FINISHED';

    if (actionType === 'PRACTICE_TOPIC' || actionType === 'LIGHT_PRACTICE') {
      return (
        event.passed === true &&
        this.normalize(event.topic) === this.normalize(mission.topic)
      );
    }

    if (
      ['PASS_QUIZ', 'REVIEW_LESSON', 'TAKE_TEST', 'HARD_QUIZ'].includes(
        actionType,
      )
    ) {
      return event.passed === true && event.targetId === mission.targetId;
    }

    if (
      [
        'RETRY_NODE',
        'COMPLETE_ROADMAP_NODE',
        'CONTINUE_NODE',
        'HARD_LEVEL',
      ].includes(actionType)
    ) {
      if (mission.sourceType === 'STARTER') {
        return event.eventType === 'ROADMAP_NODE_COMPLETED';
      }
      return (
        event.eventType === 'ROADMAP_NODE_COMPLETED' &&
        event.targetId === mission.targetId
      );
    }

    if (actionType === 'CONTINUE_LESSON' || actionType === 'CONTINUE_COURSE') {
      if (mission.missionKind === 'HARDCORE') {
        return event.eventType === 'LESSON_COMPLETED';
      }
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
        status: { $in: ['ACTIVE', 'COMPLETED'] },
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
          mission.status = 'FAILED';
          mission.failedAt = now;
        }
      }
      set.status = 'EXPIRED';
      set.markModified('missions');
      await set.save();
      await this.summaryService.sync(set);
    }
  }

  private getUserTimezone(userId: string) {
    void userId;
    return DEFAULT_MISSION_TIMEZONE;
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
    const hardcore = set.missions.find(
      (mission) => mission.missionKind === 'HARDCORE',
    );
    const sortedMissions = [...set.missions].sort(
      (a, b) => a.missionIndex - b.missionIndex,
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
        hardcoreCompleted: hardcore?.status === 'COMPLETED',
        hardcoreGenerationStatus: set.hardcoreGenerationStatus,
        setBonusGranted: set.setBonusGranted,
      },
      activeMissionId: activeMission?.missionId,
      activeMission: activeMission
        ? this.toMissionResponse(set, activeMission)
        : null,
      missions: sortedMissions.map((mission) =>
        this.toMissionResponse(set, mission),
      ),
      analysisSummary: set.analysisSummary,
      totalRewardXp: set.totalRewardXp,
    };
  }

  private toMissionResponse(
    set: DailyMissionSetDocument,
    mission: DailyMissionItem,
  ) {
    return {
      id: mission.missionId,
      missionId: mission.missionId,
      dailySetId: String(set._id),
      localDate: set.localDate,
      missionIndex: mission.missionIndex,
      missionKind: mission.missionKind,
      status: mission.status,
      actionType: mission.actionType,
      targetType: mission.targetType,
      targetId: mission.targetId,
      topic: mission.topic,
      href: mission.href,
      ctaLabel: mission.ctaLabel,
      ctaPath: mission.ctaPath,
      generationVersion: mission.generationVersion,
      title: mission.title,
      message: mission.message,
      detailMessage: mission.detailMessage,
      sourceType: mission.sourceType,
      generatedReason: mission.generatedReason,
      generatedAt: mission.generatedAt,
      reasonCode: mission.reasonCode,
      progress: mission.progress,
      target: mission.target,
      estimatedMinutes: mission.estimatedMinutes,
      reward: mission.rewardSnapshot,
      openedAt: mission.openedAt,
      completedAt: mission.completedAt,
      failedAt: mission.failedAt,
    };
  }

  private buildDailyMissionCtaLabel(candidate: MissionCandidate) {
    if (candidate.actionType === 'FEED_PET') return 'Open Profile';
    if (candidate.actionType === 'ENTER_ARENA') return 'Enter Arena';
    if (candidate.actionType === 'REVIEW_LESSON') return 'Review';
    if (candidate.actionType === 'RETRY_NODE') return 'Retry';
    if (candidate.actionType === 'PASS_QUIZ') return 'Take Quiz';
    if (candidate.actionType === 'HARD_QUIZ') return 'Start';
    if (candidate.actionType === 'HARD_LEVEL') return 'Start';
    if (candidate.actionType === 'CONTINUE_LESSON') return 'Continue';
    if (candidate.actionType === 'CONTINUE_COURSE') return 'Continue';
    if (candidate.actionType === 'CONTINUE_NODE') return 'Continue';
    return 'Start';
  }

  private buildDailyMissionCtaPath(candidate: MissionCandidate) {
    if (candidate.ctaPath?.trim()) return candidate.ctaPath.trim();

    if (candidate.actionType === 'FEED_PET') return '/profile';
    if (candidate.actionType === 'ENTER_ARENA') return '/arena';
    if (candidate.targetType === 'LESSON') {
      const courseSlug =
        typeof candidate.metadata?.courseSlug === 'string'
          ? candidate.metadata.courseSlug
          : 'python-basic';
      const mode =
        typeof candidate.metadata?.mode === 'string'
          ? candidate.metadata.mode
          : 'easy';
      return `/roadmap/${courseSlug}/${mode}/nodes/${candidate.targetId}/challenge`;
    }
    if (candidate.targetType === 'NODE') {
      const courseSlug =
        typeof candidate.metadata?.courseSlug === 'string'
          ? candidate.metadata.courseSlug
          : 'python-basic';
      const mode =
        typeof candidate.metadata?.mode === 'string'
          ? candidate.metadata.mode
          : 'easy';
      return `/roadmap/${courseSlug}/${mode}/nodes/${candidate.targetId}/challenge`;
    }
    if (candidate.targetType === 'QUIZ') return `/quiz/${candidate.targetId}`;
    if (candidate.targetType === 'COURSE')
      return `/course/${candidate.targetId}`;

    return candidate.href || '/roadmap';
  }

  private normalize(value?: string) {
    return value?.trim().toLowerCase() || '';
  }

  private isStaleTodaySet(set: DailyMissionSetDocument) {
    const missions = Array.isArray(set.missions) ? set.missions : [];
    const normal = missions.filter(
      (mission) => mission.missionKind === 'NORMAL',
    );

    if (normal.length !== NORMAL_MISSION_COUNT) return true;

    return missions.some((mission) => {
      if (mission.generationVersion !== DAILY_MISSION_VERSION) return true;
      if (!mission.ctaLabel?.trim() || !mission.ctaPath?.trim()) return true;
      if (!CURRENT_MISSION_STATUSES.includes(mission.status as never))
        return true;
      return [
        mission.title,
        mission.message,
        mission.detailMessage,
        mission.ctaLabel,
      ].some((value) => this.hasLegacyOrNonEnglishText(value));
    });
  }

  private hasLegacyOrNonEnglishText(value?: string) {
    if (!value) return false;
    return (
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i.test(
        value,
      ) ||
      /(Hoàn thành|Tiếp tục|Vượt quiz|Ôn lại|Chinh phục|Củng cố|Phục thù|Hardcore đã|Bạn hoàn thành)/i.test(
        value,
      )
    );
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
