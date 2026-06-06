import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chapter, ChapterDocument } from './schemas/chapter.schema';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
  ) {}

  async findByCourseId(courseId: string) {
    return this.chapterModel
      .find({ courseId, isPublished: true })
      .sort({ order: 1 })
      .exec();
  }
}
