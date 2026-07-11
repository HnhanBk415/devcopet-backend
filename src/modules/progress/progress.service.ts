import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from './schemas/lesson-progress.schema';

export type LessonLearningStatus = 'locked' | 'available' | 'completed';

export type LeanProgressChapter = Chapter & { _id: Types.ObjectId };
export type LeanProgressLesson = Pick<Lesson, 'chapterId' | 'order'> & {
  _id: Types.ObjectId;
};

export type CourseProgressResetResult = {
  totalLessons: number;
  deletedProgressRecords: number;
};

export type CourseProgressSummary = {
  completedLessons: number;
  totalLessons: number;
  percent: number;
};

export type LessonProgressSnapshot = {
  currentLessonId: string;
  currentLessonStatus: LessonLearningStatus;
  nextLessonId: string | null;
  nextLessonStatus: LessonLearningStatus | null;
  isNextLessonUnlocked: boolean;
  completedLessons: number;
  totalLessons: number;
  percent: number;
};

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,
  ) {}

  async getLessonStatusByCourse(
    courseId: Types.ObjectId,
    userId: string,
  ): Promise<Map<string, LessonLearningStatus>> {
    const orderedLessons = await this.getOrderedLessonsByCourse(courseId);
    return this.getLessonStatusByOrderedLessons(userId, orderedLessons);
  }
  async getCourseProgressSummaries(
    courseIds: Types.ObjectId[],
    userId: string,
  ): Promise<Map<string, CourseProgressSummary>> {
    const summaries = new Map<string, CourseProgressSummary>();
    for (const courseId of courseIds) {
      summaries.set(String(courseId), {
        completedLessons: 0,
        totalLessons: 0,
        percent: 0,
      });
    }

    if (courseIds.length === 0 || !Types.ObjectId.isValid(userId)) {
      return summaries;
    }

    const lessons = await this.lessonModel
      .find({ courseId: { $in: courseIds }, isPublished: true })
      .select({ _id: 1, courseId: 1 })
      .lean<Array<{ _id: Types.ObjectId; courseId: Types.ObjectId }>>()
      .exec();
    const lessonIds = lessons.map((lesson) => lesson._id);
    const completedLessonIds =
      lessonIds.length > 0
        ? await this.getCompletedLessonIds(
            new Types.ObjectId(userId),
            lessonIds,
          )
        : new Set<string>();

    for (const lesson of lessons) {
      const courseId = String(lesson.courseId);
      const summary = summaries.get(courseId) ?? {
        completedLessons: 0,
        totalLessons: 0,
        percent: 0,
      };

      summary.totalLessons += 1;
      if (completedLessonIds.has(String(lesson._id))) {
        summary.completedLessons += 1;
      }
      summaries.set(courseId, summary);
    }

    for (const [courseId, summary] of summaries) {
      summaries.set(courseId, {
        ...summary,
        percent:
          summary.totalLessons === 0
            ? 0
            : Math.round(
                (summary.completedLessons / summary.totalLessons) * 100,
              ),
      });
    }

    return summaries;
  }

  async getLessonStatusByOrderedLessons(
    userId: string,
    orderedLessons: LeanProgressLesson[],
  ): Promise<Map<string, LessonLearningStatus>> {
    const completedLessonIds = await this.getCompletedLessonIds(
      userId,
      orderedLessons.map((lesson) => lesson._id),
    );

    return this.calculateSequentialLessonStatuses(
      orderedLessons,
      completedLessonIds,
    );
  }
  async getOrderedLessonsByCourse(
    courseId: Types.ObjectId,
  ): Promise<LeanProgressLesson[]> {
    const chapters = await this.chapterModel
      .find({ courseId, isPublished: true })
      .select({ _id: 1, order: 1 })
      .sort({ order: 1 })
      .lean<LeanProgressChapter[]>()
      .exec();
    const lessons = await this.lessonModel
      .find({ courseId, isPublished: true })
      .select({ _id: 1, chapterId: 1, order: 1 })
      .lean<LeanProgressLesson[]>()
      .exec();
    const lessonsByChapterId = this.groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );

    return chapters.flatMap((chapter) =>
      (lessonsByChapterId.get(String(chapter._id)) ?? []).sort(
        (a, b) => a.order - b.order,
      ),
    );
  }

  async resetCourseLessonProgress(
    courseId: Types.ObjectId,
    userId: string,
  ): Promise<CourseProgressResetResult> {
    const lessons = await this.lessonModel
      .find({ courseId, isPublished: true })
      .select({ _id: 1 })
      .lean<Array<{ _id: Types.ObjectId }>>()
      .exec();
    const lessonIds = lessons.map((lesson) => lesson._id);

    if (lessonIds.length === 0) {
      return {
        totalLessons: 0,
        deletedProgressRecords: 0,
      };
    }

    const result = await this.lessonProgressModel
      .deleteMany({
        userId:
          typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
        lessonId: { $in: lessonIds },
      })
      .exec();

    return {
      totalLessons: lessons.length,
      deletedProgressRecords: result.deletedCount ?? 0,
    };
  }

  async getLessonProgressSnapshot(
    courseId: Types.ObjectId,
    userId: string,
    currentLessonId: string,
  ): Promise<LessonProgressSnapshot> {
    const orderedLessons = await this.getOrderedLessonsByCourse(courseId);
    const completedLessonIds = await this.getCompletedLessonIds(
      userId,
      orderedLessons.map((lesson) => lesson._id),
    );
    const statusByLessonId = this.calculateSequentialLessonStatuses(
      orderedLessons,
      completedLessonIds,
    );
    const currentIndex = orderedLessons.findIndex(
      (lesson) => String(lesson._id) === currentLessonId,
    );
    const nextLesson =
      currentIndex >= 0 ? orderedLessons[currentIndex + 1] : undefined;
    const nextLessonId = nextLesson ? String(nextLesson._id) : null;
    const nextLessonStatus = nextLessonId
      ? (statusByLessonId.get(nextLessonId) ?? 'locked')
      : null;
    const completedLessons = orderedLessons.filter((lesson) =>
      completedLessonIds.has(String(lesson._id)),
    ).length;
    const totalLessons = orderedLessons.length;

    return {
      currentLessonId,
      currentLessonStatus: statusByLessonId.get(currentLessonId) ?? 'locked',
      nextLessonId,
      nextLessonStatus,
      isNextLessonUnlocked:
        nextLessonStatus === 'available' || nextLessonStatus === 'completed',
      completedLessons,
      totalLessons,
      percent:
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100),
    };
  }

  calculateSequentialLessonStatuses(
    orderedLessons: LeanProgressLesson[],
    completedLessonIds: Set<string>,
  ): Map<string, LessonLearningStatus> {
    const statusByLessonId = new Map<string, LessonLearningStatus>();

    for (let index = 0; index < orderedLessons.length; index++) {
      const lesson = orderedLessons[index];
      const lessonId = String(lesson._id);

      if (completedLessonIds.has(lessonId)) {
        statusByLessonId.set(lessonId, 'completed');
        continue;
      }

      const previousLesson = orderedLessons[index - 1];
      const previousCompleted = previousLesson
        ? completedLessonIds.has(String(previousLesson._id))
        : true;

      statusByLessonId.set(
        lessonId,
        previousCompleted ? 'available' : 'locked',
      );
    }

    return statusByLessonId;
  }

  private async getCompletedLessonIds(
    userId: string | Types.ObjectId,
    lessonIds: Types.ObjectId[],
  ): Promise<Set<string>> {
    const progress = await this.lessonProgressModel
      .find({
        userId:
          typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
        lessonId: { $in: lessonIds },
        completed: true,
      })
      .select({ lessonId: 1 })
      .lean<Array<{ lessonId: Types.ObjectId }>>()
      .exec();

    return new Set(progress.map((item) => String(item.lessonId)));
  }

  private groupBy<T>(items: T[], getKey: (item: T) => string) {
    const groups = new Map<string, T[]>();

    for (const item of items) {
      const key = getKey(item);
      const group = groups.get(key) ?? [];
      group.push(item);
      groups.set(key, group);
    }

    return groups;
  }
}
