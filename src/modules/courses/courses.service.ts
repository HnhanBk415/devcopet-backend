import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../progress/schemas/lesson-progress.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
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
    const lessons = await this.lessonModel
      .find({ courseId: course._id, isPublished: true })
      .select({ _id: 1 })
      .lean<Array<{ _id: Types.ObjectId }>>()
      .exec();
    const lessonIds = lessons.map((lesson) => lesson._id);

    const result =
      lessonIds.length > 0
        ? await this.lessonProgressModel
            .deleteMany({
              userId: new Types.ObjectId(userId),
              lessonId: { $in: lessonIds },
            })
            .exec()
        : { deletedCount: 0 };

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
        totalLessons: lessons.length,
        percent: 0,
        deletedProgressRecords: result.deletedCount ?? 0,
      },
    };
  }
}
