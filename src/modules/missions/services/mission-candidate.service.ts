import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import {
  Chapter,
  ChapterDocument,
} from '../../chapters/schemas/chapter.schema';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';
import { LearningHistoryService } from '../../learning-history/learning-history.service';
import { Lesson, LessonDocument } from '../../lessons/schemas/lesson.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../../progress/schemas/lesson-progress.schema';
import {
  RoadmapProgress,
  RoadmapProgressDocument,
} from '../../roadmap/schemas/roadmap-progress.schema';
import type { RoadmapMode } from '../../roadmap/roadmap.types';
import type {
  LearningSnapshot,
  MissionCandidate,
  MissionKind,
  MissionSourceType,
} from '../missions.types';

type LeanLesson = Lesson & { _id: Types.ObjectId };
type AdvancedRoadmapNodeCandidate = {
  nodeId: string;
  title: string;
  estimatedMinutes: number;
  topic: string;
};

@Injectable()
export class MissionCandidateService {
  constructor(
    private readonly learningHistoryService: LearningHistoryService,
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
  ) {}

  async build(
    userId: string,
    snapshot: LearningSnapshot,
    kind: MissionKind,
  ): Promise<MissionCandidate[]> {
    void kind;
    const userObjectId = new Types.ObjectId(userId);
    const [courses, completedLessons, recentAttempts] = await Promise.all([
      this.courseModel
        .find({ isPublished: true })
        .sort({ order: 1 })
        .lean<Array<Course & { _id: Types.ObjectId }>>()
        .exec(),
      this.lessonProgressModel
        .find({ userId: userObjectId, completed: true })
        .select({ lessonId: 1, updatedAt: 1 })
        .lean<Array<{ lessonId: Types.ObjectId; updatedAt?: Date }>>()
        .exec(),
      this.learningHistoryService.getRecentAttempts(userId, 100),
    ]);

    const completedLessonIds = new Set(
      completedLessons.map((row) => String(row.lessonId)),
    );

    const candidates: MissionCandidate[] = [];
    let fallbackLessonPath: string | undefined;
    let fallbackRoadmapPath: string | undefined;
    const easyNodeIdsByCourse = new Map<string, string[]>();
    const completedEasyRoadmapIdsByCourse = new Map<string, Set<string>>();

    for (const course of courses) {
      const chapters = await this.chapterModel
        .find({ courseId: course._id, isPublished: true })
        .sort({ order: 1 })
        .select({ _id: 1 })
        .lean<Array<{ _id: Types.ObjectId }>>()
        .exec();
      const rawLessons = await this.lessonModel
        .find({
          chapterId: { $in: chapters.map((chapter) => chapter._id) },
          isPublished: true,
        })
        .lean<LeanLesson[]>()
        .exec();

      const lessonsByChapterId = new Map<string, LeanLesson[]>();
      for (const lesson of rawLessons) {
        const key = String(lesson.chapterId);
        if (!lessonsByChapterId.has(key)) {
          lessonsByChapterId.set(key, []);
        }
        lessonsByChapterId.get(key)!.push(lesson);
      }

      const lessons = chapters.flatMap((chapter) =>
        (lessonsByChapterId.get(String(chapter._id)) ?? []).sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        ),
      );
      easyNodeIdsByCourse.set(
        course.slug,
        lessons.map((lesson) => String(lesson._id)),
      );

      const availableLesson = lessons.find(
        (lesson, index) =>
          !completedLessonIds.has(String(lesson._id)) &&
          (index === 0 ||
            completedLessonIds.has(String(lessons[index - 1]._id))),
      );

      if (availableLesson) {
        fallbackLessonPath ??= `/lessons/${String(availableLesson._id)}`;
        candidates.push(
          this.lessonCandidate(
            course.slug,
            availableLesson,
            'CONTINUE_LESSON',
            'PROGRESS_BASED',
            snapshot,
          ),
          this.lessonCandidate(
            course.slug,
            availableLesson,
            'PASS_QUIZ',
            'PROGRESS_BASED',
            snapshot,
          ),
        );
      }

      const completedEasyRoadmapRows = await this.roadmapProgressModel
        .find({ userId, courseSlug: course.slug, mode: 'easy' })
        .select({ nodeId: 1 })
        .lean<Array<{ nodeId: string }>>()
        .exec();
      const completedEasyRoadmapIds = new Set(
        completedEasyRoadmapRows.map((row) => row.nodeId),
      );
      completedEasyRoadmapIdsByCourse.set(course.slug, completedEasyRoadmapIds);
      const availableRoadmapLesson = lessons.find(
        (lesson, index) =>
          !completedEasyRoadmapIds.has(String(lesson._id)) &&
          (index === 0 ||
            completedEasyRoadmapIds.has(String(lessons[index - 1]._id))),
      );

      if (
        availableRoadmapLesson &&
        this.hasRoadmapChallengeFile(course.slug, 'easy')
      ) {
        const availableRoadmapLessonId = String(availableRoadmapLesson._id);
        fallbackRoadmapPath ??= `/roadmap/${course.slug}/easy/nodes/${availableRoadmapLessonId}/challenge`;
        candidates.push({
          candidateId: `roadmap:easy:${availableRoadmapLessonId}`,
          actionType: 'COMPLETE_ROADMAP_NODE',
          targetType: 'NODE',
          targetId: availableRoadmapLessonId,
          topic: this.topicFromLesson(availableRoadmapLesson),
          title: this.truncateTitle(`Complete ${availableRoadmapLesson.title}`),
          message: 'Finish the next checkpoint on your roadmap.',
          href: `/roadmap/${course.slug}/easy/nodes/${availableRoadmapLessonId}`,
          ctaPath: `/roadmap/${course.slug}/easy/nodes/${availableRoadmapLessonId}/challenge`,
          difficulty: 'easy',
          estimatedMinutes: Math.max(
            5,
            availableRoadmapLesson.estimatedMinutes || 5,
          ),
          rewardXp: 20,
          expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
          sourceType: 'ROADMAP_STATE',
          generatedReason: 'Next available easy roadmap checkpoint.',
          metadata: { courseSlug: course.slug, mode: 'easy' },
        });
      }

      const completedEasyCount = lessons
        .map((lesson) => String(lesson._id))
        .filter((nodeId) => completedEasyRoadmapIds.has(nodeId)).length;
      if (completedEasyCount >= 5) {
        const mediumCandidate = await this.advancedRoadmapCandidate(
          userId,
          course.slug,
          'medium',
        );
        if (mediumCandidate) {
          fallbackRoadmapPath ??= mediumCandidate.ctaPath;
          candidates.push(mediumCandidate);
        }

        const mediumNodes = this.getAdvancedRoadmapNodes(course.slug, 'medium');
        const mediumCompletedCount = await this.countCompletedRoadmapNodes(
          userId,
          course.slug,
          'medium',
          mediumNodes.map((node) => node.nodeId),
        );
        if (mediumCompletedCount >= 5) {
          const hardCandidate = await this.advancedRoadmapCandidate(
            userId,
            course.slug,
            'hard',
          );
          if (hardCandidate) {
            fallbackRoadmapPath ??= hardCandidate.ctaPath;
            candidates.push(hardCandidate);
          }
        }
      }
      const reviewLesson = [...lessons]
        .reverse()
        .find((lesson) => completedLessonIds.has(String(lesson._id)));
      if (reviewLesson) {
        candidates.push(
          this.lessonCandidate(
            course.slug,
            reviewLesson,
            'REVIEW_LESSON',
            'PROGRESS_BASED',
            snapshot,
          ),
        );
      }
    }

