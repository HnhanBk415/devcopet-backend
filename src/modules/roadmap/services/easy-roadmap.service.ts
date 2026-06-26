import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  EasyChallengeData,
  EasyNodeContext,
  LeanChapter,
  LeanLesson,
} from '../roadmap.types';
import { RoadmapChallengeLoaderService } from './roadmap-challenge-loader.service';
import { RoadmapQueryService } from './roadmap-query.service';
import { RoadmapReviewService } from './roadmap-review.service';
import { RoadmapStatusService } from './roadmap-status.service';
import {
  EASY_NODE_DURATION_MINUTES,
  groupBy,
  isChallengeOptionId,
} from '../utils/roadmap.util';
import { UsersService } from '../../users/users.service';
import { ROADMAP_NODE_XP } from '../../users/xp.util';

@Injectable()
export class EasyRoadmapService {
  private readonly mode = 'easy' as const;

  constructor(
    private readonly challengeLoader: RoadmapChallengeLoaderService,
    private readonly queryService: RoadmapQueryService,
    private readonly reviewService: RoadmapReviewService,
    private readonly statusService: RoadmapStatusService,
    private readonly usersService: UsersService,
  ) {}

  async getRoadmap(courseSlug: string, userId: string) {
    const course = await this.queryService.findCourseBySlugOrThrow(courseSlug);
    const chapters = await this.queryService.findPublishedChapters(course._id);
    const lessons = await this.queryService.findPublishedLessons(
      chapters.map((chapter) => chapter._id),
    );
    const lessonsByChapterId = groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );
    const orderedNodeIds = this.getOrderedLessonIds(
      chapters,
      lessonsByChapterId,
    );
    const statusMap = await this.statusService.getStatusMap(
      userId,
      course.slug,
      this.mode,
      orderedNodeIds,
    );

    const responseChapters = chapters.map((chapter, chapterIndex) => {
      const chapterLessons = lessonsByChapterId.get(String(chapter._id)) || [];
      const chapterLabelOrder = chapterIndex + 1;

      const nodes = chapterLessons.map((lesson) => {
        const lessonId = String(lesson._id);
        const chapterId = String(chapter._id);

        return {
          id: lessonId,
          lessonId,
          chapterId,
          chapterOrder: chapter.order,
          lessonOrder: lesson.order,
          label: `${chapterLabelOrder}.${lesson.order}`,
          title: lesson.title,
          description: lesson.description || '',
          status: statusMap.get(lessonId) ?? 'locked',
          xp: ROADMAP_NODE_XP.easy,
          duration: EASY_NODE_DURATION_MINUTES,
          href: `/lesson/${lessonId}`,
        };
      });

      return {
        id: String(chapter._id),
        slug: chapter.slug,
        title: chapter.title,
        order: chapter.order,
        lessonCount: chapterLessons.length,
        nodeCount: nodes.length,
        nodes,
      };
    });

    const totalLessons = responseChapters.reduce(
      (sum, chapter) => sum + chapter.lessonCount,
      0,
    );

