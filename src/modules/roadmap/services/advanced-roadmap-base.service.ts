import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdvancedChallengeData,
  AdvancedChallengeFile,
  AdvancedNodeContext,
  AdvancedRoadmapMode,
  LeanCourse,
  RoadmapCompletionReview,
} from '../roadmap.types';
import { RoadmapChallengeLoaderService } from './roadmap-challenge-loader.service';
import { RoadmapQueryService } from './roadmap-query.service';
import { RoadmapReviewService } from './roadmap-review.service';
import { RoadmapStatusService } from './roadmap-status.service';
import {
  ADVANCED_NODE_ID_PATTERN,
  capitalizeMode,
  groupBy,
  isChallengeOptionId,
  isSameStringRecord,
  isStringRecord,
} from '../utils/roadmap.util';
import { UsersService } from '../../users/users.service';
import { ROADMAP_NODE_XP } from '../../users/xp.util';
import { LearningHistoryService } from '../../learning-history/learning-history.service';
import { MissionsService } from '../../missions/missions.service';

type PublicAdvancedChallenge = {
  id: string;
  type: string;
  title: string;
  question: string;
  promptType?: string;
  codeSnippet?: unknown;
  options?: Array<{ id: string; text: string }>;
  template?: string;
  poolItems?: Array<{ id: string; text: string }>;
  estimatedMinutes?: number;
  xp?: number;
  [key: string]: unknown;
};

export abstract class AdvancedRoadmapBaseService {
  protected abstract readonly mode: AdvancedRoadmapMode;
  constructor(
    protected readonly challengeLoader: RoadmapChallengeLoaderService,
    protected readonly queryService: RoadmapQueryService,
    protected readonly reviewService: RoadmapReviewService,
    protected readonly statusService: RoadmapStatusService,
    protected readonly usersService: UsersService,
    protected readonly learningHistoryService: LearningHistoryService,
    protected readonly missionsService: MissionsService,
  ) {}