    const failedRoadmapTargets = recentAttempts.filter(
      (attempt) => attempt.sourceType === 'ROADMAP' && !attempt.passed,
    );
    for (const attempt of failedRoadmapTargets.slice(0, 5)) {
      const mode = this.asRoadmapMode(attempt.mode);
      if (
        !this.isSafeRoadmapAttemptPath(
          attempt,
          easyNodeIdsByCourse,
          completedEasyRoadmapIdsByCourse,
        )
      ) {
        continue;
      }
      const completed = await this.roadmapProgressModel.exists({
        userId,
        nodeId: attempt.targetId,
        ...(attempt.courseSlug ? { courseSlug: attempt.courseSlug } : {}),
        ...(mode ? { mode } : {}),
      });
      if (completed) continue;
      const retryHref = `/roadmap/${attempt.courseSlug}/${mode}/nodes/${attempt.targetId}/challenge`;
      candidates.push({
        candidateId: `retry:${attempt.mode ?? 'easy'}:${attempt.targetId}`,
        actionType: 'RETRY_NODE',
        targetType: 'NODE',
        targetId: attempt.targetId,
        topic: attempt.topic,
        title: this.truncateTitle(`Retry ${this.humanize(attempt.topic)}`),
        message: 'Try the checkpoint that challenged you and finish it.',
        href: retryHref,
        ctaPath: retryHref,
        difficulty: mode ?? 'easy',
        estimatedMinutes: 8,
        rewardXp: mode === 'hard' ? 40 : 25,
        expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
        sourceType: 'ROADMAP_STATE',
        generatedReason: 'Recent failed roadmap attempt that is not completed.',
        metadata: {
          courseSlug: attempt.courseSlug,
          mode,
          previousMistake: attempt.primaryMistake,
        },
      });
    }

