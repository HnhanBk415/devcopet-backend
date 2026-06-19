import {
  BadRequestException,
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

@Injectable()
export class EasyRoadmapService {
  constructor(
    private readonly challengeLoader: RoadmapChallengeLoaderService,
    private readonly queryService: RoadmapQueryService,
    private readonly reviewService: RoadmapReviewService,
    private readonly statusService: RoadmapStatusService,
  ) {}

  async getRoadmap(courseSlug: string) {
    const course = await this.queryService.findCourseBySlugOrThrow(courseSlug);
    const chapters = await this.queryService.findPublishedChapters(course._id);
    const lessons = await this.queryService.findPublishedLessons(
      chapters.map((chapter) => chapter._id),
    );
    const lessonsByChapterId = groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );

    let globalLessonIndex = 0;
    const responseChapters = chapters.map((chapter, chapterIndex) => {
      const chapterLessons = lessonsByChapterId.get(String(chapter._id)) || [];
      const chapterLabelOrder = chapterIndex + 1;

      const nodes = chapterLessons.map((lesson) => {
        globalLessonIndex++;
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
          status: this.statusService.getEasyStatus(globalLessonIndex),
          xp: lesson.xpReward ?? 0,
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

  async getNodeChallenge(nodeId: string) {
    const { node, chapter, course, lesson } = await this.getNodeContext(nodeId);
    const challenge = this.findChallenge(course.slug, chapter, lesson);

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
        challenge: this.toPublicChallenge(lesson, challenge),
        review: this.reviewService.toEasyFallbackReview(challenge, node.id),
      };
    }

    return {
      node,
      challenge: this.toPublicChallenge(lesson, challenge),
    };
  }

  async submitNodeChallenge(nodeId: string, selectedOptionId: string) {
    if (!isChallengeOptionId(selectedOptionId)) {
      throw new BadRequestException(
        'selectedOptionId must be one of A, B, C, or D.',
      );
    }

    const { node, chapter, course, lesson } = await this.getNodeContext(nodeId);
    const challenge = this.findChallenge(course.slug, chapter, lesson);

    if (node.status === 'locked') {
      throw new BadRequestException('This roadmap node is locked.');
    }

    if (node.status === 'completed') {
      return {
        message: 'This roadmap node is already completed.',
        review: this.reviewService.toEasyFallbackReview(challenge, node.id),
      };
    }

    const correct = selectedOptionId === challenge.correctOptionId;

    if (correct) {
      return {
        correct: true,
        message: 'Correct. Nice work.',
        explanation: challenge.explanation,
      };
    }

    return {
      correct: false,
      message: 'Not quite. Review the explanation and try the lesson again.',
      correctOptionId: challenge.correctOptionId,
      explanation: challenge.explanation,
    };
  }

  async getNodeContext(nodeId: string): Promise<EasyNodeContext> {
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

    const globalLessonIndex = this.findGlobalLessonIndex(
      chapters,
      lessons,
      String(lesson._id),
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
        status: this.statusService.getEasyStatus(globalLessonIndex),
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
      xp: challenge.xp,
      estimatedMinutes: challenge.estimatedMinutes,
    };
  }

  private findGlobalLessonIndex(
    chapters: LeanChapter[],
    lessons: LeanLesson[],
    lessonId: string,
  ): number {
    const lessonsByChapterId = groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );
    let globalLessonIndex = 0;

    for (const chapter of chapters) {
      const chapterLessons = lessonsByChapterId.get(String(chapter._id)) || [];

      for (const lesson of chapterLessons) {
        globalLessonIndex++;
        if (String(lesson._id) === lessonId) {
          return globalLessonIndex;
        }
      }
    }

    return 1;
  }
}
