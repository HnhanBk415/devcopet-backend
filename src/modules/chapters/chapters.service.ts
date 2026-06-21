import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from './schemas/chapter.schema';
import { CoursesService } from '../courses/courses.service';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  LessonLearningStatus,
  ProgressService,
} from '../progress/progress.service';

type LearningStatus = LessonLearningStatus;
type LeanChapter = Chapter & { _id: Types.ObjectId };
type LeanLesson = Lesson & { _id: Types.ObjectId };

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly coursesService: CoursesService,
    private readonly progressService: ProgressService,
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
    const lessonStatusById = await this.progressService.getLessonStatusByCourse(
      course._id,
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
