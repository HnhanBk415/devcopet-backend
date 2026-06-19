import { BadRequestException, NotFoundException } from '@nestjs/common';
import type {
  AdvancedChallengeData,
  AdvancedChallengeFile,
  AdvancedNodeContext,
  AdvancedRoadmapMode,
} from '../roadmap.types';
import { RoadmapChallengeLoaderService } from './roadmap-challenge-loader.service';
import { RoadmapQueryService } from './roadmap-query.service';
import { RoadmapReviewService } from './roadmap-review.service';
import { RoadmapStatusService } from './roadmap-status.service';
import {
  ADVANCED_NODE_ID_PATTERN,
  capitalizeMode,
  isChallengeOptionId,
  isSameStringRecord,
  isStringRecord,
} from '../utils/roadmap.util';

export abstract class AdvancedRoadmapBaseService {
  protected abstract readonly mode: AdvancedRoadmapMode;
  constructor(
    protected readonly challengeLoader: RoadmapChallengeLoaderService,
    protected readonly queryService: RoadmapQueryService,
    protected readonly reviewService: RoadmapReviewService,
    protected readonly statusService: RoadmapStatusService,
  ) {}

  async getRoadmap(courseSlug: string) {
    const course = await this.queryService.findCourseBySlugOrThrow(courseSlug);
    const challengeFile = this.challengeLoader.loadAdvancedChallengeFile(
      this.mode,
      course.slug,
    );

    const chapters = await this.queryService.findPublishedChapters(course._id);
    const chaptersByOrder = new Map(
      chapters.map((chapter) => [chapter.order, chapter]),
    );

    let globalNodeIndex = 0;
    const responseChapters = challengeFile.chapters.map((chapterData) => {
      const chapter = chaptersByOrder.get(chapterData.chapterOrder);
      const chapterId = chapter ? String(chapter._id) : undefined;

      const nodes = chapterData.nodes.map((challenge) => {
        globalNodeIndex++;

        return {
          id: this.toNodeId(
            this.mode,
            course.slug,
            chapterData.chapterOrder,
            challenge.order,
          ),
          ...(chapterId ? { chapterId } : {}),
          chapterOrder: chapterData.chapterOrder,
          order: challenge.order,
          label: challenge.label,
          title: challenge.title,
          type: challenge.type,
          status: this.statusService.getAdvancedStatus(globalNodeIndex),
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

  async getNodeChallenge(nodeId: string) {
    const { node, challenge } = await this.getNodeContext(nodeId);

    if (node.status === 'locked') {
      return {
        node,
        challenge: null,
        message: 'This roadmap node is locked.',
      };
    }

    if (node.status === 'completed') {
      return {
        node,
        challenge: this.toPublicChallenge(nodeId, challenge),
        review: this.reviewService.toAdvancedFallbackReview(challenge, node.id),
      };
    }

    return {
      node,
      challenge: this.toPublicChallenge(nodeId, challenge),
    };
  }

  async submitNodeChallenge(nodeId: string, payload: Record<string, unknown>) {
    const { node, challenge } = await this.getNodeContext(nodeId);

    if (node.status === 'locked') {
      throw new BadRequestException('This roadmap node is locked.');
    }

    if (payload?.type !== challenge.type) {
      throw new BadRequestException(
        `type must match the node challenge type: ${challenge.type}.`,
      );
    }

    if (challenge.type === 'multiple_choice') {
      const selectedOptionId = payload.selectedOptionId;
      if (
        typeof selectedOptionId !== 'string' ||
        !isChallengeOptionId(selectedOptionId)
      ) {
        throw new BadRequestException(
          'selectedOptionId must be one of A, B, C, or D.',
        );
      }

      const correct = selectedOptionId === challenge.correctOptionId;

      return {
        correct,
        message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
        correctOptionId: challenge.correctOptionId,
        explanation: challenge.explanation,
      };
    }

    const dropZoneMap = payload.dropZoneMap;
    if (!isStringRecord(dropZoneMap)) {
      throw new BadRequestException('dropZoneMap must be an object.');
    }

    const correct = isSameStringRecord(
      dropZoneMap,
      challenge.correctDropZoneMap,
    );

    return {
      correct,
      message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
      correctDropZoneMap: challenge.correctDropZoneMap,
      explanation: challenge.explanation,
    };
  }

  async getNodeContext(nodeId: string): Promise<AdvancedNodeContext> {
    const parsedNodeId = this.parseNodeId(this.mode, nodeId);
    const course = await this.queryService.findCourseBySlugOrThrow(
      parsedNodeId.courseSlug,
    );
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

    return {
      node: {
        id: nodeId,
        label: challenge.label,
        title: challenge.title,
        type: challenge.type,
        status: this.statusService.getAdvancedStatus(globalNodeIndex),
      },
      course,
      ...(chapter ? { chapter } : {}),
      chapterData,
      challenge,
      globalNodeIndex,
    };
  }

  toPublicChallenge(nodeId: string, challenge: AdvancedChallengeData) {
    const baseChallenge = {
      id: `${this.mode}-challenge-${nodeId}`,
      type: challenge.type,
      title: challenge.title,
      question: challenge.question,
      codeSnippet: challenge.codeSnippet ?? null,
      xp: challenge.xp,
      estimatedMinutes: challenge.estimatedMinutes,
    };

    if (challenge.type === 'multiple_choice') {
      return {
        ...baseChallenge,
        type: challenge.type,
        options: challenge.options,
      };
    }

    return {
      ...baseChallenge,
      type: challenge.type,
      template: challenge.template,
      poolItems: challenge.poolItems,
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
}
