import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import {
  LessonLearningStatus,
  ProgressService,
} from '../progress/progress.service';

type LessonStatus = LessonLearningStatus;
type LeanChapter = Chapter & { _id: Types.ObjectId };
type LeanLesson = Lesson & { _id: Types.ObjectId };

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
    private readonly progressService: ProgressService,
  ) {}

  async findByChapterId(chapterId: string, userId: string) {
    const chapterObjectId = this.toObjectId(chapterId, 'chapterId');
    const chapter = await this.chapterModel
      .findOne({ _id: chapterObjectId, isPublished: true })
      .lean<LeanChapter>()
      .exec();

    if (!chapter) {
      throw new NotFoundException(`Chapter not found: ${chapterId}`);
    }

    const statusByLessonId = await this.progressService.getLessonStatusByCourse(
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
    const orderedLessons = await this.progressService.getOrderedLessonsByCourse(
      lesson.courseId,
    );
    const statusByLessonId = await this.progressService.getLessonStatusByCourse(
      lesson.courseId,
      userId,
    );
    const lessonStatus = statusByLessonId.get(String(lesson._id)) ?? 'locked';
    const currentIndex = orderedLessons.findIndex(
      (item) => String(item._id) === String(lesson._id),
    );
    const nextLesson =
      currentIndex >= 0 ? orderedLessons[currentIndex + 1] : undefined;
    const nextLessonId = nextLesson ? String(nextLesson._id) : null;
    const nextLessonStatus = nextLessonId
      ? (statusByLessonId.get(nextLessonId) ?? 'locked')
      : null;

    return {
      ...this.toLessonListItem(lesson, lessonStatus),
      currentLesson: {
        id: String(lesson._id),
        lessonId: String(lesson._id),
        status: lessonStatus,
      },
      nextLessonId,
      isNextLessonUnlocked:
        nextLessonStatus === 'available' || nextLessonStatus === 'completed',
    };
  }

  async assertLessonUnlockedForUser(lessonId: string, userId: string) {
    const lessonObjectId = this.toObjectId(lessonId, 'lessonId');
    const lesson = await this.lessonModel
      .findOne({ _id: lessonObjectId, isPublished: true })
      .lean<LeanLesson>()
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson not found: ${lessonId}`);
    }

    const statusByLessonId = await this.progressService.getLessonStatusByCourse(
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

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId.`);
    }

    return new Types.ObjectId(value);
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
