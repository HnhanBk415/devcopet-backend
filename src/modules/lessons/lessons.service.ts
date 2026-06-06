import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  async findByChapterId(chapterId: string) {
    return this.lessonModel
      .find({ chapterId, isPublished: true })
      .sort({ order: 1 })
      .exec();
  }

  async findById(lessonId: string) {
    return this.lessonModel.findById(lessonId).exec();
  }
}
