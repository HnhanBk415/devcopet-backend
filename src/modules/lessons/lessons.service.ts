import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../progress/schemas/lesson-progress.schema';

type LessonStatus = 'locked' | 'available' | 'completed';
type LeanChapter = Chapter & { _id: Types.ObjectId };
type LeanLesson = Lesson & { _id: Types.ObjectId };

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
  ) {}

  async findByChapterId(chapterId: string, userId: string) {
    const chapter = await this.chapterModel
      .findOne({ _id: chapterId, isPublished: true })
      .lean<LeanChapter>()
      .exec();

    if (!chapter) {
      throw new NotFoundException(`Chapter not found: ${chapterId}`);
    }

    const statusByLessonId = await this.getLessonStatusByCourse(
      chapter.courseId,
      userId,
    );
    const lessons = await this.lessonModel
      .find({ chapterId, isPublished: true })
      .sort({ order: 1 })
      .lean<LeanLesson[]>()
      .exec();

    return lessons.map((lesson) =>
      this.toLessonListItem(
        lesson,
        statusByLessonId.get(String(lesson._id)) ?? 'locked',
      ),
    );
  }

  async findById(lessonId: string, userId: string) {
    const lesson = await this.assertLessonUnlockedForUser(lessonId, userId);
    const statusByLessonId = await this.getLessonStatusByCourse(
      lesson.courseId,
      userId,
    );

    return this.toLessonListItem(
      lesson,
      statusByLessonId.get(String(lesson._id)) ?? 'locked',
    );
  }

  async assertLessonUnlockedForUser(lessonId: string, userId: string) {
    const lesson = await this.lessonModel
      .findOne({ _id: lessonId, isPublished: true })
      .lean<LeanLesson>()
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson not found: ${lessonId}`);
    }

    const statusByLessonId = await this.getLessonStatusByCourse(
      lesson.courseId,
      userId,
    );
    const status = statusByLessonId.get(String(lesson._id));

    if (status === 'locked') {
      throw new ForbiddenException(
        'Pass the previous lesson quiz to unlock this lesson.',
      );
    }

    return lesson;
  }

  private async getLessonStatusByCourse(
    courseId: Types.ObjectId,
    userId: string,
  ) {
    const chapters = await this.chapterModel
      .find({ courseId, isPublished: true })
      .sort({ order: 1 })
      .lean<LeanChapter[]>()
      .exec();
    const lessons = await this.lessonModel
      .find({ courseId, isPublished: true })
      .lean<LeanLesson[]>()
      .exec();
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
    const statusByLessonId = new Map<string, LessonStatus>();

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

  private toLessonListItem(lesson: LeanLesson, status: LessonStatus) {
    const locked = status === 'locked';

    return {
      ...lesson,
      id: String(lesson._id),
      status,
      locked,
      canAccess: !locked,
      href: locked ? null : `/lessons/${String(lesson._id)}`,
      stateLabel:
        status === 'completed'
          ? 'MASTERED'
          : status === 'available'
            ? 'IN_PROGRESS'
            : 'LOCKED',
      ...(locked
        ? {
            lockedReason:
              'Pass the previous lesson quiz to unlock this lesson.',
          }
        : {}),
    };
  }
}
