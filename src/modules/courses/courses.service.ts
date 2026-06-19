import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
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
}
