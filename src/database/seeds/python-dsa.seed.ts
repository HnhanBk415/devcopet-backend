/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import * as fs from 'fs';
import * as path from 'path';
import { Model } from 'mongoose';

export type SeedMode = 'safe' | 'reset';

export interface SeedOptions {
  mode?: SeedMode;
}

const ARCHIVE_ORDER_START = 100000;

function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function readOptionalText(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function listChapterDirs(basePath: string): string[] {
  try {
    return fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter(
        (dirent) => dirent.isDirectory() && dirent.name.startsWith('chapter-'),
      )
      .map((dirent) => dirent.name)
      .sort();
  } catch {
    return [];
  }
}

function listArenaQuestionFiles(basePath: string): string[] {
  try {
    return fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isFile() &&
          /^arena-questions\.(easy|medium|hard)\.json$/.test(dirent.name),
      )
      .map((dirent) => dirent.name)
      .sort();
  } catch {
    return [];
  }
}

function formatDropZoneLabel(id: string): string {
  return id
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeArenaQuestion(question: any, courseSlug: string): any {
  const normalized = {
    ...question,
    courseSlug,
    isActive: question.isActive ?? true,
  };

  if (normalized.type === 'drag_drop') {
    normalized.dropZones =
      Array.isArray(normalized.dropZones) && normalized.dropZones.length > 0
        ? normalized.dropZones
        : Object.keys(normalized.correctDropZoneMap ?? {}).map((id) => ({
            id,
            label: formatDropZoneLabel(id),
          }));
  }

  return normalized;
}

function assertArenaQuestion(question: any, source: string): void {
  const required = [
    'courseSlug',
    'difficulty',
    'chapterOrder',
    'title',
    'question',
    'type',
    'explanation',
    'conceptTags',
  ];

  for (const field of required) {
    if (
      question[field] === undefined ||
      question[field] === null ||
      question[field] === ''
    ) {
      throw new Error(`[Seed] Arena question missing ${field}: ${source}`);
    }
  }

  if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
    throw new Error(`[Seed] Invalid arena difficulty in ${source}`);
  }

  if (!['multiple_choice', 'drag_drop'].includes(question.type)) {
    throw new Error(`[Seed] Invalid arena question type in ${source}`);
  }

  if (!Array.isArray(question.conceptTags)) {
    throw new Error(`[Seed] conceptTags must be an array in ${source}`);
  }

  if (question.type === 'multiple_choice') {
    const optionIds = new Set(
      (question.options ?? []).map((option: any) => option.id),
    );
    if (!question.correctOptionId || !optionIds.has(question.correctOptionId)) {
      throw new Error(`[Seed] correctOptionId is invalid in ${source}`);
    }
  }

  if (question.type === 'drag_drop') {
    const poolIds = new Set(
      (question.poolItems ?? []).map((item: any) => item.id),
    );
    const map = question.correctDropZoneMap ?? {};
    for (const itemId of Object.values(map)) {
      if (!poolIds.has(itemId)) {
        throw new Error(
          `[Seed] correctDropZoneMap references missing pool item in ${source}`,
        );
      }
    }
  }
}

function makeArenaQuestionKey(question: any): string {
  return [
    question.courseSlug,
    question.difficulty,
    question.chapterOrder,
    question.title,
  ].join('|');
}

function nextArchiveOrder(usedOrders: Set<number>): number {
  let next = ARCHIVE_ORDER_START;
  while (usedOrders.has(next)) next++;
  usedOrders.add(next);
  return next;
}

function getUsedOrders(items: any[]): Set<number> {
  return new Set(
    items
      .map((item) => Number(item.order))
      .filter((order) => Number.isFinite(order) && order > 0),
  );
}

async function archiveChapterOrder(
  ChapterModel: Model<any>,
  chapter: any,
  usedOrders: Set<number>,
): Promise<void> {
  await ChapterModel.findByIdAndUpdate(
    chapter._id,
    {
      $set: {
        order: nextArchiveOrder(usedOrders),
        isPublished: false,
      },
    },
    { runValidators: true },
  );
}