    for (const topic of snapshot.weakTopics.slice(0, 3)) {
      const attempt = recentAttempts.find(
        (a) =>
          (a.topic || '').trim().toLowerCase() === topic.trim().toLowerCase() &&
          a.targetId &&
          a.courseSlug,
      );

      const href =
        attempt &&
        this.isSafeRoadmapAttemptPath(
          attempt,
          easyNodeIdsByCourse,
          completedEasyRoadmapIdsByCourse,
        )
          ? `/roadmap/${attempt.courseSlug}/${attempt.mode || 'easy'}/nodes/${attempt.targetId}/challenge`
          : (fallbackRoadmapPath ?? fallbackLessonPath ?? '/roadmap');

      candidates.push({
        candidateId: `practice-topic:${topic}`,
        actionType: 'PRACTICE_TOPIC',
        targetType: 'TOPIC',
        targetId: topic,
        topic,
        title: this.truncateTitle(`Strengthen ${this.humanize(topic)}`),
        message: 'Complete one correct challenge in this weak topic.',
        href,
        ctaPath: href,
        difficulty:
          snapshot.preferredDifficulty === 'hard'
            ? 'hard'
            : snapshot.preferredDifficulty === 'medium'
              ? 'medium'
              : 'easy',
        estimatedMinutes: 7,
        rewardXp: 20,
        expectedEventTypes: ['ROADMAP_ATTEMPTED', 'QUIZ_ATTEMPTED'],
        sourceType: 'WEAK_TOPIC',
        generatedReason: 'Weak topic detected from recent learning attempts.',
      });
    }

    candidates.push({
      candidateId: 'daily:feed-pet',
      actionType: 'FEED_PET',
      targetType: 'PET',
      targetId: 'my-pet',
      title: 'Check your pet progress',
      message: 'Feed your pet once before you continue learning.',
      href: '/pet',
      difficulty: 'easy',
      estimatedMinutes: 1,
      rewardXp: 5,
      expectedEventTypes: ['PET_FED'],
      sourceType: 'PET_TONE',
      generatedReason: 'Daily pet/profile engagement.',
    });

    candidates.push({
      candidateId: 'arena:participate',
      actionType: 'ENTER_ARENA',
      targetType: 'ARENA',
      targetId: 'any',
      title: 'Compete in the Arena',
      message: 'Join an Arena match and test your skills.',
      href: '/arena',
      difficulty: 'medium',
      estimatedMinutes: 5,
      rewardXp: 30,
      expectedEventTypes: ['ARENA_MATCH_FINISHED'],
      sourceType: 'PROGRESS_BASED',
      generatedReason: 'Compete with others in Arena.',
    });