    return {
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
        totalChapters: responseChapters.length,
        totalLessons,
        totalNodes: totalLessons,
      },
      mode: 'easy',
      chapters: responseChapters,
    };
  }

  async getNodeChallenge(nodeId: string, userId: string) {
    const { node, chapter, course, lesson } = await this.getNodeContext(
      nodeId,
      userId,
    );
    const challenge = this.findChallenge(course.slug, chapter, lesson);

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
        chapterIndex: chapter.order,
      },
      challenge: this.toPublicChallenge(lesson, challenge),
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

      return {
        ...baseResponse,
        review: this.reviewService.toEasyCompletedReview(challenge, completion),
      };
    }

    return baseResponse;
  }

  async submitNodeChallenge(
    nodeId: string,
    selectedOptionId: string,
    userId: string,
  ) {
    const { node, chapter, course, lesson } = await this.getNodeContext(
      nodeId,
      userId,
    );
    const challenge = this.findChallenge(course.slug, chapter, lesson);

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

      return {
        correct: true,
        status: 'PASSED',
        alreadyCompleted: true,
        message: 'This roadmap node is already completed.',
        explanation:
          challenge.explanation ||
          'This works because it matches the key rule in the checkpoint. Focus on the concept, then apply it to the next problem.',
        explanationSpeaker,
        rewardSummary: this.getEmptyRewardSummary(),
        review: this.reviewService.toEasyCompletedReview(challenge, completion),
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

    if (!isChallengeOptionId(selectedOptionId)) {
      throw new BadRequestException(
        'selectedOptionId must be one of A, B, C, or D.',
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

    const correct = selectedOptionId === challenge.correctOptionId;

    if (correct) {
      const review = this.reviewService.toEasyReview(
        challenge,
        selectedOptionId,
      );

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
          message: 'This roadmap node is already completed.',
          explanation:
            challenge.explanation ||
            'This works because it matches the key rule in the checkpoint. Focus on the concept, then apply it to the next problem.',
          explanationSpeaker,
          rewardSummary: this.getEmptyRewardSummary(),
          review: this.reviewService.toEasyCompletedReview(
            challenge,
            completion,
          ),
          navigation,
        };
      }
      await this.usersService.awardXp(userId, ROADMAP_NODE_XP.easy);

      return {
        correct: true,
        status: 'PASSED',
        message: 'Correct. Nice work.',
        explanation:
          challenge.explanation ||
          'This works because it matches the key rule in the checkpoint. Focus on the concept, then apply it to the next problem.',
        explanationSpeaker,
        rewardSummary: this.getRewardSummary(),
        review,
        navigation,
      };
    }

    return {
      correct: false,
      status: 'FAILED',
      message:
        'Not quite. Return to the roadmap and try this checkpoint again.',
      explanation: undefined,
      correctOptionId: undefined,
      rewardSummary: this.getEmptyRewardSummary(),
      navigation: {
        returnToRoadmap: { courseSlug: course.slug, mode: this.mode },
        nextChallenge: null,
      },
    };
  }

  async getNodeContext(
    nodeId: string,
    userId: string,
  ): Promise<EasyNodeContext> {
    const lesson = await this.queryService.findEasyLessonOrThrow(nodeId);
    const chapter = await this.queryService.findChapterByIdOrThrow(
      lesson.chapterId,
      nodeId,
    );
    const course = await this.queryService.findCourseByIdOrThrow(
      chapter.courseId,
      nodeId,
    );
    const chapters = await this.queryService.findPublishedChapters(
      chapter.courseId,
    );

    const chapterIndex = chapters.findIndex(
      (item) => String(item._id) === String(chapter._id),
    );
    const chapterLabelOrder = chapterIndex >= 0 ? chapterIndex + 1 : 1;

    const lessons = await this.queryService.findPublishedLessons(
      chapters.map((item) => item._id),
    );
    const lessonsByChapterId = groupBy(lessons, (item) =>
      String(item.chapterId),
    );
    const orderedNodeIds = this.getOrderedLessonIds(
      chapters,
      lessonsByChapterId,
    );
    const statusMap = await this.statusService.getStatusMap(
      userId,
      course.slug,
      this.mode,
      orderedNodeIds,
    );

    const lessonId = String(lesson._id);
    const chapterId = String(chapter._id);

    return {
      node: {
        id: lessonId,
        lessonId,
        chapterId,
        label: `${chapterLabelOrder}.${lesson.order}`,
        title: lesson.title,
        status: statusMap.get(lessonId) ?? 'locked',
      },
      chapter,
      course,
      lesson,
    };
  }

  findChallenge(
    courseSlug: string,
    chapter: LeanChapter,
    lesson: LeanLesson,
  ): EasyChallengeData {
    const challengeFile =
      this.challengeLoader.loadEasyChallengeFile(courseSlug);
    const challenge = challengeFile.challenges.find(
      (item) =>
        item.chapterOrder === chapter.order &&
        item.lessonOrder === lesson.order,
    );

    if (!challenge) {
      throw new NotFoundException(
        `Easy challenge not found for ${courseSlug} ${chapter.order}.${lesson.order}`,
      );
    }

    return challenge;
  }

  toPublicChallenge(lesson: LeanLesson, challenge: EasyChallengeData) {
    return {
      id: `easy-challenge-${String(lesson._id)}`,
      type: challenge.type,
      promptType: challenge.promptType,
      title: challenge.title,
      question: challenge.question,
      ...(challenge.codeSnippet ? { codeSnippet: challenge.codeSnippet } : {}),
      options: challenge.options,
      xp: ROADMAP_NODE_XP.easy,
      estimatedMinutes: challenge.estimatedMinutes,
    };
  }

  private getRewardSummary() {
    const xp = ROADMAP_NODE_XP.easy;
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

  private getOrderedLessonIds(
    chapters: LeanChapter[],
    lessonsByChapterId: Map<string, LeanLesson[]>,
  ): string[] {
    const orderedIds: string[] = [];

    for (const chapter of chapters) {
      const chapterLessons = lessonsByChapterId.get(String(chapter._id)) || [];

      for (const lesson of chapterLessons) {
        orderedIds.push(String(lesson._id));
      }
    }

    return orderedIds;
  }

  private async getNextNode(
    courseSlug: string,
    nodeId: string,
    userId: string,
  ) {
    const course = await this.queryService.findCourseBySlugOrThrow(courseSlug);
    const chapters = await this.queryService.findPublishedChapters(course._id);
    const lessons = await this.queryService.findPublishedLessons(
      chapters.map((chapter) => chapter._id),
    );
    const lessonsByChapterId = groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );
    const orderedNodeIds = this.getOrderedLessonIds(
      chapters,
      lessonsByChapterId,
    );
    const currentIndex = orderedNodeIds.indexOf(nodeId);
    const nextNodeId = orderedNodeIds[currentIndex + 1];

    if (!nextNodeId) return null;

    const statusMap = await this.statusService.getStatusMap(
      userId,
      course.slug,
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
}