async function archiveLessonOrder(
  LessonModel: Model<any>,
  lesson: any,
  usedOrders: Set<number>,
): Promise<void> {
  await LessonModel.findByIdAndUpdate(
    lesson._id,
    {
      $set: {
        order: nextArchiveOrder(usedOrders),
        isPublished: false,
      },
    },
    { runValidators: true },
  );
}

async function retireLesson(
  LessonModel: Model<any>,
  QuizModel: Model<any> | undefined,
  lesson: any,
  usedLessonOrders: Set<number>,
): Promise<void> {
  if (QuizModel) {
    await QuizModel.updateMany(
      { lessonId: lesson._id },
      { $set: { isPublished: false } },
      { runValidators: true },
    );
  }

  await archiveLessonOrder(LessonModel, lesson, usedLessonOrders);
}

async function retireChapterTree(
  ChapterModel: Model<any>,
  LessonModel: Model<any>,
  QuizModel: Model<any> | undefined,
  chapter: any,
  usedChapterOrders: Set<number>,
): Promise<void> {
  const lessons = await LessonModel.find({ chapterId: chapter._id });
  const usedLessonOrders = getUsedOrders(lessons);

  for (const lesson of lessons) {
    await retireLesson(LessonModel, QuizModel, lesson, usedLessonOrders);
  }

  await archiveChapterOrder(ChapterModel, chapter, usedChapterOrders);
}

