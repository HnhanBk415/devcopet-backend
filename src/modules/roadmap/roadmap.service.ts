import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';

type EasyRoadmapStatus = 'locked' | 'available' | 'completed';
type ChallengeOptionId = 'A' | 'B' | 'C' | 'D';

const EASY_NODE_DURATION_MINUTES = 1;
const CHALLENGE_OPTION_IDS: ChallengeOptionId[] = ['A', 'B', 'C', 'D'];

interface LeanCourse {
  _id: Types.ObjectId;
  slug: string;
  title: string;
}

interface LeanChapter {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  slug?: string;
  title: string;
  order: number;
}

interface LeanLesson {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  order: number;
  xpReward?: number;
}

interface EasyNodeContext {
  node: {
    id: string;
    lessonId: string;
    chapterId: string;
    label: string;
    title: string;
    status: EasyRoadmapStatus;
  };
  chapter: LeanChapter;
  course: LeanCourse;
  lesson: LeanLesson;
}

interface EasyChallengeData {
  chapterOrder: number;
  lessonOrder: number;
  label: string;
  lessonTitle: string;
  type: 'multiple_choice';
  title: string;
  question: string;
  options: Array<{
    id: ChallengeOptionId;
    text: string;
  }>;
  correctOptionId: ChallengeOptionId;
  explanation: string;
  xp: number;
  estimatedMinutes: number;
}

interface EasyChallengeFile {
  courseSlug: string;
  mode: 'easy';
  challenges: EasyChallengeData[];
}

@Injectable()
export class RoadmapService {
  private readonly easyChallengeCache = new Map<string, EasyChallengeFile>();

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
          duration: EASY_NODE_DURATION_MINUTES,
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

  async getEasyNodeChallenge(nodeId: string) {
    const { node, chapter, course, lesson } =
      await this.getEasyNodeContext(nodeId);
    const challenge = this.findEasyChallenge(course.slug, chapter, lesson);

    return {
      node,
      challenge: this.toPublicChallenge(lesson, challenge),
    };
  }

  async submitEasyNodeChallenge(nodeId: string, selectedOptionId: string) {
    if (!this.isChallengeOptionId(selectedOptionId)) {
      throw new BadRequestException(
        'selectedOptionId must be one of A, B, C, or D.',
      );
    }

    const { chapter, course, lesson } = await this.getEasyNodeContext(nodeId);
    const challenge = this.findEasyChallenge(course.slug, chapter, lesson);
    const correct = selectedOptionId === challenge.correctOptionId;

    if (correct) {
      return {
        correct: true,
        message: 'Correct. Nice work.',
        explanation: challenge.explanation,
      };
    }

    return {
      correct: false,
      message: 'Not quite. Review the explanation and try the lesson again.',
      correctOptionId: challenge.correctOptionId,
      explanation: challenge.explanation,
    };
  }

  private async getEasyNodeContext(nodeId: string): Promise<EasyNodeContext> {
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

    const chapter = await this.chapterModel
      .findOne({ _id: lesson.chapterId, isPublished: true })
      .lean<LeanChapter>()
      .exec();

    if (!chapter) {
      throw new NotFoundException(`Chapter not found for node: ${nodeId}`);
    }

    const course = await this.courseModel
      .findOne({ _id: chapter.courseId, isPublished: true })
      .lean<LeanCourse>()
      .exec();

    if (!course) {
      throw new NotFoundException(`Course not found for node: ${nodeId}`);
    }

    const chapters = await this.chapterModel
      .find({ courseId: chapter.courseId, isPublished: true })
      .sort({ order: 1 })
      .lean<LeanChapter[]>()
      .exec();

    const chapterIndex = chapters.findIndex(
      (item) => String(item._id) === String(chapter._id),
    );
    const chapterLabelOrder = chapterIndex >= 0 ? chapterIndex + 1 : 1;

    const lessons = await this.lessonModel
      .find({
        chapterId: { $in: chapters.map((item) => item._id) },
        isPublished: true,
      })
      .sort({ order: 1 })
      .lean<LeanLesson[]>()
      .exec();

    const globalLessonIndex = this.findGlobalLessonIndex(
      chapters,
      lessons,
      String(lesson._id),
    );

    const lessonId = String(lesson._id);
    const chapterId = String(chapter._id);

    return {
      node: {
        id: lessonId,
        lessonId,
        chapterId,
        label: `${chapterLabelOrder}.${lesson.order}`,
        title: lesson.title,
        status: this.getTemporaryStatus(globalLessonIndex),
      },
      chapter,
      course,
      lesson,
    };
  }

  private findEasyChallenge(
    courseSlug: string,
    chapter: LeanChapter,
    lesson: LeanLesson,
  ): EasyChallengeData {
    const challengeFile = this.loadEasyChallengeFile(courseSlug);
    const challenge = challengeFile.challenges.find(
      (item) =>
        item.chapterOrder === chapter.order &&
        item.lessonOrder === lesson.order,
    );

    if (!challenge) {
      throw new NotFoundException(
        `Easy challenge not found for ${courseSlug} ${chapter.order}.${lesson.order}`,
      );
    }

    return challenge;
  }

  private toPublicChallenge(lesson: LeanLesson, challenge: EasyChallengeData) {
    return {
      id: `easy-challenge-${String(lesson._id)}`,
      type: challenge.type,
      title: challenge.title,
      question: challenge.question,
      options: challenge.options,
      xp: challenge.xp,
      estimatedMinutes: challenge.estimatedMinutes,
    };
  }

  private loadEasyChallengeFile(courseSlug: string): EasyChallengeFile {
    const cached = this.easyChallengeCache.get(courseSlug);
    if (cached) return cached;

    const filePath = path.resolve(
      process.cwd(),
      'src',
      'database',
      'seeds',
      'content',
      courseSlug,
      'easy-roadmap-challenges.json',
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `Easy challenge data not found for course: ${courseSlug}`,
      );
    }

    const parsed = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    ) as EasyChallengeFile;

    this.easyChallengeCache.set(courseSlug, parsed);
    return parsed;
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

  private findGlobalLessonIndex(
    chapters: LeanChapter[],
    lessons: LeanLesson[],
    lessonId: string,
  ): number {
    const lessonsByChapterId = this.groupBy(lessons, (lesson) =>
      String(lesson.chapterId),
    );
    let globalLessonIndex = 0;

    for (const chapter of chapters) {
      const chapterLessons = lessonsByChapterId.get(String(chapter._id)) || [];

      for (const lesson of chapterLessons) {
        globalLessonIndex++;
        if (String(lesson._id) === lessonId) {
          return globalLessonIndex;
        }
      }
    }

    return 1;
  }

  private getTemporaryStatus(globalLessonIndex: number): EasyRoadmapStatus {
    if (globalLessonIndex <= 2) return 'completed';
    if (globalLessonIndex <= 6) return 'available';
    return 'locked';
  }

  private isChallengeOptionId(value: string): value is ChallengeOptionId {
    return CHALLENGE_OPTION_IDS.includes(value as ChallengeOptionId);
  }
}
