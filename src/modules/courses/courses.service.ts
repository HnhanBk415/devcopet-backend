import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async findById(id: string) {
    return this.courseModel.findById(id).exec();
  }
}
