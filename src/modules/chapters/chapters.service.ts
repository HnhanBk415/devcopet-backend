import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from './schemas/chapter.schema';
import { CoursesService } from '../courses/courses.service';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../progress/schemas/lesson-progress.schema';

type LearningStatus = 'locked' | 'available' | 'completed';
type LeanChapter = Chapter & { _id: Types.ObjectId };
type LeanLesson = Lesson & { _id: Types.ObjectId };

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  async findByCourseId(courseIdOrSlug: string, userId: string) {
    const course = await this.coursesService.findByIdOrSlug(courseIdOrSlug);
    const chapters = await this.chapterModel
      .find({ courseId: course._id, isPublished: true })
      .sort({ order: 1 })
      .lean<LeanChapter[]>()
      .exec();
    const lessons = await this.lessonModel
      .find({ courseId: course._id, isPublished: true })
      .lean<LeanLesson[]>()
      .exec();
    const lessonStatusById = await this.getLessonStatusById(
      chapters,
      lessons,
      userId,
    );
    const lessonsByChapterId = this.groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );

    return chapters.map((chapter) => {
      const chapterLessons = (
        lessonsByChapterId.get(String(chapter._id)) ?? []
      ).sort((a, b) => a.order - b.order);
      const completedLessons = chapterLessons.filter(
        (lesson) => lessonStatusById.get(String(lesson._id)) === 'completed',
      ).length;
      const hasUnlockedLesson = chapterLessons.some((lesson) => {
        const status = lessonStatusById.get(String(lesson._id));
        return status === 'available' || status === 'completed';
      });
      const status: LearningStatus =
        chapterLessons.length > 0 && completedLessons === chapterLessons.length
          ? 'completed'
          : hasUnlockedLesson
            ? 'available'
            : 'locked';

      return {
        ...chapter,
        id: String(chapter._id),
        status,
        locked: status === 'locked',
        canAccess: status !== 'locked',
        href: status === 'locked' ? null : `/chapters/${String(chapter._id)}`,
        stateLabel:
          status === 'completed'
            ? 'MASTERED'
            : status === 'available'
              ? 'IN_PROGRESS'
              : 'LOCKED',
        ...(status === 'locked'
          ? {
              lockedReason:
                'Pass the previous lesson quiz to unlock this chapter.',
            }
          : {}),
        progress: {
          completedLessons,
          totalLessons: chapterLessons.length,
          percent:
            chapterLessons.length === 0
              ? 0
              : Math.round((completedLessons / chapterLessons.length) * 100),
        },
      };
    });
  }

  private async getLessonStatusById(
    chapters: LeanChapter[],
    lessons: LeanLesson[],
    userId: string,
  ) {
    const lessonsByChapterId = this.groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );
    const orderedLessons = chapters.flatMap((chapter) =>
      (lessonsByChapterId.get(String(chapter._id)) ?? []).sort(
        (a, b) => a.order - b.order,
      ),
    );
    const progress = await this.lessonProgressModel
      .find({
        userId: new Types.ObjectId(userId),
        lessonId: { $in: orderedLessons.map((lesson) => lesson._id) },
        completed: true,
      })
      .select({ lessonId: 1 })
      .lean<Array<{ lessonId: Types.ObjectId }>>()
      .exec();
    const completedLessonIds = new Set(
      progress.map((item) => String(item.lessonId)),
    );
    const statusByLessonId = new Map<string, LearningStatus>();

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
