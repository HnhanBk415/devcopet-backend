import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import type { AiRoadmapContext } from '../ai-chat/ai-chat.types';
import type {
  AdvancedRoadmapMode,
  RoadmapMode,
  RoadmapSubmitMeta,
} from './roadmap.types';
import { EasyRoadmapService } from './services/easy-roadmap.service';
import { HardRoadmapService } from './services/hard-roadmap.service';
import { MediumRoadmapService } from './services/medium-roadmap.service';
import { RoadmapAiContextService } from './services/roadmap-ai-context.service';
import { RoadmapChallengeLoaderService } from './services/roadmap-challenge-loader.service';
import { RoadmapChallengeSessionService } from './services/roadmap-challenge-session.service';
import { RoadmapStatusService } from './services/roadmap-status.service';
import { RoadmapQueryService } from './services/roadmap-query.service';

type ChallengePageResponse = {
  courseSlug: string;
  node?: {
    status?: string;
  };
  challenge?: Record<string, unknown>;
  [key: string]: unknown;
};

type ChallengeSubmitResult = {
  correct?: boolean;
  status?: string;
  [key: string]: unknown;
};

@Injectable()
export class RoadmapService {
  constructor(
    private readonly easyRoadmapService: EasyRoadmapService,
    private readonly mediumRoadmapService: MediumRoadmapService,
    private readonly hardRoadmapService: HardRoadmapService,
    private readonly roadmapAiContextService: RoadmapAiContextService,
    private readonly roadmapStatusService: RoadmapStatusService,
    private readonly challengeSessionService: RoadmapChallengeSessionService,
    private readonly challengeLoader: RoadmapChallengeLoaderService,
    private readonly queryService: RoadmapQueryService,
  ) {}

  async getEasyRoadmap(courseSlug: string, userId: string) {
    return this.easyRoadmapService.getRoadmap(courseSlug, userId);
  }

  async getMediumRoadmap(courseSlug: string, userId: string) {
    return this.mediumRoadmapService.getRoadmap(courseSlug, userId);
  }

  async getHardRoadmap(courseSlug: string, userId: string) {
    return this.hardRoadmapService.getRoadmap(courseSlug, userId);
  }

  async getRoadmapSummary(courseSlug: string, userId: string) {
    const course = await this.queryService.findCourseBySlugOrThrow(courseSlug);
    const easy = await this.getEasySummary(course.slug, course._id, userId);
    const [medium, hard] = await Promise.all([
      this.getAdvancedSummary(course.slug, 'medium', userId),
      this.getAdvancedSummary(course.slug, 'hard', userId),
    ]);

    const modes = {
      easy: {
        ...easy,
        unlocked: true,
        available: true,
      },
      medium: {
        ...medium,
        unlocked: easy.completedNodes >= 5,
      },
      hard: {
        ...hard,
        unlocked: medium.completedNodes >= 5,
      },
    };
    const totalNodes = easy.totalNodes + medium.totalNodes + hard.totalNodes;
    const completedNodes =
      easy.completedNodes + medium.completedNodes + hard.completedNodes;

    return {
      courseSlug: course.slug,
      totalNodes,
      completedNodes,
      percent: this.toPercent(completedNodes, totalNodes),
      modes,
    };
  }

  async getEasyNodeChallenge(nodeId: string, userId: string) {
    const response = await this.easyRoadmapService.getNodeChallenge(
      nodeId,
      userId,
    );
    return this.withChallengeSession(response, userId, 'easy', nodeId);
  }

  async getMediumNodeChallenge(nodeId: string, userId: string) {
    const response = await this.mediumRoadmapService.getNodeChallenge(
      nodeId,
      userId,
    );
    return this.withChallengeSession(response, userId, 'medium', nodeId);
  }

  async getHardNodeChallenge(nodeId: string, userId: string) {
    const response = await this.hardRoadmapService.getNodeChallenge(
      nodeId,
      userId,
    );
    return this.withChallengeSession(response, userId, 'hard', nodeId);
  }

  async startChallengeSession(
    courseSlug: string,
    mode: RoadmapMode,
    nodeId: string,
    userId: string,
  ) {
    return this.challengeSessionService.startSession(
      userId,
      courseSlug,
      mode,
      nodeId,
    );
  }

  async submitEasyNodeChallenge(
    nodeId: string,
    selectedOptionId: string,
    userId: string,
    meta?: RoadmapSubmitMeta,
    courseSlug?: string,
  ) {
    const session = await this.challengeSessionService.assertReadyForSubmit({
      userId,
      courseSlug,
      mode: 'easy',
      nodeId,
      sessionId: meta?.sessionId,
    });
    const result = await this.easyRoadmapService.submitNodeChallenge(
      nodeId,
      selectedOptionId,
      userId,
      this.withoutClientTimeout(meta),
    );
    await this.finalizeSessionFromSubmitResult(session.id, result);

    return result;
  }

