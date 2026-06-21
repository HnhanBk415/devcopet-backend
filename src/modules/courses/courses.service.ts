import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
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
}
