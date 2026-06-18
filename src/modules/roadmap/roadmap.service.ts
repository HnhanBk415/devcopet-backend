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
import type { AiRoadmapContext, RoadmapMode } from '../ai-chat/ai-chat.types';

type EasyRoadmapStatus = 'locked' | 'available' | 'completed';
type ChallengeOptionId = 'A' | 'B' | 'C' | 'D';
type ChallengePromptType = 'code_mcq' | 'concept_mcq';
type MediumChallengeType = 'multiple_choice' | 'drag_drop';

const EASY_NODE_DURATION_MINUTES = 1;
const CHALLENGE_OPTION_IDS: ChallengeOptionId[] = ['A', 'B', 'C', 'D'];
const MEDIUM_NODE_COUNT_PER_CHAPTER = 5;
const ADVANCED_NODE_ID_PATTERN = /^(.+)-(medium|hard)-c(\d+)-n(\d+)$/;

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
  id: string;
  chapterOrder: number;
  lessonOrder: number;
  label: string;
  lessonTitle: string;
  type: 'multiple_choice';
  promptType: ChallengePromptType;
  title: string;
  question: string;
  codeSnippet?: {
    language: 'python';
    code: string;
  };
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

interface MediumBaseChallengeData {
  order: number;
  label: string;
  type: MediumChallengeType;
  title: string;
  question: string;
  codeSnippet?: {
    language: 'python';
    code: string;
  } | null;
  explanation: string;
  xp: number;
  estimatedMinutes: number;
}

interface MediumMultipleChoiceChallengeData extends MediumBaseChallengeData {
  type: 'multiple_choice';
  options: Array<{
    id: ChallengeOptionId;
    text: string;
  }>;
  correctOptionId: ChallengeOptionId;
}

interface MediumDragDropChallengeData extends MediumBaseChallengeData {
  type: 'drag_drop';
  template: string;
  poolItems: Array<{
    id: string;
    text: string;
  }>;
  correctDropZoneMap: Record<string, string>;
}

type MediumChallengeData =
  | MediumMultipleChoiceChallengeData
  | MediumDragDropChallengeData;

interface MediumChapterData {
  chapterOrder: number;
  chapterTitle: string;
  nodes: MediumChallengeData[];
}

interface MediumChallengeFile {
  courseSlug: string;
  mode: 'medium' | 'hard';
  chapters: MediumChapterData[];
}

interface MediumNodeContext {
  node: {
    id: string;
    label: string;
    title: string;
    type: MediumChallengeType;
    status: EasyRoadmapStatus;
  };
  course: LeanCourse;
  chapter?: LeanChapter;
  chapterData: MediumChapterData;
  challenge: MediumChallengeData;
  globalNodeIndex: number;
}

@Injectable()
export class RoadmapService {
  private readonly easyChallengeCache = new Map<string, EasyChallengeFile>();
  private readonly mediumChallengeCache = new Map<
    string,
    MediumChallengeFile
  >();

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

    if (node.status === 'locked') {
      return {
        node,
        challenge: null,
        message: 'This roadmap node is locked.',
      };
    }

    if (node.status === 'completed') {
      return {
        node,
        challenge: this.toPublicChallenge(lesson, challenge),
        review: this.toFallbackReview(challenge, node.id),
      };
    }

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

    const { node, chapter, course, lesson } =
      await this.getEasyNodeContext(nodeId);
    const challenge = this.findEasyChallenge(course.slug, chapter, lesson);

    if (node.status === 'locked') {
      throw new BadRequestException('This roadmap node is locked.');
    }

    if (node.status === 'completed') {
      return {
        message: 'This roadmap node is already completed.',
        review: this.toFallbackReview(challenge, node.id),
      };
    }

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