  async submitMediumNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
    userId: string,
    courseSlug?: string,
  ) {
    const session = await this.challengeSessionService.assertReadyForSubmit({
      userId,
      courseSlug,
      mode: 'medium',
      nodeId,
      sessionId: payload.sessionId,
    });
    const result = await this.mediumRoadmapService.submitNodeChallenge(
      nodeId,
      this.withoutClientTimeout(payload),
      userId,
    );
    await this.finalizeSessionFromSubmitResult(session.id, result);

    return result;
  }

  async submitHardNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
    userId: string,
    courseSlug?: string,
  ) {
    const session = await this.challengeSessionService.assertReadyForSubmit({
      userId,
      courseSlug,
      mode: 'hard',
      nodeId,
      sessionId: payload.sessionId,
    });
    const result = await this.hardRoadmapService.submitNodeChallenge(
      nodeId,
      this.withoutClientTimeout(payload),
      userId,
    );
    await this.finalizeSessionFromSubmitResult(session.id, result);

    return result;
  }

  async resetRoadmapProgress(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
  ) {
    await this.roadmapStatusService.resetRoadmapProgress(
      userId,
      courseSlug,
      mode,
    );

    return {
      success: true,
      message: 'Roadmap progress reset.',
      courseSlug,
      mode,
    };
  }

  async getAiRoadmapContext(
    mode: RoadmapMode,
    nodeId: string,
    userId: string,
  ): Promise<AiRoadmapContext> {
    return this.roadmapAiContextService.getContext(mode, nodeId, userId);
  }

  private async withChallengeSession(
    response: ChallengePageResponse,
    userId: string,
    mode: RoadmapMode,
    nodeId: string,
  ) {
    if (response?.node?.status === 'completed') {
      return this.withoutReviewCountdown(response);
    }

    return {
      ...response,
      session: await this.challengeSessionService.startSession(
        userId,
        response.courseSlug,
        mode,
        nodeId,
        this.getChallengeTimeLimitSeconds(response),
      ),
    };
  }

  private getChallengeTimeLimitSeconds(
    response: ChallengePageResponse,
  ): number | undefined {
    const timeLimitSeconds = response.challenge?.timeLimitSeconds;

    return typeof timeLimitSeconds === 'number' && timeLimitSeconds > 0
      ? timeLimitSeconds
      : undefined;
  }

  private withoutReviewCountdown<T extends ChallengePageResponse>(
    response: T,
  ): T {
    if (!response.challenge) return response;

    const challenge = { ...response.challenge };
    delete challenge.timeLimitSeconds;
    delete challenge.timeLimit;

    return {
      ...response,
      challenge,
    };
  }
  private withoutClientTimeout<T extends object>(payload: T): T;
  private withoutClientTimeout<T extends object>(
    payload: T | undefined,
  ): T | undefined;
  private withoutClientTimeout<T extends object>(
    payload: T | undefined,
  ): T | undefined {
    if (!payload) return payload;

    const rest = { ...(payload as Record<string, unknown>) };
    delete rest.timeout;
    return rest as T;
  }

  private async getEasySummary(
    courseSlug: string,
    courseId: Types.ObjectId,
    userId: string,
  ) {
    const chapters = await this.queryService.findPublishedChapters(courseId);
    const lessons = await this.queryService.findPublishedLessons(
      chapters.map((chapter) => chapter._id),
    );
    const lessonsByChapterId = new Map<string, string[]>();

    for (const lesson of lessons) {
      const chapterId = String(lesson.chapterId);
      const group = lessonsByChapterId.get(chapterId) ?? [];
      group.push(String(lesson._id));
      lessonsByChapterId.set(chapterId, group);
    }

    const orderedNodeIds = chapters.flatMap(
      (chapter) => lessonsByChapterId.get(String(chapter._id)) ?? [],
    );
    const summary = await this.roadmapStatusService.getCompletionSummary(
      userId,
      courseSlug,
      'easy',
      orderedNodeIds,
    );

    return {
      mode: 'easy' as const,
      totalNodes: summary.totalNodes,
      completedNodes: summary.completedNodes,
      percent: summary.percent,
    };
  }

  private async getAdvancedSummary(
    courseSlug: string,
    mode: AdvancedRoadmapMode,
    userId: string,
  ) {
    try {
      const challengeFile = this.challengeLoader.loadAdvancedChallengeFile(
        mode,
        courseSlug,
      );
      const orderedNodeIds = challengeFile.chapters.flatMap((chapter) =>
        chapter.nodes.map(
          (node) =>
            `${courseSlug}-${mode}-c${chapter.chapterOrder}-n${node.order}`,
        ),
      );
      const summary = await this.roadmapStatusService.getCompletionSummary(
        userId,
        courseSlug,
        mode,
        orderedNodeIds,
      );

      return {
        mode,
        totalNodes: summary.totalNodes,
        completedNodes: summary.completedNodes,
        percent: summary.percent,
        available: true,
      };
    } catch {
      return {
        mode,
        totalNodes: 0,
        completedNodes: 0,
        percent: 0,
        available: false,
      };
    }
  }

  private toPercent(completedNodes: number, totalNodes: number) {
    return totalNodes === 0
      ? 0
      : Math.round((completedNodes / totalNodes) * 100);
  }

  private async finalizeSessionFromSubmitResult(
    sessionId: string,
    result: ChallengeSubmitResult,
  ) {
    if (result?.correct === true) {
      await this.challengeSessionService.markSubmitted(sessionId);
      return;
    }

    if (result?.status === 'FAILED') {
      await this.challengeSessionService.markFailed(sessionId);
    }
  }
}
