import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type {
  AdvancedChallengeData,
  EasyChallengeData,
  RoadmapMode,
} from '../roadmap.types';
import {
  RoadmapChallengeSession,
  RoadmapChallengeSessionDocument,
} from '../schemas/roadmap-challenge-session.schema';
import { EasyRoadmapService } from './easy-roadmap.service';
import { HardRoadmapService } from './hard-roadmap.service';
import { MediumRoadmapService } from './medium-roadmap.service';

type ChallengeSessionResponse = {
  sessionId: string;
  startedAt: string;
  expiresAt: string;
  serverNow: string;
  timeLimitSeconds: number;
};

@Injectable()
export class RoadmapChallengeSessionService {
  constructor(
    @InjectModel(RoadmapChallengeSession.name)
    private readonly sessionModel: Model<RoadmapChallengeSessionDocument>,
    private readonly easyRoadmapService: EasyRoadmapService,
    private readonly mediumRoadmapService: MediumRoadmapService,
    private readonly hardRoadmapService: HardRoadmapService,
  ) {}

  async startSession(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    nodeId: string,
    timeLimitSecondsOverride?: number,
  ): Promise<ChallengeSessionResponse> {
    const timeLimitSeconds =
      timeLimitSecondsOverride ??
      (await this.resolveTimeLimitSeconds(userId, courseSlug, mode, nodeId));
    const now = new Date();
    const existingSession = await this.sessionModel
      .findOne({
        userId,
        courseSlug,
        mode,
        nodeId,
        status: 'IN_PROGRESS',
      })
      .sort({ createdAt: -1 })
      .exec();

    if (existingSession) {
      if (existingSession.expiresAt.getTime() > now.getTime()) {
        return this.toResponse(existingSession, now);
      }

      await this.markExpired(existingSession.id, now);
    }

    try {
      const startedAt = now;
      const expiresAt = new Date(startedAt.getTime() + timeLimitSeconds * 1000);
      const session = await this.sessionModel.create({
        userId,
        courseSlug,
        mode,
        nodeId,
        startedAt,
        expiresAt,
        timeLimitSeconds,
        status: 'IN_PROGRESS',
      });

      return this.toResponse(session, now);
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) {
        throw error;
      }

      const activeSession = await this.sessionModel
        .findOne({
          userId,
          courseSlug,
          mode,
          nodeId,
          status: 'IN_PROGRESS',
        })
        .exec();
      if (activeSession) return this.toResponse(activeSession, new Date());

      throw error;
    }
  }

  async assertReadyForSubmit(input: {
    userId: string;
    mode: RoadmapMode;
    nodeId: string;
    sessionId?: unknown;
    courseSlug?: string;
  }): Promise<RoadmapChallengeSessionDocument> {
    if (typeof input.sessionId !== 'string' || !input.sessionId.trim()) {
      throw new HttpException(
        {
          code: 'SESSION_REQUIRED',
          message: 'Challenge session is required.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const session = await this.sessionModel
      .findById(input.sessionId.trim())
      .exec();

    if (!session) {
      throw new HttpException(
        {
          code: 'SESSION_NOT_FOUND',
          message: 'Challenge session was not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (session.userId !== input.userId) {
      throw new ForbiddenException({
        code: 'SESSION_FORBIDDEN',
        message: 'Challenge session does not belong to this user.',
      });
    }

    if (
      session.mode !== input.mode ||
      session.nodeId !== input.nodeId ||
      (input.courseSlug && session.courseSlug !== input.courseSlug)
    ) {
      throw new HttpException(
        {
          code: 'SESSION_MISMATCH',
          message: 'Challenge session does not match this node.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new HttpException(
        {
          code: 'SESSION_NOT_IN_PROGRESS',
          message: 'Challenge session is no longer active.',
        },
        HttpStatus.CONFLICT,
      );
    }

    const now = new Date();
    if (now.getTime() >= session.expiresAt.getTime()) {
      await this.markExpired(session.id, now);
      throw new HttpException(
        {
          code: 'TIME_EXPIRED',
          message: 'Time expired. Please try again.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return session;
  }

  async markSubmitted(sessionId: string) {
    const now = new Date();
    await this.sessionModel
      .updateOne(
        { _id: sessionId, status: 'IN_PROGRESS' },
        { $set: { status: 'SUBMITTED', submittedAt: now } },
      )
      .exec();
  }

  async markFailed(sessionId: string) {
    const now = new Date();
    await this.sessionModel
      .updateOne(
        { _id: sessionId, status: 'IN_PROGRESS' },
        { $set: { status: 'FAILED', failedAt: now } },
      )
      .exec();
  }

  private async resolveTimeLimitSeconds(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    nodeId: string,
  ): Promise<number> {
    if (mode === 'easy') {
      const { node, chapter, course, lesson } =
        await this.easyRoadmapService.getNodeContext(nodeId, userId);
      this.assertCourseMatches(course.slug, courseSlug, mode, nodeId);
      this.assertNodeAvailable(node.status);
      const challenge = this.easyRoadmapService.findChallenge(
        course.slug,
        chapter,
        lesson,
      );

      return this.getTimeLimitSeconds(mode, challenge);
    }

    const roadmapService =
      mode === 'medium' ? this.mediumRoadmapService : this.hardRoadmapService;
    const { node, course, challenge } = await roadmapService.getNodeContext(
      nodeId,
      userId,
    );
    this.assertCourseMatches(course.slug, courseSlug, mode, nodeId);
    this.assertNodeAvailable(node.status);

    return this.getTimeLimitSeconds(mode, challenge);
  }

  private assertCourseMatches(
    actualCourseSlug: string,
    expectedCourseSlug: string,
    mode: RoadmapMode,
    nodeId: string,
  ) {
    if (actualCourseSlug === expectedCourseSlug) return;

    throw new NotFoundException(
      `${mode} roadmap node not found for ${expectedCourseSlug}: ${nodeId}`,
    );
  }

  private assertNodeAvailable(status: string) {
    if (status !== 'locked') return;

    throw new ForbiddenException('This roadmap node is locked.');
  }

  private getTimeLimitSeconds(
    mode: RoadmapMode,
    challenge: EasyChallengeData | AdvancedChallengeData,
  ) {
    const source = challenge as Record<string, unknown>;
    const seconds =
      this.getPositiveNumber(source.timeLimitSeconds) ??
      this.getPositiveNumber(source.timeLimit) ??
      this.getPositiveNumber(source.durationSeconds);
    if (seconds) return Math.round(seconds);

    const estimatedMinutes =
      this.getPositiveNumber(source.estimatedMinutes) ??
      this.getPositiveNumber(source.estimatedTime);
    if (estimatedMinutes) return Math.round(estimatedMinutes * 60);

    return this.getFallbackSeconds(mode);
  }

  private getPositiveNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) && value > 0
      ? value
      : undefined;
  }

  private getFallbackSeconds(mode: RoadmapMode) {
    if (mode === 'easy') return 60;
    if (mode === 'medium') return 120;
    return 180;
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    );
  }

  private async markExpired(sessionId: string, now: Date) {
    await this.sessionModel
      .updateOne(
        { _id: sessionId, status: 'IN_PROGRESS' },
        { $set: { status: 'EXPIRED', expiredAt: now } },
      )
      .exec();
  }

  private toResponse(
    session: RoadmapChallengeSessionDocument,
    serverNow: Date,
  ): ChallengeSessionResponse {
    return {
      sessionId: session.id,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      serverNow: serverNow.toISOString(),
      timeLimitSeconds: session.timeLimitSeconds,
    };
  }
}
