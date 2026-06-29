import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import type { RecordActivityEventInput } from '../learning-history/learning-history.types';
import { LearningHistoryService } from '../learning-history/learning-history.service';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../progress/schemas/lesson-progress.schema';
import {
  RoadmapProgress,
  RoadmapProgressDocument,
} from '../roadmap/schemas/roadmap-progress.schema';
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
const DAILY_MISSION_VERSION = 'daily-mission-v6-safe-daily-mission-targets';
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
const VIETNAMESE_DIACRITIC_REGEX = /[\u0300-\u036f\u0111\u0110]/u;
const LEGACY_MISSION_TEXT_REGEX =
  /(Hoàn thành|Tiếp tục|Vượt quiz|Ôn lại|Chinh phục|Củng cố|Phục thù|Hardcore đã|Bạn hoàn thành)/i;

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(
    @InjectModel(DailyMissionSet.name)
    private readonly missionSetModel: Model<DailyMissionSetDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(RoadmapProgress.name)
    private readonly roadmapProgressModel: Model<RoadmapProgressDocument>,
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

    await this.reconcileSetWithTargets(userId, set, now);
    await this.removeUnavailableActiveTargets(userId, set);
    await this.repairTodaySetIfIncomplete(userId, set, now);
    await this.reconcileSetWithTargets(userId, set, now);
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
    await this.reconcileSetWithTargets(userId, set, now);
    await this.repairTodaySetIfIncomplete(userId, set, now);
    const mission = set.missions.find((item) => item.missionId === missionId);
    if (!mission) throw new NotFoundException('Mission not found');
    if (mission.status === 'LOCKED') {
      throw new BadRequestException('Locked mission cannot be opened.');
    }
    if (mission.status === 'COMPLETED') {
      return this.toOpenedMissionResponse(set, mission, now);
    }
    if (!ACTIVE_MISSION_STATUSES.includes(mission.status as never)) {
      throw new BadRequestException('Mission cannot be opened.');
    }
    if (
      ACTIVE_MISSION_STATUSES.includes(mission.status as never) &&
      (await this.isDailyMissionTargetCompleted({
        userId,
        targetType: mission.targetType,
        targetId: mission.targetId,
        actionType: mission.actionType,
        metadata: mission.metadata,
        localDate: set.localDate,
      }))
    ) {
      await this.completeMissionInSet(
        userId,
        set,
        mission,
        now,
        'target-reconciled-on-open',
        { grantReward: false, notify: false },
      );
      return this.toOpenedMissionResponse(set, mission, now);
    }
    const openable = await this.isDailyMissionTargetOpenable({
      userId,
      mission,
    });
    if (!openable.ok) {
      throw new BadRequestException(openable.reason);
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
    return this.toOpenedMissionResponse(set, mission, now);
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
        status: { $in: ['ACTIVE', 'NEEDS_COURSE'] },
        expiresAt: { $gt: now },
      })
      .exec();
    if (!set) return { matched: false, completed: false };

    const missions = set.missions.filter((item) =>
      this.matchesEvent(item, input),
    );
    if (missions.length === 0) return { matched: false, completed: false };

    for (const mission of missions) {
      await this.completeMissionInSet(
        userId,
        set,
        mission,
        now,
        input.eventType,
      );
    }
    return {
      matched: true,
      completed: true,
      missionId: missions[0].missionId,
      missionIds: missions.map((mission) => mission.missionId),
    };
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
        status: { $in: ['ACTIVE', 'NEEDS_COURSE'] },
        expiresAt: { $gt: now },
      })
      .exec();
    if (!set) return;

    const missions = set.missions.filter((item) => {
      if (!ACTIVE_MISSION_STATUSES.includes(item.status as never)) return false;
      if (input.actionType && item.actionType !== input.actionType)
        return false;
      if (input.targetType && item.targetType !== input.targetType)
        return false;
      return !input.targetId || item.targetId === input.targetId;
    });
    if (missions.length === 0) return;

    for (const mission of missions) {
      await this.completeMissionInSet(
        input.userId,
        set,
        mission,
        now,
        'internal',
      );
    }
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
    const missions = await this.removeAlreadyCompletedGeneratedMissions(
      userId,
      this.buildMissionItems(selection.missions, candidates, 'NORMAL', now),
      getLocalDate(now, timezone),
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

  private async removeAlreadyCompletedGeneratedMissions(
    userId: string,
    missions: DailyMissionItem[],
    localDate: string,
  ) {
    const filtered: DailyMissionItem[] = [];
    for (const mission of missions) {
      const completed = await this.isDailyMissionTargetCompleted({
        userId,
        targetType: mission.targetType,
        targetId: mission.targetId,
        actionType: mission.actionType,
        metadata: mission.metadata,
        localDate,
      });
      if (!completed) filtered.push(mission);
    }

    return filtered.map((mission, index) => ({
      ...mission,
      missionIndex: index + 1,
    }));
  }

  private async repairTodaySetIfIncomplete(
    userId: string,
    set: DailyMissionSetDocument,
    now: Date,
  ) {
    const normal = set.missions.filter(
      (mission) => mission.missionKind === 'NORMAL',
    );
    if (normal.length >= NORMAL_MISSION_COUNT) {
      await this.recalculateSet(userId, set, now, { grantSetBonus: false });
      return;
    }

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
    const generated = await this.removeAlreadyCompletedGeneratedMissions(
      userId,
      this.buildMissionItems(selection.missions, candidates, 'NORMAL', now),
      set.localDate,
    );

    const additions: DailyMissionItem[] = [];
    for (const mission of generated) {
      if (
        this.hasDuplicateMissionTarget(set.missions, mission) ||
        this.hasDuplicateMissionTarget(additions, mission)
      ) {
        continue;
      }

      const openable = await this.isDailyMissionTargetOpenable({
        userId,
        mission,
      });
      if (!openable.ok) continue;

      additions.push({
        ...mission,
        missionIndex: normal.length + additions.length + 1,
        generationVersion: DAILY_MISSION_VERSION,
      });

      if (normal.length + additions.length >= NORMAL_MISSION_COUNT) break;
    }

    if (additions.length > 0) {
      set.missions.push(...additions);
      set.generationStatus = 'READY';
      set.markModified('missions');
    } else if (normal.length === 0) {
      set.generationStatus = 'FAILED';
    }

    this.reindexNormalMissions(set);
    await this.recalculateSet(userId, set, now, { grantSetBonus: false });
  }

  private hasDuplicateMissionTarget(
    missions: DailyMissionItem[],
    mission: DailyMissionItem,
  ) {
    return missions.some(
      (item) =>
        item.candidateId === mission.candidateId ||
        (item.actionType === mission.actionType &&
          item.targetType === mission.targetType &&
          item.targetId === mission.targetId),
    );
  }

  private reindexNormalMissions(set: DailyMissionSetDocument) {
    let missionIndex = 1;
    for (const mission of set.missions) {
      if (mission.missionKind !== 'NORMAL') continue;
      mission.missionIndex = missionIndex;
      missionIndex += 1;
    }
    set.markModified('missions');
  }

  private async removeUnavailableActiveTargets(
    userId: string,
    set: DailyMissionSetDocument,
  ) {
    const kept: DailyMissionItem[] = [];
    let changed = false;

    for (const mission of set.missions) {
      const shouldValidate =
        mission.missionKind === 'NORMAL' &&
        ACTIVE_MISSION_STATUSES.includes(mission.status as never);
      if (!shouldValidate) {
        kept.push(mission);
        continue;
      }

      const openable = await this.isDailyMissionTargetOpenable({
        userId,
        mission,
      });
      if (openable.ok) {
        kept.push(mission);
        continue;
      }

      changed = true;
    }

    if (!changed) return;

    set.missions = kept;
    this.reindexNormalMissions(set);
    await set.save();
    await this.summaryService.sync(set);
  }

  private async reconcileSetWithTargets(
    userId: string,
    set: DailyMissionSetDocument,
    now: Date,
  ) {
    let changed = false;

    for (const mission of set.missions) {
      if (!ACTIVE_MISSION_STATUSES.includes(mission.status as never)) continue;

      const completed = await this.isDailyMissionTargetCompleted({
        userId,
        targetType: mission.targetType,
        targetId: mission.targetId,
        actionType: mission.actionType,
        metadata: mission.metadata,
        localDate: set.localDate,
      });
      if (!completed) continue;

      mission.status = 'COMPLETED';
      mission.progress = mission.target;
      mission.completedAt = mission.completedAt ?? now;
      changed = true;
    }

    if (!changed) return;

    set.markModified('missions');
    await this.recalculateSet(userId, set, now, { grantSetBonus: false });
  }

  private async isDailyMissionTargetCompleted(input: {
    userId: string;
    targetType: string;
    targetId: string;
    actionType?: string;
    metadata?: Record<string, unknown>;
    localDate?: string;
  }): Promise<boolean> {
    if (input.actionType === 'REVIEW_LESSON') {
      return this.hasTodayEvent(input, ['QUIZ_ATTEMPTED']);
    }

    if (input.targetType === 'LESSON') {
      if (!Types.ObjectId.isValid(input.targetId)) return false;
      const completed = await this.lessonProgressModel.exists({
        userId: new Types.ObjectId(input.userId),
        lessonId: new Types.ObjectId(input.targetId),
        completed: true,
      });
      return Boolean(completed);
    }

    if (input.targetType === 'NODE' || input.targetType === 'ROADMAP_NODE') {
      const courseSlug =
        typeof input.metadata?.courseSlug === 'string'
          ? input.metadata.courseSlug
          : undefined;
      const mode =
        input.metadata?.mode === 'easy' ||
        input.metadata?.mode === 'medium' ||
        input.metadata?.mode === 'hard'
          ? input.metadata.mode
          : undefined;
      const completed = await this.roadmapProgressModel.exists({
        userId: input.userId,
        nodeId: input.targetId,
        ...(courseSlug ? { courseSlug } : {}),
        ...(mode ? { mode } : {}),
      });
      return Boolean(completed);
    }

    if (input.targetType === 'PET') {
      return this.hasTodayEvent(input, ['PET_FED'], { ignoreTargetId: true });
    }

    if (input.targetType === 'ARENA') {
      return this.hasTodayEvent(input, ['ARENA_MATCH_FINISHED'], {
        ignoreTargetId: true,
      });
    }

    if (input.targetType === 'TOPIC') {
      return this.hasTodayEvent(input, ['ROADMAP_ATTEMPTED', 'QUIZ_ATTEMPTED']);
    }

    return false;
  }

  private async isDailyMissionTargetOpenable(input: {
    userId: string;
    mission: DailyMissionItem;
  }): Promise<{ ok: true } | { ok: false; reason: string }> {
    const { mission } = input;
    if (!mission.ctaPath?.trim() || !mission.ctaPath.startsWith('/')) {
      return { ok: false, reason: 'Mission route unavailable.' };
    }

    if (mission.targetType === 'LESSON') {
      if (!Types.ObjectId.isValid(mission.targetId)) {
        return { ok: false, reason: 'Mission target is unavailable.' };
      }
      const lesson = await this.lessonModel.exists({
        _id: new Types.ObjectId(mission.targetId),
        isPublished: true,
      });
      return lesson
        ? { ok: true }
        : { ok: false, reason: 'Mission target is unavailable.' };
    }

    if (
      mission.targetType === 'NODE' ||
      mission.targetType === 'ROADMAP_NODE'
    ) {
      const route = this.parseRoadmapChallengePath(mission.ctaPath);
      if (!route || route.nodeId !== mission.targetId) {
        return { ok: false, reason: 'Mission route unavailable.' };
      }

      if (route.mode !== 'easy') {
        return { ok: true };
      }

      const unlocked = await this.isEasyRoadmapNodeUnlocked({
        userId: input.userId,
        courseSlug: route.courseSlug,
        nodeId: route.nodeId,
      });
      return unlocked
        ? { ok: true }
        : { ok: false, reason: 'Mission target is locked.' };
    }

    if (
      ['PET', 'ARENA', 'TOPIC', 'QUIZ', 'COURSE'].includes(mission.targetType)
    ) {
      return { ok: true };
    }

    return { ok: false, reason: 'Mission target is unavailable.' };
  }

  private parseRoadmapChallengePath(path: string) {
    const match = path.match(
      /^\/roadmap\/([^/]+)\/(easy|medium|hard)\/nodes\/([^/]+)\/challenge$/i,
    );
    if (!match) return null;
    return {
      courseSlug: match[1],
      mode: match[2].toLowerCase() as 'easy' | 'medium' | 'hard',
      nodeId: match[3],
    };
  }

  private async isEasyRoadmapNodeUnlocked(input: {
    userId: string;
    courseSlug: string;
    nodeId: string;
  }) {
    if (!Types.ObjectId.isValid(input.nodeId)) return false;

    const course = await this.courseModel
      .findOne({ slug: input.courseSlug, isPublished: true })
      .select({ _id: 1 })
      .lean<{ _id: Types.ObjectId }>()
      .exec();
    if (!course) return false;

    const chapters = await this.chapterModel
      .find({ courseId: course._id, isPublished: true })
      .sort({ order: 1 })
      .select({ _id: 1 })
      .lean<Array<{ _id: Types.ObjectId }>>()
      .exec();
    if (chapters.length === 0) return false;

    const lessons = await this.lessonModel
      .find({
        chapterId: { $in: chapters.map((chapter) => chapter._id) },
        isPublished: true,
      })
      .select({ _id: 1, chapterId: 1, order: 1 })
      .lean<
        Array<{ _id: Types.ObjectId; chapterId: Types.ObjectId; order: number }>
      >()
      .exec();
    const lessonsByChapterId = new Map<
      string,
      Array<{ _id: Types.ObjectId; order: number }>
    >();
    for (const lesson of lessons) {
      const key = String(lesson.chapterId);
      if (!lessonsByChapterId.has(key)) lessonsByChapterId.set(key, []);
      lessonsByChapterId.get(key)!.push(lesson);
    }

    const orderedNodeIds = chapters.flatMap((chapter) =>
      (lessonsByChapterId.get(String(chapter._id)) ?? [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((lesson) => String(lesson._id)),
    );
    const targetIndex = orderedNodeIds.indexOf(input.nodeId);
    if (targetIndex < 0) return false;
    if (targetIndex === 0) return true;

    const previousNodeId = orderedNodeIds[targetIndex - 1];
    const previousCompleted = await this.roadmapProgressModel.exists({
      userId: input.userId,
      courseSlug: input.courseSlug,
      mode: 'easy',
      nodeId: previousNodeId,
    });
    return Boolean(previousCompleted);
  }

  private async hasTodayEvent(
    input: {
      userId: string;
      targetId: string;
      topic?: string;
      localDate?: string;
    },
    eventTypes: string[],
    options: { ignoreTargetId?: boolean } = {},
  ) {
    if (!input.localDate) return false;
    const { start, end } = this.getLocalDayRange(
      input.localDate,
      DEFAULT_MISSION_TIMEZONE,
    );
    const events = await this.learningHistoryService.getActivityHistory(
      input.userId,
      200,
    );

    return events.some((event) => {
      if (!eventTypes.includes(event.eventType)) return false;
      if (event.occurredAt < start || event.occurredAt >= end) return false;
      if (event.passed === false) return false;
      if (
        !options.ignoreTargetId &&
        event.targetId !== input.targetId &&
        event.topic !== input.targetId
      ) {
        return false;
      }
      return true;
    });
  }

  private getLocalDayRange(localDate: string, timezone: string) {
    const [year, month, day] = localDate.split('-').map(Number);
    const start = this.localDateTimeToUtc(year, month, day, timezone);
    const end = this.localDateTimeToUtc(year, month, day + 1, timezone);
    return { start, end };
  }

  private localDateTimeToUtc(
    year: number,
    month: number,
    day: number,
    timezone: string,
  ) {
    const desiredUtc = Date.UTC(year, month - 1, day);
    let guess = new Date(desiredUtc);
    for (let index = 0; index < 2; index++) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }).formatToParts(guess);
      const values = Object.fromEntries(
        parts
          .filter((part) => part.type !== 'literal')
          .map((part) => [part.type, Number(part.value)]),
      );
      const representedUtc = Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
        values.second,
      );
      guess = new Date(guess.getTime() + (desiredUtc - representedUtc));
    }
    return guess;
  }

  private async recalculateSet(
    userId: string,
    set: DailyMissionSetDocument,
    now: Date,
    options: { grantSetBonus?: boolean } = {},
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

    if (set.completedNormal >= NORMAL_MISSION_COUNT) {
      set.status = 'COMPLETED';
    } else if (normal.length >= NORMAL_MISSION_COUNT) {
      set.status = 'ACTIVE';
    } else {
      set.status = 'NEEDS_COURSE';
    }
    await set.save();

    if (
      options.grantSetBonus !== false &&
      set.completedNormal >= NORMAL_MISSION_COUNT &&
      !set.setBonusGranted
    ) {
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
    options: { grantReward?: boolean; notify?: boolean } = {},
  ) {
    if (mission.status === 'COMPLETED') return;
    const grantReward = options.grantReward !== false;
    const notify = options.notify !== false;

    mission.status = 'COMPLETED';
    mission.progress = mission.target;
    mission.completedAt = now;
    set.markModified('missions');
    await set.save();

    if (grantReward) {
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
    if (notify) {
      await this.createNotificationSafely({
        userId,
        type: 'DAILY_MISSION_COMPLETED',
        title: 'Daily mission completed',
        message: `You completed "${mission.title}".`,
        missionId: mission.missionId,
        metadata: {
          missionId: mission.missionId,
          actionType: mission.actionType,
          targetType: mission.targetType,
          targetId: mission.targetId,
        },
      });
    }

    await this.recalculateSet(userId, set, now, {
      grantSetBonus: grantReward,
    });
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
        status: { $in: ['ACTIVE', 'COMPLETED', 'NEEDS_COURSE'] },
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
    const resolvedNormal = normal.filter((mission) =>
      ['COMPLETED', 'FAILED'].includes(mission.status),
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
        resolvedNormal,
        hardcoreUnlocked: false,
        hardcoreCompleted: hardcore?.status === 'COMPLETED',
        hardcoreGenerationStatus: 'LOCKED',
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

  private toOpenedMissionResponse(
    set: DailyMissionSetDocument,
    mission: DailyMissionItem,
    now = new Date(),
  ) {
    const missionResponse = this.toMissionResponse(set, mission);
    return {
      ...this.toResponse(set, now),
      openedMission: missionResponse,
      mission: missionResponse,
      ctaPath: missionResponse.ctaPath,
      href: missionResponse.href,
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
      return `/lessons/${candidate.targetId}`;
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

    if (normal.length > NORMAL_MISSION_COUNT) return true;
    if (missions.length > NORMAL_MISSION_COUNT) return true;
    if (missions.some((mission) => mission.missionKind === 'HARDCORE'))
      return true;

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
      VIETNAMESE_DIACRITIC_REGEX.test(value.normalize('NFD')) ||
      LEGACY_MISSION_TEXT_REGEX.test(value)
    );
  }

  private async createNotificationSafely(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    missionId?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.notificationService.create(input);
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to create notification: ${error.message}`
          : 'Failed to create notification.',
      );
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
