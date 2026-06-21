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
          xp: challenge.xp,
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

    if (node.status === 'completed') {
      const completion = await this.statusService.getNodeCompletion(
        userId,
        course.slug,
        this.mode,
        node.id,
      );

      return {
        node,
        challenge: this.toPublicChallenge(nodeId, challenge),
        review: this.reviewService.toAdvancedCompletedReview(
          challenge,
          completion,
        ),
      };
    }

    return {
      node,
      challenge: this.toPublicChallenge(nodeId, challenge),
    };
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

      return {
        correct: true,
        alreadyCompleted: true,
        message: 'This node is already completed.',
        review: this.reviewService.toAdvancedCompletedReview(
          challenge,
          completion,
        ),
      };
    }

    if (payload?.type !== challenge.type) {
      throw new BadRequestException(
        `type must match the node challenge type: ${challenge.type}.`,
      );
    }

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

      const correct = selectedOptionId === correctOptionId;
      const review = correct
        ? this.reviewService.toAdvancedOptionReview(
            challenge,
            selectedOptionId,
            correctOptionId,
          )
        : undefined;

      if (review) {
        await this.statusService.markNodeCompleted(
          userId,
          course.slug,
          this.mode,
          node.id,
          review,
        );
      }

      return {
        correct,
        message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
        correctOptionId,
        explanation: challenge.explanation,
        ...(correct
          ? {
              review,
              nextNode: await this.getNextNode(course.slug, node.id, userId),
            }
          : {}),
      };
    }

    if (challenge.type === 'drag_drop') {
      const dropZoneMap = payload.dropZoneMap;
      if (!isStringRecord(dropZoneMap)) {
        throw new BadRequestException('dropZoneMap must be an object.');
      }

      const correct = isSameStringRecord(
        dropZoneMap,
        challenge.correctDropZoneMap,
      );
      const review = correct
        ? this.reviewService.toAdvancedDropZoneReview(
            challenge,
            dropZoneMap,
            challenge.correctDropZoneMap,
          )
        : undefined;

      if (review) {
        await this.statusService.markNodeCompleted(
          userId,
          course.slug,
          this.mode,
          node.id,
          review,
        );
      }

      return {
        correct,
        message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
        correctDropZoneMap: challenge.correctDropZoneMap,
        explanation: challenge.explanation,
        ...(correct
          ? {
              review,
              nextNode: await this.getNextNode(course.slug, node.id, userId),
            }
          : {}),
      };
    }

    if (challenge.type === 'drag_drop_matching') {
      const matchingMap = payload.matchingMap;
      if (!isStringRecord(matchingMap)) {
        throw new BadRequestException('matchingMap must be an object.');
      }

      const correctMatchingMap = this.getCorrectMatchingMap(challenge);
      const correct = isSameStringRecord(matchingMap, correctMatchingMap);
      const review = correct
        ? this.reviewService.toAdvancedMatchingReview(
            challenge,
            matchingMap,
            correctMatchingMap,
          )
        : undefined;

      if (review) {
        await this.statusService.markNodeCompleted(
          userId,
          course.slug,
          this.mode,
          node.id,
          review,
        );
      }

      return {
        correct,
        message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
        correctMatchingMap,
        explanation: challenge.explanation,
        ...(correct
          ? {
              review,
              nextNode: await this.getNextNode(course.slug, node.id, userId),
            }
          : {}),
      };
    }

    if (challenge.type === 'ordering_steps' || challenge.type === 'ranking') {
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
      const correct = this.isSameStringArray(orderedIds, correctOrderedIds);
      const review = correct
        ? this.reviewService.toAdvancedOrderingReview(
            challenge,
            orderedIds,
            correctOrderedIds,
          )
        : undefined;

      if (review) {
        await this.statusService.markNodeCompleted(
          userId,
          course.slug,
          this.mode,
          node.id,
          review,
        );
      }

      return {
        correct,
        message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
        correctOrderedIds,
        explanation: challenge.explanation,
        ...(correct
          ? {
              review,
              nextNode: await this.getNextNode(course.slug, node.id, userId),
            }
          : {}),
      };
    }

    throw new BadRequestException(
      `Unsupported ${capitalizeMode(this.mode)} node type: ${challenge.type}.`,
    );
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
        publicChallenge[key] = value;
      }
    }

    return publicChallenge;
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
