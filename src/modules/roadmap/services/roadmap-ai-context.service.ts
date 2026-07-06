import { Injectable } from '@nestjs/common';
import type {
  AiRoadmapContext,
  RoadmapMode,
} from '../../ai-chat/ai-chat.types';
import { EasyRoadmapService } from './easy-roadmap.service';
import { HardRoadmapService } from './hard-roadmap.service';
import { MediumRoadmapService } from './medium-roadmap.service';
import { RoadmapReviewService } from './roadmap-review.service';
import { RoadmapStatusService } from './roadmap-status.service';

@Injectable()
export class RoadmapAiContextService {
  constructor(
    private readonly easyRoadmapService: EasyRoadmapService,
    private readonly hardRoadmapService: HardRoadmapService,
    private readonly mediumRoadmapService: MediumRoadmapService,
    private readonly reviewService: RoadmapReviewService,
    private readonly statusService: RoadmapStatusService,
  ) {}

  async getContext(
    mode: RoadmapMode,
    nodeId: string,
    userId: string,
  ): Promise<AiRoadmapContext> {
    if (mode === 'easy') {
      const { node, chapter, course, lesson } =
        await this.easyRoadmapService.getNodeContext(nodeId, userId);
      const challenge = this.easyRoadmapService.findChallenge(
        course.slug,
        chapter,
        lesson,
      );
      const completion =
        node.status === 'completed'
          ? await this.statusService.getNodeCompletion(
              userId,
              course.slug,
              mode,
              node.id,
            )
          : null;

      return {
        mode,
        course: {
          id: String(course._id),
          slug: course.slug,
          title: course.title,
        },
        chapter: {
          id: String(chapter._id),
          title: chapter.title,
          order: chapter.order,
        },
        node,
        relatedLesson: {
          id: String(lesson._id),
          title: lesson.title,
          description: lesson.description || '',
          href: `/lesson/${String(lesson._id)}`,
        },
        challenge: this.easyRoadmapService.toPublicChallenge(lesson, challenge),
        ...(node.status === 'completed'
          ? {
              review: await this.reviewService.toEasyCompletedReview(
                userId,
                challenge,
                completion,
              ),
            }
          : {}),
      };
    }

    const roadmapService =
      mode === 'hard' ? this.hardRoadmapService : this.mediumRoadmapService;
    const { node, course, chapter, chapterData, challenge } =
      await roadmapService.getNodeContext(nodeId, userId);
    const completion =
      node.status === 'completed'
        ? await this.statusService.getNodeCompletion(
            userId,
            course.slug,
            mode,
            node.id,
          )
        : null;

    return {
      mode,
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
      },
      chapter: {
        ...(chapter ? { id: String(chapter._id) } : {}),
        title: chapter?.title ?? chapterData.chapterTitle,
        order: chapterData.chapterOrder,
      },
      node,
      challenge: roadmapService.toPublicChallenge(nodeId, challenge),
      ...(node.status === 'completed'
        ? {
            review: await this.reviewService.toAdvancedCompletedReview(
              userId,
              mode,
              challenge,
              completion,
            ),
          }
        : {}),
    };
  }
}
