import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
} from '../missions.types';

type LeanLesson = Lesson & { _id: Types.ObjectId };

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

    for (const course of courses) {
      const chapters = await this.chapterModel
        .find({ courseId: course._id, isPublished: true })
        .sort({ order: 1 })
        .select({ _id: 1 })
        .lean<Array<{ _id: Types.ObjectId }>>()
        .exec();
      const lessons = await this.lessonModel
        .find({
          chapterId: { $in: chapters.map((chapter) => chapter._id) },
          isPublished: true,
        })
        .sort({ order: 1 })
        .lean<LeanLesson[]>()
        .exec();
      const availableLesson = lessons.find(
        (lesson, index) =>
          !completedLessonIds.has(String(lesson._id)) &&
          (index === 0 ||
            completedLessonIds.has(String(lessons[index - 1]._id))),
      );

      if (availableLesson) {
        candidates.push(
          this.lessonCandidate(course.slug, availableLesson, 'CONTINUE_LESSON'),
          this.lessonCandidate(course.slug, availableLesson, 'PASS_QUIZ'),
        );

        const roadmapCompleted = await this.roadmapProgressModel.exists({
          userId,
          courseSlug: course.slug,
          mode: 'easy',
          nodeId: String(availableLesson._id),
        });
        if (!roadmapCompleted) {
          candidates.push({
            candidateId: `roadmap:easy:${String(availableLesson._id)}`,
            actionType: 'COMPLETE_ROADMAP_NODE',
            targetType: 'NODE',
            targetId: String(availableLesson._id),
            topic: this.topicFromLesson(availableLesson),
            title: `Chinh phục ${availableLesson.title}`,
            message: 'Hoàn thành checkpoint tiếp theo trên roadmap.',
            href: `/roadmaps/${course.slug}/easy/nodes/${String(availableLesson._id)}`,
            difficulty: 'easy',
            estimatedMinutes: Math.max(
              5,
              availableLesson.estimatedMinutes || 5,
            ),
            rewardXp: 20,
            expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
            metadata: { courseSlug: course.slug, mode: 'easy' },
          });
        }
      }

      const reviewLesson = [...lessons]
        .reverse()
        .find((lesson) => completedLessonIds.has(String(lesson._id)));
      if (reviewLesson) {
        candidates.push(
          this.lessonCandidate(course.slug, reviewLesson, 'REVIEW_LESSON'),
        );
      }
    }

    const failedRoadmapTargets = recentAttempts.filter(
      (attempt) => attempt.sourceType === 'ROADMAP' && !attempt.passed,
    );
    for (const attempt of failedRoadmapTargets.slice(0, 5)) {
      const mode = this.asRoadmapMode(attempt.mode);
      const completed = await this.roadmapProgressModel.exists({
        userId,
        nodeId: attempt.targetId,
        ...(attempt.courseSlug ? { courseSlug: attempt.courseSlug } : {}),
        ...(mode ? { mode } : {}),
      });
      if (completed) continue;
      candidates.push({
        candidateId: `retry:${attempt.mode ?? 'easy'}:${attempt.targetId}`,
        actionType: 'RETRY_NODE',
        targetType: 'NODE',
        targetId: attempt.targetId,
        topic: attempt.topic,
        title: `Phục thù ${this.humanize(attempt.topic)}`,
        message: 'Thử lại checkpoint từng làm khó bạn và hoàn thành nó.',
        href:
          typeof attempt.metadata?.href === 'string'
            ? attempt.metadata.href
            : `/roadmaps/${attempt.courseSlug ?? 'python-basic'}/${attempt.mode ?? 'easy'}/nodes/${attempt.targetId}`,
        difficulty: mode ?? 'easy',
        estimatedMinutes: 8,
        rewardXp: mode === 'hard' ? 40 : 25,
        expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
        metadata: {
          courseSlug: attempt.courseSlug,
          mode,
          previousMistake: attempt.primaryMistake,
        },
      });
    }

    for (const topic of snapshot.weakTopics.slice(0, 3)) {
      candidates.push({
        candidateId: `practice-topic:${topic}`,
        actionType: 'PRACTICE_TOPIC',
        targetType: 'TOPIC',
        targetId: topic,
        topic,
        title: `Củng cố ${this.humanize(topic)}`,
        message: 'Hoàn thành một thử thách đúng ở chủ đề cần cải thiện.',
        href: '/roadmaps',
        difficulty:
          snapshot.preferredDifficulty === 'hard'
            ? 'hard'
            : snapshot.preferredDifficulty === 'medium'
              ? 'medium'
              : 'easy',
        estimatedMinutes: 7,
        rewardXp: 20,
        expectedEventTypes: ['ROADMAP_ATTEMPTED', 'QUIZ_ATTEMPTED'],
      });
    }

    candidates.push({
      candidateId: 'daily:feed-pet',
      actionType: 'FEED_PET',
      targetType: 'PET',
      targetId: 'my-pet',
      title: 'Tiếp năng lượng cho đồng đội',
      message: 'Feed pet một lần để cùng bắt đầu ngày học.',
      href: '/pet',
      difficulty: 'easy',
      estimatedMinutes: 1,
      rewardXp: 5,
      expectedEventTypes: ['PET_FED'],
    });

    const unique = [
      ...new Map(candidates.map((item) => [item.candidateId, item])).values(),
    ];
    if (kind === 'HARDCORE') {
      return unique
        .filter((candidate) => candidate.actionType !== 'FEED_PET')
        .map((candidate) => ({
          ...candidate,
          difficulty: 'hard' as const,
          rewardXp: Math.max(50, candidate.rewardXp),
          estimatedMinutes: Math.max(10, candidate.estimatedMinutes),
          candidateId: `hardcore:${candidate.candidateId}`,
          title: `Hardcore: ${candidate.title}`.slice(0, 45),
        }));
    }
    return unique;
  }

  private lessonCandidate(
    courseSlug: string,
    lesson: LeanLesson,
    actionType: 'CONTINUE_LESSON' | 'PASS_QUIZ' | 'REVIEW_LESSON',
  ): MissionCandidate {
    const id = String(lesson._id);
    const topic = this.topicFromLesson(lesson);
    const definitions = {
      CONTINUE_LESSON: {
        title: `Tiếp tục ${lesson.title}`,
        message: 'Hoàn thành bài học tiếp theo trong lộ trình của bạn.',
        events: ['LESSON_COMPLETED'] as const,
        rewardXp: 20,
      },
      PASS_QUIZ: {
        title: `Vượt quiz ${lesson.title}`,
        message: 'Làm quiz của bài và đạt mức điểm yêu cầu.',
        events: ['QUIZ_ATTEMPTED', 'LESSON_COMPLETED'] as const,
        rewardXp: 20,
      },
      REVIEW_LESSON: {
        title: `Ôn lại ${lesson.title}`,
        message: 'Làm lại quiz để củng cố kiến thức đã học.',
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
      title: definitions.title.slice(0, 45),
      message: definitions.message,
      href: `/lessons/${id}`,
      difficulty: 'easy',
      estimatedMinutes: Math.max(5, lesson.estimatedMinutes || 5),
      rewardXp: definitions.rewardXp,
      expectedEventTypes: [...definitions.events],
      metadata: { courseSlug },
    };
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

  private asRoadmapMode(value?: string): RoadmapMode | undefined {
    return value === 'easy' || value === 'medium' || value === 'hard'
      ? value
      : undefined;
  }
}