async function seedArenaQuestions(
  basePath: string,
  courseSlug: string,
  ArenaQuestionModel: Model<any>,
  mode: SeedMode,
): Promise<void> {
  const files = listArenaQuestionFiles(basePath);
  if (files.length === 0) {
    console.log(`[Seed] No arena question files found for ${courseSlug}`);
    return;
  }

  const questions = files.flatMap((filename) => {
    const filePath = path.join(basePath, filename);
    const data = readJson<any[]>(filePath);
    return data.map((question, index) => {
      const normalized = normalizeArenaQuestion(question, courseSlug);
      assertArenaQuestion(
        normalized,
        `${filename} #${index + 1} ${normalized.title ?? ''}`,
      );
      return normalized;
    });
  });

  if (mode === 'reset') {
    await ArenaQuestionModel.deleteMany({ courseSlug });
    if (questions.length > 0) {
      await ArenaQuestionModel.insertMany(questions, { ordered: true });
    }
  } else {
    const activeKeys = new Set(questions.map(makeArenaQuestionKey));

    for (const question of questions) {
      await ArenaQuestionModel.findOneAndUpdate(
        {
          courseSlug: question.courseSlug,
          difficulty: question.difficulty,
          chapterOrder: question.chapterOrder,
          title: question.title,
        },
        { $set: question },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    const existingQuestions = await ArenaQuestionModel.find({ courseSlug });
    for (const question of existingQuestions) {
      if (!activeKeys.has(makeArenaQuestionKey(question))) {
        await ArenaQuestionModel.findByIdAndUpdate(
          question._id,
          { $set: { isActive: false } },
          { runValidators: true },
        );
      }
    }
  }

  console.log(
    `[Seed] Arena questions seeded for ${courseSlug}: ${questions.length}`,
  );
}

async function prepareSafeChapters(
  ChapterModel: Model<any>,
  LessonModel: Model<any>,
  QuizModel: Model<any> | undefined,
  course: any,
  chapterDataList: any[],
): Promise<void> {
  const existingChapters = await ChapterModel.find({ courseId: course._id });
  const usedChapterOrders = getUsedOrders(existingChapters);
  const desiredBySlug = new Map(
    chapterDataList.map((chapterData) => [chapterData.slug, chapterData]),
  );

  for (const chapter of existingChapters) {
    const desired = desiredBySlug.get(chapter.slug);

    if (!desired) {
      await retireChapterTree(
        ChapterModel,
        LessonModel,
        QuizModel,
        chapter,
        usedChapterOrders,
      );
      console.log(`[Seed] Chapter archived: ${chapter.title}`);
      continue;
    }

    if (chapter.order !== desired.order) {
      await archiveChapterOrder(ChapterModel, chapter, usedChapterOrders);
    }
  }
}

async function prepareSafeLessons(
  LessonModel: Model<any>,
  QuizModel: Model<any> | undefined,
  chapter: any,
  lessonsData: any[],
): Promise<void> {
  const existingLessons = await LessonModel.find({ chapterId: chapter._id });
  const usedLessonOrders = getUsedOrders(existingLessons);
  const desiredBySlug = new Map(
    lessonsData.map((lessonData) => [lessonData.slug, lessonData]),
  );

  for (const lesson of existingLessons) {
    const desired = desiredBySlug.get(lesson.slug);

    if (!desired) {
      await retireLesson(LessonModel, QuizModel, lesson, usedLessonOrders);
      console.log(`[Seed] Lesson archived: ${lesson.title}`);
      continue;
    }

    if (lesson.order !== desired.order) {
      await archiveLessonOrder(LessonModel, lesson, usedLessonOrders);
    }
  }
}

async function seedCourseContent(
  contentFolder: string,
  CourseModel: Model<any>,

  ChapterModel: Model<any>,

  LessonModel: Model<any>,

  QuizModel?: Model<any>,

  ArenaQuestionModel?: Model<any>,

  options: SeedOptions = {},
): Promise<void> {
  const mode = options.mode ?? 'safe';
  const basePath = path.resolve(__dirname, 'content', contentFolder);
  const courseJsonPath = path.join(basePath, 'course.json');

  if (!fs.existsSync(courseJsonPath)) {
    console.warn(`[Seed] Course content not found at: ${courseJsonPath}`);
    return;
  }

  const courseData = readJson<any>(courseJsonPath);
  const normalizedCourseData = {
    ...courseData,
    isPublished: courseData.isPublished ?? true,
  };

  const course = await CourseModel.findOneAndUpdate(
    { slug: courseData.slug },
    { $set: normalizedCourseData },
    {
      returnDocument: 'after',
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
  console.log(`[Seed] Course upserted: ${courseData.title}`);

  if (mode === 'reset') {
    const oldChapters = await ChapterModel.find(
      { courseId: course._id },
      { _id: 1 },
    );
    const oldChapterIds = oldChapters.map((ch: any) => String(ch._id));

    if (oldChapterIds.length > 0) {
      if (QuizModel) {
        const deletedQuizzes = await QuizModel.deleteMany({
          chapterId: { $in: oldChapterIds },
        });
        console.log(
          `[Seed] Cleaned up ${deletedQuizzes.deletedCount} old quizzes`,
        );
      }
      const deletedLessons = await LessonModel.deleteMany({
        chapterId: { $in: oldChapterIds },
      });
      console.log(
        `[Seed] Cleaned up ${deletedLessons.deletedCount} old lessons`,
      );
      const deletedChapters = await ChapterModel.deleteMany({
        courseId: course._id,
      });
      console.log(
        `[Seed] Cleaned up ${deletedChapters.deletedCount} old chapters`,
      );
    }
  }

  const chapterDirs = listChapterDirs(basePath);
  const chapterInputs = chapterDirs
    .map((chapterDir) => {
      const chapterPath = path.join(basePath, chapterDir);
      const chapterJsonPath = path.join(chapterPath, 'chapter.json');
      const lessonsJsonPath = path.join(chapterPath, 'lessons.json');

      if (!fs.existsSync(chapterJsonPath)) return null;

      return {
        chapterDir,
        chapterPath,
        lessonsJsonPath,
        chapterData: readJson<any>(chapterJsonPath),
      };
    })
    .filter(Boolean) as Array<{
    chapterDir: string;
    chapterPath: string;
    lessonsJsonPath: string;
    chapterData: any;
  }>;

  if (mode === 'safe') {
    await prepareSafeChapters(
      ChapterModel,
      LessonModel,
      QuizModel,
      course,
      chapterInputs.map((input) => input.chapterData),
    );
  }

  let totalCourseChapters = 0;
  let totalCourseLessons = 0;
  let totalCourseEstimatedMinutes = 0;

  for (const input of chapterInputs) {
    const { chapterPath, lessonsJsonPath, chapterData } = input;
    const normalizedChapterData = {
      ...chapterData,
      courseId: course._id,
      isPublished: chapterData.isPublished ?? true,
    };

    const chapter = await ChapterModel.findOneAndUpdate(
      { courseId: course._id, slug: chapterData.slug },
      { $set: normalizedChapterData },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    console.log(`[Seed] Chapter upserted: ${chapterData.title}`);

    const chapterIsPublished = normalizedChapterData.isPublished !== false;
    if (chapterIsPublished) totalCourseChapters++;

    let totalChapterLessons = 0;
    let totalChapterEstimatedMinutes = 0;
    const lessonsData = fs.existsSync(lessonsJsonPath)
      ? readJson<any[]>(lessonsJsonPath)
      : [];

    if (mode === 'safe') {
      await prepareSafeLessons(LessonModel, QuizModel, chapter, lessonsData);
    }

    for (const lessonData of lessonsData) {
      const { filename, quizFile, ...lessonFields } = lessonData;
      const mdPath = path.join(chapterPath, filename);
      let content = '';

      if (!fs.existsSync(mdPath)) {
        console.warn(`[Seed] Markdown content missing for lesson: ${filename}`);
      } else {
        content = readOptionalText(mdPath);
      }

      const normalizedLessonData = {
        ...lessonFields,
        courseId: course._id,
        chapterId: chapter._id,
        content,
        isPublished: lessonFields.isPublished ?? true,
      };

      const lesson = await LessonModel.findOneAndUpdate(
        { chapterId: chapter._id, slug: lessonData.slug },
        { $set: normalizedLessonData },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
      console.log(`[Seed] Lesson upserted: ${lessonData.title}`);

      if (chapterIsPublished && normalizedLessonData.isPublished !== false) {
        totalChapterLessons++;
        totalChapterEstimatedMinutes += lessonData.estimatedMinutes || 0;
      }

      if (quizFile && QuizModel) {
        const quizPath = path.join(chapterPath, quizFile);
        if (fs.existsSync(quizPath)) {
          const quizData = readJson<any>(quizPath);
          await QuizModel.findOneAndUpdate(
            { lessonId: lesson._id },
            {
              $set: {
                ...quizData,
                courseId: course._id,
                chapterId: chapter._id,
                lessonId: lesson._id,
                isPublished: quizData.isPublished ?? true,
              },
            },
            {
              returnDocument: 'after',
              upsert: true,
              runValidators: true,
              setDefaultsOnInsert: true,
            },
          );
          console.log(`[Seed] Quiz upserted: ${quizData.title}`);
        }
      } else if (QuizModel) {
        await QuizModel.updateMany(
          { lessonId: lesson._id },
          { $set: { isPublished: false } },
          { runValidators: true },
        );
      }
    }

    await ChapterModel.findByIdAndUpdate(
      chapter._id,
      {
        totalLessons: totalChapterLessons,
        estimatedMinutes: totalChapterEstimatedMinutes,
      },
      { runValidators: true },
    );

    totalCourseLessons += totalChapterLessons;
    totalCourseEstimatedMinutes += totalChapterEstimatedMinutes;
  }

  await CourseModel.findByIdAndUpdate(
    course._id,
    {
      totalChapters: totalCourseChapters,
      totalLessons: totalCourseLessons,
      estimatedMinutes: totalCourseEstimatedMinutes,
    },
    { runValidators: true },
  );

  console.log(`[Seed] Done updating totals for Course: ${courseData.title}`);

  if (ArenaQuestionModel) {
    await seedArenaQuestions(
      basePath,
      courseData.slug,
      ArenaQuestionModel,
      mode,
    );
  }
}

export async function seedPythonBasic(
  CourseModel: Model<any>,

  ChapterModel: Model<any>,

  LessonModel: Model<any>,

  QuizModel?: Model<any>,

  ArenaQuestionModel?: Model<any>,

  options: SeedOptions = {},
): Promise<void> {
  return seedCourseContent(
    'python-basic',
    CourseModel,
    ChapterModel,
    LessonModel,
    QuizModel,
    ArenaQuestionModel,
    options,
  );
}

export async function seedPythonDsa(
  CourseModel: Model<any>,

  ChapterModel: Model<any>,

  LessonModel: Model<any>,

  QuizModel?: Model<any>,

  ArenaQuestionModel?: Model<any>,

  options: SeedOptions = {},
): Promise<void> {
  return seedCourseContent(
    'python-dsa',
    CourseModel,
    ChapterModel,
    LessonModel,
    QuizModel,
    ArenaQuestionModel,
    options,
  );
}
