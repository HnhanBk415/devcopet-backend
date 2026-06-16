import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';

type EasyRoadmapStatus = 'locked' | 'available' | 'completed';

interface LeanCourse {
  _id: Types.ObjectId;
  slug: string;
  title: string;
}

interface LeanChapter {
  _id: Types.ObjectId;
  slug?: string;
  title: string;
  order: number;
}

interface LeanLesson {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  estimatedMinutes?: number;
  xpReward?: number;
}

@Injectable()
export class RoadmapService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async getEasyRoadmap(courseSlug: string) {
    const course = await this.courseModel
      .findOne({ slug: courseSlug, isPublished: true })
      .lean<LeanCourse>()
      .exec();

    if (!course) {
      throw new NotFoundException(`Course not found: ${courseSlug}`);
    }

    const chapters = await this.chapterModel
      .find({ courseId: course._id, isPublished: true })
      .sort({ order: 1 })
      .lean<LeanChapter[]>()
      .exec();

    const chapterIds = chapters.map((chapter) => chapter._id);
    const lessons = await this.lessonModel
      .find({ chapterId: { $in: chapterIds }, isPublished: true })
      .sort({ order: 1 })
      .lean<LeanLesson[]>()
      .exec();

    const lessonsByChapterId = this.groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );

    let globalLessonIndex = 0;
    const responseChapters = chapters.map((chapter, chapterIndex) => {
      const chapterLessons = lessonsByChapterId.get(String(chapter._id)) || [];
      const chapterLabelOrder = chapterIndex + 1;

      const nodes = chapterLessons.map((lesson) => {
        globalLessonIndex++;
        const lessonId = String(lesson._id);
        const chapterId = String(chapter._id);

        return {
          id: lessonId,
          lessonId,
          chapterId,
          chapterOrder: chapter.order,
          lessonOrder: lesson.order,
          label: `${chapterLabelOrder}.${lesson.order}`,
          title: lesson.title,
          description: lesson.description || '',
          status: this.getTemporaryStatus(globalLessonIndex),
          xp: lesson.xpReward ?? 0,
          duration: lesson.estimatedMinutes ?? 0,
          href: `/lesson/${lessonId}`,
        };
      });

      return {
        id: String(chapter._id),
        slug: chapter.slug,
        title: chapter.title,
        order: chapter.order,
        lessonCount: chapterLessons.length,
        nodeCount: nodes.length,
        nodes,
      };
    });

    const totalLessons = responseChapters.reduce(
      (sum, chapter) => sum + chapter.lessonCount,
      0,
    );

    return {
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
        totalChapters: responseChapters.length,
        totalLessons,
        totalNodes: totalLessons,
      },
      mode: 'easy',
      chapters: responseChapters,
    };
  }

  private groupBy<T>(
    items: T[],
    getKey: (item: T) => string,
  ): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    for (const item of items) {
      const key = getKey(item);
      const group = groups.get(key) || [];
      group.push(item);
      groups.set(key, group);
    }

    return groups;
  }

  private getTemporaryStatus(globalLessonIndex: number): EasyRoadmapStatus {
    return globalLessonIndex === 1 ? 'available' : 'locked';
  }
}