  async getRoadmap(courseSlug: string, userId: string) {
    const course = await this.queryService.findCourseBySlugOrThrow(courseSlug);
    await this.assertDifficultyUnlocked(course, userId);

    const challengeFile = this.challengeLoader.loadAdvancedChallengeFile(
      this.mode,
      course.slug,
    );
    const orderedNodeIds = this.getOrderedAdvancedNodeIds(
      course.slug,
      challengeFile,
    );
    const statusMap = await this.statusService.getStatusMap(
      userId,
      course.slug,
      this.mode,
      orderedNodeIds,
    );

    const chapters = await this.queryService.findPublishedChapters(course._id);
    const chaptersByOrder = new Map(
      chapters.map((chapter) => [chapter.order, chapter]),
    );

    const responseChapters = challengeFile.chapters.map((chapterData) => {
      const chapter = chaptersByOrder.get(chapterData.chapterOrder);
      const chapterId = chapter ? String(chapter._id) : undefined;

      const nodes = chapterData.nodes.map((challenge) => {
        const nodeId = this.toNodeId(
          this.mode,
          course.slug,
          chapterData.chapterOrder,
          challenge.order,
        );

        return {
          id: nodeId,
          ...(chapterId ? { chapterId } : {}),
          chapterOrder: chapterData.chapterOrder,
          order: challenge.order,
          label: challenge.label,
          title: challenge.title,
          type: challenge.type,
          status: statusMap.get(nodeId) ?? 'locked',
          xp: ROADMAP_NODE_XP[this.mode],
          estimatedMinutes: challenge.estimatedMinutes,
        };
      });

      return {
        id:
          chapterId ??
          `${course.slug}-${this.mode}-chapter-${chapterData.chapterOrder}`,
        ...(chapterId ? { chapterId } : {}),
        title: chapter?.title ?? chapterData.chapterTitle,
        order: chapterData.chapterOrder,
        nodeCount: nodes.length,
        nodes,
      };
    });

    const totalNodes = responseChapters.reduce(
      (sum, chapter) => sum + chapter.nodeCount,
      0,
    );

    return {
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
        totalChapters: responseChapters.length,
        totalNodes,
      },
      mode: this.mode,
      chapters: responseChapters,
    };
  }

  async getNodeChallenge(nodeId: string, userId: string) {
    const { node, challenge, course } = await this.getNodeContext(
      nodeId,
      userId,
    );

    if (node.status === 'locked') {
      throw new ForbiddenException('This roadmap node is locked.');
    }

    const user = await this.usersService.findById(userId);
    const explanationSpeaker = {
      name: user?.petName || 'Your pet',
      type: 'PET' as const,
    };

    const nextChallenge = await this.getNextChallenge(
      course.slug,
      node.id,
      userId,
    );

    const baseResponse = {
      mode: this.mode,
      courseSlug: course.slug,
      node: {
        ...node,
        mode: this.mode,
        chapterIndex: 1, // we will override this below if needed
      },
      challenge: this.toPublicChallenge(nodeId, challenge),
      explanationSpeaker,
      navigation: {
        returnToRoadmap: { courseSlug: course.slug, mode: this.mode },
        nextChallenge,
      },
    };

    if (node.status === 'completed') {
      const completion = await this.statusService.getNodeCompletion(
        userId,
        course.slug,
        this.mode,
        node.id,
      );

      if (completion && completion.review) {
        return {
          ...baseResponse,
          review: this.reviewService.toAdvancedCompletedReview(
            challenge,
            completion,
          ),
        };
      }
    }

    return baseResponse;
  }

  async submitNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
    userId: string,
  ) {
    const { node, challenge, course } = await this.getNodeContext(
      nodeId,
      userId,
    );

    if (node.status === 'locked') {
      throw new ForbiddenException('This roadmap node is locked.');
    }

    if (node.status === 'completed') {
      const completion = await this.statusService.getNodeCompletion(
        userId,
        course.slug,
        this.mode,
        node.id,
      );

      const user = await this.usersService.findById(userId);
      const explanationSpeaker = {
        name: user?.petName || 'Your pet',
        type: 'PET' as const,
      };

      if (completion && completion.review) {
        return {
          correct: true,
          status: 'PASSED',
          alreadyCompleted: true,
          message: 'This node is already completed.',
          explanation:
            challenge.explanation ||
            'This works because it matches the key rule in the checkpoint. Focus on the concept, then apply it to the next problem.',
          explanationSpeaker,
          rewardSummary: this.getEmptyRewardSummary(),
          review: this.reviewService.toAdvancedCompletedReview(
            challenge,
            completion,
          ),
          navigation: {
            returnToRoadmap: { courseSlug: course.slug, mode: this.mode },
            nextChallenge: await this.getNextChallenge(
              course.slug,
              node.id,
              userId,
            ),
          },
        };
      }
    }

    if (payload?.type !== challenge.type) {
      throw new BadRequestException(
        `type must match the node challenge type: ${challenge.type}.`,
      );
    }

    let correct = false;
    let review: RoadmapCompletionReview | undefined = undefined;
    let returnData: Record<string, unknown> = {};

    if (this.isOptionBasedChallenge(challenge.type)) {
      const selectedOptionId = payload.selectedOptionId;
      const correctOptionId = (challenge as Record<string, unknown>)
        .correctOptionId;
      if (
        typeof selectedOptionId !== 'string' ||
        !isChallengeOptionId(selectedOptionId)
      ) {
        throw new BadRequestException(
          'selectedOptionId must be one of A, B, C, or D.',
        );
      }
      if (
        typeof correctOptionId !== 'string' ||
        !isChallengeOptionId(correctOptionId)
      ) {
        throw new BadRequestException(
          `Missing correct option data for ${challenge.type}.`,
        );
      }

      correct = selectedOptionId === correctOptionId;
      review = correct
        ? this.reviewService.toAdvancedOptionReview(
            challenge,
            selectedOptionId,
            correctOptionId,
          )
        : undefined;
      if (correct) returnData = { correctOptionId };
    } else if (challenge.type === 'drag_drop') {
      const dropZoneMap = payload.dropZoneMap;
      if (!isStringRecord(dropZoneMap)) {
        throw new BadRequestException('dropZoneMap must be an object.');
      }

      correct = isSameStringRecord(dropZoneMap, challenge.correctDropZoneMap);
      review = correct
        ? this.reviewService.toAdvancedDropZoneReview(
            challenge,
            dropZoneMap,
            challenge.correctDropZoneMap,
          )
        : undefined;
      if (correct)
        returnData = { correctDropZoneMap: challenge.correctDropZoneMap };
    } else if (challenge.type === 'drag_drop_matching') {
      const matchingMap = payload.matchingMap;
      if (!isStringRecord(matchingMap)) {
        throw new BadRequestException('matchingMap must be an object.');
      }

      const correctMatchingMap = this.getCorrectMatchingMap(challenge);
      correct = isSameStringRecord(matchingMap, correctMatchingMap);
      review = correct
        ? this.reviewService.toAdvancedMatchingReview(
            challenge,
            matchingMap,
            correctMatchingMap,
          )
        : undefined;
      if (correct) returnData = { correctMatchingMap };
    } else if (
      challenge.type === 'ordering_steps' ||
      challenge.type === 'ranking'
    ) {
      const orderedIds = payload.orderedIds;
      if (
        !Array.isArray(orderedIds) ||
        !orderedIds.every((item) => typeof item === 'string')
      ) {
        throw new BadRequestException(
          'orderedIds must be an array of strings.',
        );
      }

      const correctOrderedIds = this.getCorrectOrderedIds(challenge);
      correct = this.isSameStringArray(orderedIds, correctOrderedIds);
      review = correct
        ? this.reviewService.toAdvancedOrderingReview(
            challenge,
            orderedIds,
            correctOrderedIds,
          )
        : undefined;
      if (correct) returnData = { correctOrderedIds };
    } else {
      throw new BadRequestException(
        `Unsupported ${capitalizeMode(this.mode)} node type: ${challenge.type}.`,
      );
    }

    const user = await this.usersService.findById(userId);
    const explanationSpeaker = {
      name: user?.petName || 'Your pet',
      type: 'PET' as const,
    };

    const nextChallenge = await this.getNextChallenge(
      course.slug,
      node.id,
      userId,
    );
    const navigation = {
      returnToRoadmap: { courseSlug: course.slug, mode: this.mode },
      nextChallenge,
    };

    const submissionId =
      this.getOptionalString(payload.submissionId) || randomUUID();
    await this.recordAttemptAndEvent({
      userId,
      submissionId,
      courseSlug: course.slug,
      nodeId: node.id,
      topic: this.topicFromChallenge(challenge),
      challengeType: challenge.type,
      passed: correct,
      durationSeconds: this.getOptionalNumber(payload.durationSeconds),
      hintUsed: this.getOptionalNumber(payload.hintUsed),
      primaryMistake: correct ? undefined : challenge.type,
      href: '/roadmaps/' + course.slug + '/' + this.mode + '/nodes/' + node.id,
    });

    if (correct) {
      const rewardGranted = await this.statusService.tryMarkNodeCompleted(
        userId,
        course.slug,
        this.mode,
        node.id,
        review,
      );
      if (!rewardGranted) {
        const completion = await this.statusService.getNodeCompletion(
          userId,
          course.slug,
          this.mode,
          node.id,
        );

        return {
          correct: true,
          status: 'PASSED',
          alreadyCompleted: true,
          message: 'This node is already completed.',
          explanation:
            challenge.explanation ||
            'This works because it matches the key rule in the checkpoint. Focus on the concept, then apply it to the next problem.',
          explanationSpeaker,
          rewardSummary: this.getEmptyRewardSummary(),
          ...returnData,
          review: completion?.review
            ? this.reviewService.toAdvancedCompletedReview(
                challenge,
                completion,
              )
            : review,
          navigation,
        };
      }
      await this.usersService.awardXp(userId, ROADMAP_NODE_XP[this.mode]);
      await this.recordCompletionEvent({
        userId,
        courseSlug: course.slug,
        nodeId: node.id,
        topic: this.topicFromChallenge(challenge),
        challengeType: challenge.type,
        rewardXp: ROADMAP_NODE_XP[this.mode],
      });
    }

    if (!correct) {
      return {
        correct: false,
        status: 'FAILED',
        message:
          'Not quite. Return to the roadmap and try this checkpoint again.',
        explanation: undefined,
        correctOptionId: undefined,
        correctDropZoneMap: undefined,
        correctMatchingMap: undefined,
        correctOrderedIds: undefined,
        rewardSummary: this.getEmptyRewardSummary(),
        navigation: {
          returnToRoadmap: { courseSlug: course.slug, mode: this.mode },
          nextChallenge: null,
        },
      };
    }

    return {
      correct: true,
      status: 'PASSED',
      message: 'Correct. Nice work.',
      explanation:
        challenge.explanation ||
        'This works because it matches the key rule in the checkpoint. Focus on the concept, then apply it to the next problem.',
      explanationSpeaker,
      rewardSummary: this.buildRewardSummary(),
      ...returnData,
      review,
      navigation,
    };
  }

  async getNodeContext(
    nodeId: string,
    userId: string,
  ): Promise<AdvancedNodeContext> {
    const parsedNodeId = this.parseNodeId(this.mode, nodeId);
    const course = await this.queryService.findCourseBySlugOrThrow(
      parsedNodeId.courseSlug,
    );
    await this.assertDifficultyUnlocked(course, userId);

    const challengeFile = this.challengeLoader.loadAdvancedChallengeFile(
      this.mode,
      course.slug,
    );
    const chapterData = challengeFile.chapters.find(
      (chapter) => chapter.chapterOrder === parsedNodeId.chapterOrder,
    );

    if (!chapterData) {
      throw new NotFoundException(
        `${capitalizeMode(this.mode)} roadmap node not found: ${nodeId}`,
      );
    }

    const challenge = chapterData.nodes.find(
      (node) => node.order === parsedNodeId.nodeOrder,
    );

    if (!challenge) {
      throw new NotFoundException(
        `${capitalizeMode(this.mode)} roadmap node not found: ${nodeId}`,
      );
    }

    const chapter = await this.queryService.findChapterByCourseAndOrder(
      course._id,
      chapterData.chapterOrder,
    );
    const globalNodeIndex = this.findGlobalNodeIndex(
      challengeFile,
      chapterData.chapterOrder,
      challenge.order,
    );
    const orderedNodeIds = this.getOrderedAdvancedNodeIds(
      course.slug,
      challengeFile,
    );
    const statusMap = await this.statusService.getStatusMap(
      userId,
      course.slug,
      this.mode,
      orderedNodeIds,
    );

    return {
      node: {
        id: nodeId,
        label: challenge.label,
        title: challenge.title,
        type: challenge.type,
        status: statusMap.get(nodeId) ?? 'locked',
      },
      course,
      ...(chapter ? { chapter } : {}),
      chapterData,
      challenge,
      globalNodeIndex,
    };
  }

  toPublicChallenge(
    nodeId: string,
    challenge: AdvancedChallengeData,
  ): PublicAdvancedChallenge {
    const publicChallenge: PublicAdvancedChallenge = {
      id: `${this.mode}-challenge-${nodeId}`,
      type: challenge.type,
      title: challenge.title,
      question: challenge.question,
    };

    for (const [key, value] of Object.entries(challenge)) {
      if (key !== 'explanation' && !key.startsWith('correct')) {
        publicChallenge[key as keyof PublicAdvancedChallenge] = value;
      }
    }

    publicChallenge.xp = ROADMAP_NODE_XP[this.mode];

    if (this.mode === 'hard') {
      const source = challenge as Record<string, unknown>;
      if (Array.isArray(source.hints) && source.hints.length > 0) {
        publicChallenge.hints = source.hints as Array<{
          level?: number;
          text: string;
        }>;
      } else if (typeof source.hint === 'string') {
        publicChallenge.hints = [{ text: source.hint }];
      } else {
        const fallbackHints: Record<string, string> = {
          multiple_choice:
            'Compare each option against the exact requirement in the prompt. Eliminate answers that solve a different problem.',
          code_trace:
            'Trace the code line by line and write down how each variable changes after every statement.',
          bug_hunt:
            'Look for the line where the program state first becomes different from what the question expects.',
          drag_drop_matching:
            'Match each concept by its role first, then check whether the pair fits the code behavior.',
          drag_drop:
            'Use the surrounding code to infer what each blank must produce or update.',
          ordering_steps:
            'Start with the operation that must happen first, then place dependent steps after it.',
          ranking:
            'Identify the strongest criterion first, then order items from most to least suitable.',
          fill_missing_line:
            'Look at the line before and after the blank. The missing line must connect those two states.',
        };
        const hintText =
          fallbackHints[challenge.type] ||
          'Review the surrounding code and check how the data is transformed.';
        publicChallenge.hints = [{ text: hintText }];
      }
    }

    return publicChallenge;
  }

  private async recordAttemptAndEvent(input: {
    userId: string;
    submissionId: string;
    courseSlug: string;
    nodeId: string;
    topic: string;
    challengeType: string;
    passed: boolean;
    durationSeconds?: number;
    hintUsed?: number;
    primaryMistake?: string;
    href: string;
  }) {
    const attemptKey =
      'roadmap-attempt:' + input.userId + ':' + input.submissionId;
    await this.learningHistoryService.recordAttempt({
      userId: input.userId,
      submissionId: input.submissionId,
      sourceType: 'ROADMAP',
      courseSlug: input.courseSlug,
      mode: this.mode,
      targetType: 'NODE',
      targetId: input.nodeId,
      topic: input.topic,
      challengeType: input.challengeType,
      passed: input.passed,
      score: input.passed ? 1 : 0,
      maxScore: 1,
      durationSeconds: input.durationSeconds,
      hintUsed: input.hintUsed,
      primaryMistake: input.primaryMistake,
      metadata: { href: input.href },
    });

    const event = await this.learningHistoryService.recordEvent({
      userId: input.userId,
      eventType: 'ROADMAP_ATTEMPTED',
      idempotencyKey: attemptKey,
      targetType: 'NODE',
      targetId: input.nodeId,
      topic: input.topic,
      passed: input.passed,
      score: input.passed ? 1 : 0,
      metadata: { courseSlug: input.courseSlug, mode: this.mode },
    });
    if (event.created) {
      await this.missionsService.processActivityEvent({
        userId: input.userId,
        eventType: 'ROADMAP_ATTEMPTED',
        idempotencyKey: attemptKey,
        targetType: 'NODE',
        targetId: input.nodeId,
        topic: input.topic,
        passed: input.passed,
        score: input.passed ? 1 : 0,
        metadata: { courseSlug: input.courseSlug, mode: this.mode },
      });
    }
  }

  private async recordCompletionEvent(input: {
    userId: string;
    courseSlug: string;
    nodeId: string;
    topic: string;
    challengeType: string;
    rewardXp: number;
  }) {
    const completionKey =
      'roadmap-node-completed:' +
      input.userId +
      ':' +
      input.courseSlug +
      ':' +
      this.mode +
      ':' +
      input.nodeId;
    const event = await this.learningHistoryService.recordEvent({
      userId: input.userId,
      eventType: 'ROADMAP_NODE_COMPLETED',
      idempotencyKey: completionKey,
      targetType: 'NODE',
      targetId: input.nodeId,
      topic: input.topic,
      passed: true,
      score: 1,
      metadata: {
        courseSlug: input.courseSlug,
        mode: this.mode,
        challengeType: input.challengeType,
        rewardXp: input.rewardXp,
      },
    });
    if (event.created) {
      await this.missionsService.processActivityEvent({
        userId: input.userId,
        eventType: 'ROADMAP_NODE_COMPLETED',
        idempotencyKey: completionKey,
        targetType: 'NODE',
        targetId: input.nodeId,
        topic: input.topic,
        passed: true,
        score: 1,
        metadata: {
          courseSlug: input.courseSlug,
          mode: this.mode,
          challengeType: input.challengeType,
          rewardXp: input.rewardXp,
        },
      });
    }
  }

  private topicFromChallenge(challenge: AdvancedChallengeData) {
    return (challenge.title || challenge.type || 'roadmap-node')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  private getOptionalString(value: unknown) {
    return typeof value === 'string' ? value.trim() || undefined : undefined;
  }

  private getOptionalNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value)
      ? Math.max(0, value)
      : undefined;
  }
  private buildRewardSummary() {
    const xp = ROADMAP_NODE_XP[this.mode];
    const stars = xp > 0 ? 10 : 0;
    const petExp = Math.floor(xp / 2);

    return {
      xp,
      stars,
      coins: 0,
      petExp,
      items: [
        { label: 'XP', amount: xp, type: 'XP' as const },
        { label: 'Stars', amount: stars, type: 'STAR' as const },
      ],
    };
  }

  private getEmptyRewardSummary() {
    return {
      xp: 0,
      stars: 0,
      coins: 0,
      petExp: 0,
      items: [],
    };
  }

  private parseNodeId(
    expectedMode: AdvancedRoadmapMode,
    nodeId: string,
  ): {
    courseSlug: string;
    mode: AdvancedRoadmapMode;
    chapterOrder: number;
    nodeOrder: number;
  } {
    const match = ADVANCED_NODE_ID_PATTERN.exec(nodeId);

    if (!match || match[2] !== expectedMode) {
      throw new NotFoundException(
        `${capitalizeMode(expectedMode)} roadmap node not found: ${nodeId}`,
      );
    }

    return {
      courseSlug: match[1],
      mode: match[2],
      chapterOrder: Number(match[3]),
      nodeOrder: Number(match[4]),
    };
  }

  private toNodeId(
    mode: AdvancedRoadmapMode,
    courseSlug: string,
    chapterOrder: number,
    nodeOrder: number,
  ): string {
    return `${courseSlug}-${mode}-c${chapterOrder}-n${nodeOrder}`;
  }

  private async assertDifficultyUnlocked(
    course: LeanCourse,
    userId: string,
  ): Promise<void> {
    const prerequisites = [
      await this.getEasyCompletionSummary(course, userId),
      ...(this.mode === 'hard'
        ? [
            await this.getAdvancedCompletionSummary(
              course.slug,
              'medium',
              userId,
            ),
          ]
        : []),
    ];
    const prerequisite = prerequisites.find((item) => item.completedNodes < 5);

    if (!prerequisite) return;

    throw new ForbiddenException(
      `${capitalizeMode(this.mode)} roadmap is locked until you complete at least 5 nodes in ${prerequisite.requiredMode}.`,
    );
  }

  private async getEasyCompletionSummary(course: LeanCourse, userId: string) {
    const chapters = await this.queryService.findPublishedChapters(course._id);
    const lessons = await this.queryService.findPublishedLessons(
      chapters.map((chapter) => chapter._id),
    );
    const lessonsByChapterId = groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );
    const orderedNodeIds = chapters.flatMap((chapter) =>
      (lessonsByChapterId.get(String(chapter._id)) ?? [])
        .sort((a, b) => a.order - b.order)
        .map((lesson) => String(lesson._id)),
    );
    const summary = await this.statusService.getCompletionSummary(
      userId,
      course.slug,
      'easy',
      orderedNodeIds,
    );

    return {
      ...summary,
      requiredMode: 'easy' as const,
    };
  }

  private async getAdvancedCompletionSummary(
    courseSlug: string,
    mode: AdvancedRoadmapMode,
    userId: string,
  ) {
    const challengeFile = this.challengeLoader.loadAdvancedChallengeFile(
      mode,
      courseSlug,
    );
    const orderedNodeIds = this.getOrderedAdvancedNodeIdsForMode(
      mode,
      courseSlug,
      challengeFile,
    );
    const summary = await this.statusService.getCompletionSummary(
      userId,
      courseSlug,
      mode,
      orderedNodeIds,
    );

    return {
      ...summary,
      requiredMode: mode,
    };
  }

  private findGlobalNodeIndex(
    challengeFile: AdvancedChallengeFile,
    chapterOrder: number,
    nodeOrder: number,
  ): number {
    let globalNodeIndex = 0;

    for (const chapter of challengeFile.chapters) {
      for (const node of chapter.nodes) {
        globalNodeIndex++;
        if (chapter.chapterOrder === chapterOrder && node.order === nodeOrder) {
          return globalNodeIndex;
        }
      }
    }

    return 1;
  }

  private getOrderedAdvancedNodeIds(
    courseSlug: string,
    challengeFile: AdvancedChallengeFile,
  ): string[] {
    return this.getOrderedAdvancedNodeIdsForMode(
      this.mode,
      courseSlug,
      challengeFile,
    );
  }

  private getOrderedAdvancedNodeIdsForMode(
    mode: AdvancedRoadmapMode,
    courseSlug: string,
    challengeFile: AdvancedChallengeFile,
  ): string[] {
    const orderedIds: string[] = [];

    for (const chapter of challengeFile.chapters) {
      for (const node of chapter.nodes) {
        orderedIds.push(
          this.toNodeId(mode, courseSlug, chapter.chapterOrder, node.order),
        );
      }
    }

    return orderedIds;
  }

  private async getNextNode(
    courseSlug: string,
    nodeId: string,
    userId: string,
  ) {
    const challengeFile = this.challengeLoader.loadAdvancedChallengeFile(
      this.mode,
      courseSlug,
    );
    const orderedNodeIds = this.getOrderedAdvancedNodeIds(
      courseSlug,
      challengeFile,
    );
    const currentIndex = orderedNodeIds.indexOf(nodeId);
    const nextNodeId = orderedNodeIds[currentIndex + 1];

    if (!nextNodeId) return null;

    const statusMap = await this.statusService.getStatusMap(
      userId,
      courseSlug,
      this.mode,
      orderedNodeIds,
    );

    return {
      id: nextNodeId,
      status: statusMap.get(nextNodeId) ?? 'locked',
    };
  }

  private async getNextChallenge(
    courseSlug: string,
    nodeId: string,
    userId: string,
  ) {
    const nextNode = await this.getNextNode(courseSlug, nodeId, userId);
    if (!nextNode) return null;
    return {
      nodeId: nextNode.id,
      mode: this.mode,
      courseSlug,
    };
  }

  private isOptionBasedChallenge(type: AdvancedChallengeData['type']): boolean {
    return [
      'multiple_choice',
      'code_trace',
      'bug_hunt',
      'choose_better_algorithm',
      'simulation',
      'fill_missing_line',
    ].includes(type);
  }

  private getCorrectMatchingMap(
    challenge: AdvancedChallengeData,
  ): Record<string, string> {
    const source = challenge as Record<string, unknown>;
    const correctMatching =
      source.correctMatchingMap ??
      source.correctMatching ??
      source.correctDropZoneMap;

    if (!isStringRecord(correctMatching)) {
      throw new BadRequestException(
        `Missing correct matching data for ${challenge.type}.`,
      );
    }

    return correctMatching;
  }

  private getCorrectOrderedIds(challenge: AdvancedChallengeData): string[] {
    const source = challenge as Record<string, unknown>;
    const correctOrder = source.correctOrderedIds ?? source.correctOrder;

    if (
      !Array.isArray(correctOrder) ||
      !correctOrder.every((item) => typeof item === 'string')
    ) {
      throw new BadRequestException(
        `Missing correct ordering data for ${challenge.type}.`,
      );
    }

    return correctOrder;
  }

  private isSameStringArray(received: string[], expected: string[]): boolean {
    return (
      received.length === expected.length &&
      expected.every((item, index) => received[index] === item)
    );
  }
}