    const unique = [
      ...new Map(candidates.map((item) => [item.candidateId, item])).values(),
    ];
    return unique;
  }

  private async advancedRoadmapCandidate(
    userId: string,
    courseSlug: string,
    mode: 'medium' | 'hard',
  ): Promise<MissionCandidate | null> {
    const nodes = this.getAdvancedRoadmapNodes(courseSlug, mode);
    if (nodes.length === 0) return null;

    const completedCount = await this.countCompletedRoadmapNodes(
      userId,
      courseSlug,
      mode,
      nodes.map((node) => node.nodeId),
    );
    const nextNode = nodes[completedCount];
    if (!nextNode) return null;

    const ctaPath = `/roadmap/${courseSlug}/${mode}/nodes/${nextNode.nodeId}/challenge`;
    return {
      candidateId: `roadmap:${mode}:${nextNode.nodeId}`,
      actionType: 'COMPLETE_ROADMAP_NODE',
      targetType: 'NODE',
      targetId: nextNode.nodeId,
      topic: nextNode.topic,
      title: this.truncateTitle(`Complete ${nextNode.title}`),
      message: `Continue with the next ${mode} roadmap checkpoint.`,
      href: ctaPath,
      ctaPath,
      difficulty: mode,
      estimatedMinutes: Math.max(5, nextNode.estimatedMinutes),
      rewardXp: mode === 'hard' ? 40 : 30,
      expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
      sourceType: 'ROADMAP_STATE',
      generatedReason: `Next available ${mode} roadmap checkpoint.`,
      metadata: { courseSlug, mode },
    };
  }

  private getAdvancedRoadmapNodes(
    courseSlug: string,
    mode: 'medium' | 'hard',
  ): AdvancedRoadmapNodeCandidate[] {
    const file = this.readAdvancedRoadmapChallengeFile(courseSlug, mode);
    if (
      !file ||
      file.courseSlug !== courseSlug ||
      file.mode !== mode ||
      !Array.isArray(file.chapters)
    ) {
      return [];
    }

    return file.chapters.flatMap((chapter) =>
      (chapter.nodes ?? []).map((node) => ({
        nodeId: `${courseSlug}-${mode}-c${chapter.chapterOrder}-n${node.order}`,
        title: node.title || `${mode} checkpoint`,
        estimatedMinutes: node.estimatedMinutes || 8,
        topic: this.topicFromTitle(node.title || chapter.chapterTitle || mode),
      })),
    );
  }

  private readAdvancedRoadmapChallengeFile(
    courseSlug: string,
    mode: 'medium' | 'hard',
  ) {
    const filePath = this.getRoadmapChallengePath(courseSlug, mode);
    if (!fs.existsSync(filePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
        courseSlug?: string;
        mode?: string;
        chapters?: Array<{
          chapterOrder: number;
          chapterTitle?: string;
          nodes?: Array<{
            order: number;
            title?: string;
            estimatedMinutes?: number;
          }>;
        }>;
      };
    } catch {
      return null;
    }
  }

  private async countCompletedRoadmapNodes(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    nodeIds: string[],
  ) {
    if (nodeIds.length === 0) return 0;
    const rows = await this.roadmapProgressModel
      .find({
        userId,
        courseSlug,
        mode,
        nodeId: { $in: nodeIds },
      })
      .select({ nodeId: 1 })
      .lean<Array<{ nodeId: string }>>()
      .exec();

    const completed = new Set(rows.map((row) => row.nodeId));
    return nodeIds.filter((nodeId) => completed.has(nodeId)).length;
  }
  private lessonCandidate(
    courseSlug: string,
    lesson: LeanLesson,
    actionType: 'CONTINUE_LESSON' | 'PASS_QUIZ' | 'REVIEW_LESSON',
    sourceType: MissionSourceType,
    snapshot: LearningSnapshot,
  ): MissionCandidate {
    const id = String(lesson._id);
    const topic = this.topicFromLesson(lesson);
    const definitions = {
      CONTINUE_LESSON: {
        title: `Continue ${lesson.title}`,
        message: 'Complete the next lesson in your learning path.',
        events: ['LESSON_COMPLETED'] as const,
        rewardXp: 20,
      },
      PASS_QUIZ: {
        title: `Pass the ${lesson.title} quiz`,
        message: 'Take the lesson quiz and reach the required score.',
        events: ['QUIZ_ATTEMPTED', 'LESSON_COMPLETED'] as const,
        rewardXp: 20,
      },
      REVIEW_LESSON: {
        title: `Review ${lesson.title}`,
        message: 'Retake the quiz to strengthen what you learned.',
        events: ['QUIZ_ATTEMPTED'] as const,
        rewardXp: 15,
      },
    }[actionType];
    return {
      candidateId: `${actionType.toLowerCase()}:${id}`,
      actionType,
      targetType: 'LESSON',
      targetId: id,
      topic,
      title: this.truncateTitle(definitions.title),
      message: this.withToneMessage(definitions.message, snapshot),
      href: `/lessons/${id}`,
      difficulty: 'easy',
      estimatedMinutes: Math.max(5, lesson.estimatedMinutes || 5),
      rewardXp: definitions.rewardXp,
      expectedEventTypes: [...definitions.events],
      sourceType,
      generatedReason:
        sourceType === 'STARTER'
          ? 'Starter mission for early account progress.'
          : 'Next useful lesson action from course progress.',
      metadata: { courseSlug },
    };
  }

  private withToneMessage(message: string, snapshot: LearningSnapshot) {
    const traits = snapshot.personality.dominantTraits;
    if (traits.includes('competitive')) {
      return `${message} Aim for a clean win.`.slice(0, 120);
    }
    if (traits.includes('analytical')) {
      return `${message} Notice the key rule as you go.`.slice(0, 120);
    }
    if (traits.includes('curious') || traits.includes('creative')) {
      return `${message} Explore one detail that surprises you.`.slice(0, 120);
    }
    return message;
  }

  private topicFromTitle(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  private topicFromLesson(lesson: LeanLesson) {
    return (lesson.slug || lesson.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  private humanize(value: string) {
    return value
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private truncateTitle(value: string, maxLength = 45) {
    const title = value.trim().replace(/\s+/g, ' ');
    if (title.length <= maxLength) return title;

    const limit = Math.max(4, maxLength - 3);
    const clipped = title.slice(0, limit);
    const lastSpace = clipped.lastIndexOf(' ');
    const safeClip = lastSpace > 20 ? clipped.slice(0, lastSpace) : clipped;
    return `${safeClip.trim()}...`;
  }

  private isSafeRoadmapAttemptPath(
    attempt: {
      courseSlug?: string;
      mode?: string;
      targetId?: string;
    },
    easyNodeIdsByCourse: Map<string, string[]>,
    completedEasyRoadmapIdsByCourse: Map<string, Set<string>>,
  ) {
    if (!attempt.courseSlug || !attempt.targetId) return false;
    const mode = this.asRoadmapMode(attempt.mode);
    if (!mode) return false;
    if (mode === 'easy') {
      if (!Types.ObjectId.isValid(attempt.targetId)) return false;
      const nodeIds = easyNodeIdsByCourse.get(attempt.courseSlug) ?? [];
      const targetIndex = nodeIds.indexOf(attempt.targetId);
      if (targetIndex < 0) return false;
      if (targetIndex === 0) return true;
      const completedIds =
        completedEasyRoadmapIdsByCourse.get(attempt.courseSlug) ?? new Set();
      return completedIds.has(nodeIds[targetIndex - 1]);
    }
    return /^[a-z0-9-]+-(medium|hard)-c\d+-n\d+$/i.test(attempt.targetId);
  }

  private asRoadmapMode(value?: string): RoadmapMode | undefined {
    return value === 'easy' || value === 'medium' || value === 'hard'
      ? value
      : undefined;
  }

  private hasRoadmapChallengeFile(courseSlug: string, mode: RoadmapMode) {
    return fs.existsSync(this.getRoadmapChallengePath(courseSlug, mode));
  }

  private getRoadmapChallengePath(courseSlug: string, mode: RoadmapMode) {
    return path.resolve(
      process.cwd(),
      'src',
      'database',
      'seeds',
      'content',
      courseSlug,
      `${mode}-roadmap-challenges.json`,
    );
  }
}