  async getMediumRoadmap(courseSlug: string) {
    const course = await this.courseModel
      .findOne({ slug: courseSlug, isPublished: true })
      .lean<LeanCourse>()
      .exec();

    if (!course) {
      throw new NotFoundException(`Course not found: ${courseSlug}`);
    }

    const challengeFile = this.loadMediumChallengeFile(course.slug);

    const chapters = await this.chapterModel
      .find({ courseId: course._id, isPublished: true })
      .sort({ order: 1 })
      .lean<LeanChapter[]>()
      .exec();
    const chaptersByOrder = new Map(
      chapters.map((chapter) => [chapter.order, chapter]),
    );

    let globalNodeIndex = 0;
    const responseChapters = challengeFile.chapters.map((chapterData) => {
      const chapter = chaptersByOrder.get(chapterData.chapterOrder);
      const chapterId = chapter ? String(chapter._id) : undefined;

      const nodes = chapterData.nodes.map((challenge) => {
        globalNodeIndex++;

        return {
          id: this.toMediumNodeId(
            course.slug,
            chapterData.chapterOrder,
            challenge.order,
          ),
          ...(chapterId ? { chapterId } : {}),
          chapterOrder: chapterData.chapterOrder,
          order: challenge.order,
          label: challenge.label,
          title: challenge.title,
          type: challenge.type,
          status: this.getTemporaryMediumStatus(globalNodeIndex),
          xp: challenge.xp,
          estimatedMinutes: challenge.estimatedMinutes,
        };
      });

      return {
        id:
          chapterId ??
          `${course.slug}-medium-chapter-${chapterData.chapterOrder}`,
        ...(chapterId ? { chapterId } : {}),
        title: chapter?.title ?? chapterData.chapterTitle,
        order: chapterData.chapterOrder,
        nodeCount: nodes.length,
        nodes,
      };
    });

    const totalNodes = responseChapters.reduce(
      (sum, chapter) => sum + chapter.nodeCount,
      0,
    );

    return {
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
        totalChapters: responseChapters.length,
        totalNodes,
      },
      mode: 'medium',
      chapters: responseChapters,
    };
  }

  async getMediumNodeChallenge(nodeId: string) {
    const { node, challenge } = await this.getMediumNodeContext(nodeId);

    if (node.status === 'locked') {
      return {
        node,
        challenge: null,
        message: 'This roadmap node is locked.',
      };
    }

    if (node.status === 'completed') {
      return {
        node,
        challenge: this.toPublicMediumChallenge(nodeId, challenge),
        review: this.toFallbackMediumReview(challenge, node.id),
      };
    }

    return {
      node,
      challenge: this.toPublicMediumChallenge(nodeId, challenge),
    };
  }

  async submitMediumNodeChallenge(
    nodeId: string,
    payload: Record<string, unknown>,
  ) {
    const { node, challenge } = await this.getMediumNodeContext(nodeId);

    if (node.status === 'locked') {
      throw new BadRequestException('This roadmap node is locked.');
    }

    if (payload?.type !== challenge.type) {
      throw new BadRequestException(
        `type must match the node challenge type: ${challenge.type}.`,
      );
    }

    if (challenge.type === 'multiple_choice') {
      const selectedOptionId = payload.selectedOptionId;
      if (
        typeof selectedOptionId !== 'string' ||
        !this.isChallengeOptionId(selectedOptionId)
      ) {
        throw new BadRequestException(
          'selectedOptionId must be one of A, B, C, or D.',
        );
      }

      const correct = selectedOptionId === challenge.correctOptionId;

      return {
        correct,
        message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
        correctOptionId: challenge.correctOptionId,
        explanation: challenge.explanation,
      };
    }

    const dropZoneMap = payload.dropZoneMap;
    if (!this.isStringRecord(dropZoneMap)) {
      throw new BadRequestException('dropZoneMap must be an object.');
    }

    const correct = this.isSameStringRecord(
      dropZoneMap,
      challenge.correctDropZoneMap,
    );

    return {
      correct,
      message: correct ? 'Correct. Nice work.' : 'Not quite. Try again.',
      correctDropZoneMap: challenge.correctDropZoneMap,
      explanation: challenge.explanation,
    };
  }

  async getAiRoadmapContext(
    mode: RoadmapMode,
    nodeId: string,
  ): Promise<AiRoadmapContext> {
    if (mode === 'easy') {
      const { node, chapter, course, lesson } =
        await this.getEasyNodeContext(nodeId);
      const challenge = this.findEasyChallenge(course.slug, chapter, lesson);

      return {
        mode,
        course: {
          id: String(course._id),
          slug: course.slug,
          title: course.title,
        },
        chapter: {
          id: String(chapter._id),
          title: chapter.title,
          order: chapter.order,
        },
        node,
        relatedLesson: {
          id: String(lesson._id),
          title: lesson.title,
          description: lesson.description || '',
          href: `/lesson/${String(lesson._id)}`,
        },
        challenge: this.toPublicChallenge(lesson, challenge),
        ...(node.status === 'completed'
          ? { review: this.toFallbackReview(challenge, node.id) }
          : {}),
      };
    }

    const { node, course, chapter, chapterData, challenge } =
      await this.getAdvancedNodeContext(mode, nodeId);

    return {
      mode,
      course: {
        id: String(course._id),
        slug: course.slug,
        title: course.title,
      },
      chapter: {
        ...(chapter ? { id: String(chapter._id) } : {}),
        title: chapter?.title ?? chapterData.chapterTitle,
        order: chapterData.chapterOrder,
      },
      node,
      challenge: this.toPublicMediumChallenge(nodeId, challenge),
      ...(node.status === 'completed'
        ? { review: this.toFallbackMediumReview(challenge, node.id) }
        : {}),
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
      promptType: challenge.promptType,
      title: challenge.title,
      question: challenge.question,
      ...(challenge.codeSnippet ? { codeSnippet: challenge.codeSnippet } : {}),
      options: challenge.options,
      xp: challenge.xp,
      estimatedMinutes: challenge.estimatedMinutes,
    };
  }

  private toFallbackReview(
    challenge: EasyChallengeData,
    nodeId: string,
  ): {
    selectedOptionId: ChallengeOptionId;
    correctOptionId: ChallengeOptionId;
    correct: boolean;
    explanation: string;
    completedAt: string;
  } {
    const selectedOptionId = challenge.correctOptionId;

    return {
      selectedOptionId,
      correctOptionId: challenge.correctOptionId,
      correct: selectedOptionId === challenge.correctOptionId,
      explanation: challenge.explanation,
      completedAt: this.toDeterministicCompletedAt(nodeId),
    };
  }

  private toDeterministicCompletedAt(nodeId: string): string {
    const timestamp = Number.parseInt(nodeId.slice(-8), 16);
    const completedAt = new Date(Date.UTC(2026, 0, 1));
    completedAt.setSeconds(Number.isNaN(timestamp) ? 0 : timestamp % 86400);

    return completedAt.toISOString();
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

  private async getMediumNodeContext(
    nodeId: string,
  ): Promise<MediumNodeContext> {
    return this.getAdvancedNodeContext('medium', nodeId);
  }

  private async getAdvancedNodeContext(
    mode: 'medium' | 'hard',
    nodeId: string,
  ): Promise<MediumNodeContext> {
    const parsedNodeId = this.parseAdvancedNodeId(mode, nodeId);
    const course = await this.courseModel
      .findOne({ slug: parsedNodeId.courseSlug, isPublished: true })
      .lean<LeanCourse>()
      .exec();

    if (!course) {
      throw new NotFoundException(
        `Course not found: ${parsedNodeId.courseSlug}`,
      );
    }

    const challengeFile = this.loadAdvancedChallengeFile(mode, course.slug);
    const chapterData = challengeFile.chapters.find(
      (chapter) => chapter.chapterOrder === parsedNodeId.chapterOrder,
    );

    if (!chapterData) {
      throw new NotFoundException(
        `${this.capitalizeMode(mode)} roadmap node not found: ${nodeId}`,
      );
    }

    const challenge = chapterData.nodes.find(
      (node) => node.order === parsedNodeId.nodeOrder,
    );

    if (!challenge) {
      throw new NotFoundException(
        `${this.capitalizeMode(mode)} roadmap node not found: ${nodeId}`,
      );
    }

    const chapter = await this.chapterModel
      .findOne({
        courseId: course._id,
        order: chapterData.chapterOrder,
        isPublished: true,
      })
      .lean<LeanChapter>()
      .exec();
    const globalNodeIndex = this.findMediumGlobalNodeIndex(
      challengeFile,
      chapterData.chapterOrder,
      challenge.order,
    );

    return {
      node: {
        id: nodeId,
        label: challenge.label,
        title: challenge.title,
        type: challenge.type,
        status: this.getTemporaryMediumStatus(globalNodeIndex),
      },
      course,
      ...(chapter ? { chapter } : {}),
      chapterData,
      challenge,
      globalNodeIndex,
    };
  }

  private parseAdvancedNodeId(
    expectedMode: 'medium' | 'hard',
    nodeId: string,
  ): {
    courseSlug: string;
    mode: 'medium' | 'hard';
    chapterOrder: number;
    nodeOrder: number;
  } {
    const match = ADVANCED_NODE_ID_PATTERN.exec(nodeId);

    if (!match || match[2] !== expectedMode) {
      throw new NotFoundException(
        `${this.capitalizeMode(expectedMode)} roadmap node not found: ${nodeId}`,
      );
    }

    return {
      courseSlug: match[1],
      mode: match[2],
      chapterOrder: Number(match[3]),
      nodeOrder: Number(match[4]),
    };
  }

  private loadMediumChallengeFile(courseSlug: string): MediumChallengeFile {
    return this.loadAdvancedChallengeFile('medium', courseSlug);
  }

  private loadAdvancedChallengeFile(
    mode: 'medium' | 'hard',
    courseSlug: string,
  ): MediumChallengeFile {
    const cacheKey = `${mode}:${courseSlug}`;
    const cached = this.mediumChallengeCache.get(cacheKey);
    if (cached) return cached;

    const filePath = path.resolve(
      process.cwd(),
      'src',
      'database',
      'seeds',
      'content',
      courseSlug,
      `${mode}-roadmap-challenges.json`,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `${this.capitalizeMode(mode)} challenge data not found for course: ${courseSlug}`,
      );
    }

    const parsed = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    ) as MediumChallengeFile;

    this.assertValidAdvancedChallengeFile(parsed, courseSlug, mode);
    this.mediumChallengeCache.set(cacheKey, parsed);
    return parsed;
  }

  private assertValidMediumChallengeFile(
    challengeFile: MediumChallengeFile,
    courseSlug: string,
  ) {
    this.assertValidAdvancedChallengeFile(challengeFile, courseSlug, 'medium');
  }

  private assertValidAdvancedChallengeFile(
    challengeFile: MediumChallengeFile,
    courseSlug: string,
    mode: 'medium' | 'hard',
  ) {
    if (
      challengeFile.courseSlug !== courseSlug ||
      challengeFile.mode !== mode
    ) {
      throw new BadRequestException(
        `Invalid ${this.capitalizeMode(mode)} challenge data for course: ${courseSlug}`,
      );
    }

    for (const chapter of challengeFile.chapters) {
      if (chapter.nodes.length !== MEDIUM_NODE_COUNT_PER_CHAPTER) {
        throw new BadRequestException(
          `${this.capitalizeMode(mode)} chapter ${chapter.chapterOrder} must contain exactly ${MEDIUM_NODE_COUNT_PER_CHAPTER} nodes.`,
        );
      }

      for (const node of chapter.nodes) {
        if (node.type !== 'multiple_choice' && node.type !== 'drag_drop') {
          throw new BadRequestException(
            `Unsupported ${this.capitalizeMode(mode)} node type in chapter ${chapter.chapterOrder}.`,
          );
        }
      }
    }
  }

  private toMediumNodeId(
    courseSlug: string,
    chapterOrder: number,
    nodeOrder: number,
  ): string {
    return `${courseSlug}-medium-c${chapterOrder}-n${nodeOrder}`;
  }

  private capitalizeMode(mode: 'medium' | 'hard'): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  private toPublicMediumChallenge(
    nodeId: string,
    challenge: MediumChallengeData,
  ) {
    const baseChallenge = {
      id: `medium-challenge-${nodeId}`,
      type: challenge.type,
      title: challenge.title,
      question: challenge.question,
      codeSnippet: challenge.codeSnippet ?? null,
      xp: challenge.xp,
      estimatedMinutes: challenge.estimatedMinutes,
    };

    if (challenge.type === 'multiple_choice') {
      return {
        ...baseChallenge,
        type: challenge.type,
        options: challenge.options,
      };
    }

    return {
      ...baseChallenge,
      type: challenge.type,
      template: challenge.template,
      poolItems: challenge.poolItems,
    };
  }

  private toFallbackMediumReview(
    challenge: MediumChallengeData,
    nodeId: string,
  ) {
    if (challenge.type === 'multiple_choice') {
      return {
        selectedOptionId: challenge.correctOptionId,
        correctOptionId: challenge.correctOptionId,
        correct: true,
        explanation: challenge.explanation,
        completedAt: this.toDeterministicCompletedAt(nodeId),
      };
    }

    return {
      dropZoneMap: challenge.correctDropZoneMap,
      correctDropZoneMap: challenge.correctDropZoneMap,
      correct: true,
      explanation: challenge.explanation,
      completedAt: this.toDeterministicCompletedAt(nodeId),
    };
  }

  private findMediumGlobalNodeIndex(
    challengeFile: MediumChallengeFile,
    chapterOrder: number,
    nodeOrder: number,
  ): number {
    let globalNodeIndex = 0;

    for (const chapter of challengeFile.chapters) {
      for (const node of chapter.nodes) {
        globalNodeIndex++;
        if (chapter.chapterOrder === chapterOrder && node.order === nodeOrder) {
          return globalNodeIndex;
        }
      }
    }

    return 1;
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

  private getTemporaryMediumStatus(globalNodeIndex: number): EasyRoadmapStatus {
    if (globalNodeIndex <= 1) return 'completed';
    if (globalNodeIndex <= 5) return 'available';
    return 'locked';
  }

  private isChallengeOptionId(value: string): value is ChallengeOptionId {
    return CHALLENGE_OPTION_IDS.includes(value as ChallengeOptionId);
  }

  private isStringRecord(value: unknown): value is Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    return Object.values(value).every((item) => typeof item === 'string');
  }

  private isSameStringRecord(
    received: Record<string, string>,
    expected: Record<string, string>,
  ): boolean {
    const expectedKeys = Object.keys(expected);

    if (Object.keys(received).length !== expectedKeys.length) {
      return false;
    }

    return expectedKeys.every((key) => received[key] === expected[key]);
  }
}
