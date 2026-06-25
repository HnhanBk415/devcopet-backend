import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { ProgressService } from '../progress/progress.service';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly progressService: ProgressService,
  ) {}

  async findAll() {
    return this.courseModel
      .find({ isPublished: true })
      .sort({ order: 1 })
      .exec();
  }

  async findByIdOrSlug(courseIdOrSlug: string) {
    const query = Types.ObjectId.isValid(courseIdOrSlug)
      ? { _id: courseIdOrSlug, isPublished: true }
      : { slug: courseIdOrSlug, isPublished: true };
    const course = await this.courseModel.findOne(query).exec();

    if (!course) {
      throw new NotFoundException(`Course not found: ${courseIdOrSlug}`);
    }

    return course;
  }

  async resetProgress(courseIdOrSlug: string, userId: string) {
    const course = await this.findByIdOrSlug(courseIdOrSlug);
    const progressReset = await this.progressService.resetCourseLessonProgress(
      course._id,
      userId,
    );

    return {
      success: true,
      message: 'Course progress reset.',
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
      },
      progress: {
        completedLessons: 0,
        totalLessons: progressReset.totalLessons,
        percent: 0,
        deletedProgressRecords: progressReset.deletedProgressRecords,
      },
    };
  }

  async getCourseDetailAggregated(courseIdOrSlug: string, userId: string) {
    const course = await this.findByIdOrSlug(courseIdOrSlug);

    const [chapters, lessons] = await Promise.all([
      this.chapterModel
        .find({ courseId: course._id, isPublished: true })
        .sort({ order: 1 })
        .lean<{ _id: Types.ObjectId; title: string; order: number }[]>()
        .exec(),
      this.lessonModel
        .find({ courseId: course._id, isPublished: true })
        .sort({ order: 1 })
        .lean<
          {
            _id: Types.ObjectId;
            chapterId: Types.ObjectId;
            title: string;
            description: string;
            order: number;
          }[]
        >()
        .exec(),
    ]);

    const statusByLessonId = await this.progressService.getLessonStatusByCourse(
      course._id,
      userId,
    );

    const lessonsByChapterId = new Map<
      string,
      Array<{
        id: string;
        title: string;
        description: string;
        order: number;
        status: string;
        canAccess: boolean;
      }>
    >();
    for (const lesson of lessons) {
      const chapterIdStr = String(lesson.chapterId);
      if (!lessonsByChapterId.has(chapterIdStr)) {
        lessonsByChapterId.set(chapterIdStr, []);
      }

      const status = statusByLessonId.get(String(lesson._id)) ?? 'locked';
      lessonsByChapterId.get(chapterIdStr).push({
        id: String(lesson._id),
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        status,
        canAccess: status !== 'locked',
      });
    }

    let courseCompletedLessons = 0;
    const chaptersResponse = chapters.map((chapter) => {
      const chapterLessons = lessonsByChapterId.get(String(chapter._id)) || [];
      const completedLessons = chapterLessons.filter(
        (l) => l.status === 'completed',
      ).length;
      courseCompletedLessons += completedLessons;

      const hasUnlockedLesson = chapterLessons.some(
        (l) => l.status === 'available' || l.status === 'completed',
      );

      const status =
        chapterLessons.length > 0 && completedLessons === chapterLessons.length
          ? 'completed'
          : hasUnlockedLesson
            ? 'available'
            : 'locked';

      return {
        id: String(chapter._id),
        title: chapter.title,
        order: chapter.order,
        status,
        progress: {
          completedLessons,
          totalLessons: chapterLessons.length,
          percent:
            chapterLessons.length === 0
              ? 0
              : Math.round((completedLessons / chapterLessons.length) * 100),
        },
        lessons: chapterLessons,
      };
    });

    const totalLessons = lessons.length;

    return {
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        programmingLanguage: course.programmingLanguage,
        totalChapters: chapters.length,
        totalLessons,
        progress: {
          completedLessons: courseCompletedLessons,
          totalLessons,
          percent:
            totalLessons === 0
              ? 0
              : Math.round((courseCompletedLessons / totalLessons) * 100),
        },
      },
      chapters: chaptersResponse,
    };
  }
}
