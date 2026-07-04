import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Chapter,
  ChapterDocument,
} from '../../chapters/schemas/chapter.schema';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';
import { Lesson, LessonDocument } from '../../lessons/schemas/lesson.schema';
import type { LeanChapter, LeanCourse, LeanLesson } from '../roadmap.types';

@Injectable()
export class RoadmapQueryService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async findCourseBySlugOrThrow(courseSlug: string): Promise<LeanCourse> {
    const course = await this.courseModel
      .findOne({ slug: courseSlug, isPublished: true })
      .lean<LeanCourse>()
      .exec();

    if (!course) {
      throw new NotFoundException(`Course not found: ${courseSlug}`);
    }

    return course;
  }

  async findCourseByIdOrThrow(courseId: Types.ObjectId, nodeId: string) {
    const course = await this.courseModel
      .findOne({ _id: courseId, isPublished: true })
      .lean<LeanCourse>()
      .exec();

    if (!course) {
      throw new NotFoundException(`Course not found for node: ${nodeId}`);
    }

    return course;
  }

  async findPublishedChapters(courseId: Types.ObjectId) {
    return this.chapterModel
      .find({ courseId, isPublished: true })
      .select({ _id: 1, courseId: 1, slug: 1, title: 1, order: 1 })
      .sort({ order: 1 })
      .lean<LeanChapter[]>()
      .exec();
  }

  async findPublishedLessons(chapterIds: Types.ObjectId[]) {
    return this.lessonModel
      .find({ chapterId: { $in: chapterIds }, isPublished: true })
      .select({
        _id: 1,
        courseId: 1,
        chapterId: 1,
        slug: 1,
        title: 1,
        description: 1,
        order: 1,
      })
      .sort({ order: 1 })
      .lean<LeanLesson[]>()
      .exec();
  }

  async findEasyLessonOrThrow(nodeId: string) {
    if (!Types.ObjectId.isValid(nodeId)) {
      throw new NotFoundException(`Easy roadmap node not found: ${nodeId}`);
    }

    const lesson = await this.lessonModel
      .findOne({ _id: nodeId, isPublished: true })
      .lean<LeanLesson>()
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Easy roadmap node not found: ${nodeId}`);
    }

    return lesson;
  }

  async findChapterByIdOrThrow(chapterId: Types.ObjectId, nodeId: string) {
    const chapter = await this.chapterModel
      .findOne({ _id: chapterId, isPublished: true })
      .lean<LeanChapter>()
      .exec();

    if (!chapter) {
      throw new NotFoundException(`Chapter not found for node: ${nodeId}`);
    }

    return chapter;
  }

  async findChapterByCourseAndOrder(courseId: Types.ObjectId, order: number) {
    return this.chapterModel
      .findOne({
        courseId,
        order,
        isPublished: true,
      })
      .lean<LeanChapter>()
      .exec();
  }
}
