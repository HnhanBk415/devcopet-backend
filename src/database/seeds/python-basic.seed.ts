/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as fs from 'fs';
import * as path from 'path';
import { Model } from 'mongoose';

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
      .map((dirent) => dirent.name);
  } catch {
    return [];
  }
}

export async function seedPythonBasic(
  CourseModel: Model<any>,

  ChapterModel: Model<any>,

  LessonModel: Model<any>,

  QuizModel?: Model<any>,
): Promise<void> {
  const basePath = path.resolve(__dirname, 'content', 'python-basic');
  const courseJsonPath = path.join(basePath, 'course.json');

  if (!fs.existsSync(courseJsonPath)) {
    console.warn(`[Seed] Course content not found at: ${courseJsonPath}`);
    return;
  }

  const courseData = readJson<any>(courseJsonPath);

  // Upsert Course
  const course = await CourseModel.findOneAndUpdate(
    { slug: courseData.slug },
    { $set: courseData },
    { new: true, upsert: true },
  );
  console.log(`[Seed] Course upserted: ${courseData.title}`);

  const chapterDirs = listChapterDirs(basePath);
  let totalCourseChapters = 0;
  let totalCourseLessons = 0;
  let totalCourseEstimatedMinutes = 0;

  for (const chapterDir of chapterDirs) {
    const chapterPath = path.join(basePath, chapterDir);
    const chapterJsonPath = path.join(chapterPath, 'chapter.json');
    const lessonsJsonPath = path.join(chapterPath, 'lessons.json');

    if (!fs.existsSync(chapterJsonPath)) continue;

    const chapterData = readJson<any>(chapterJsonPath);

    // Upsert Chapter
    const chapter = await ChapterModel.findOneAndUpdate(
      { courseId: course._id, slug: chapterData.slug },
      { $set: { ...chapterData, courseId: course._id } },
      { new: true, upsert: true },
    );
    console.log(`[Seed] Chapter upserted: ${chapterData.title}`);
    totalCourseChapters++;

    let totalChapterLessons = 0;
    let totalChapterEstimatedMinutes = 0;

    if (fs.existsSync(lessonsJsonPath)) {
      const lessonsData = readJson<any[]>(lessonsJsonPath);

      for (const lessonData of lessonsData) {
        const { filename, quizFile, ...lessonFields } = lessonData;
        const mdPath = path.join(chapterPath, filename);
        let content = '';

        if (!fs.existsSync(mdPath)) {
          console.warn(
            `[Seed] Markdown content missing for lesson: ${filename}`,
          );
        } else {
          content = readOptionalText(mdPath);
        }

        const lesson = await LessonModel.findOneAndUpdate(
          { chapterId: chapter._id, slug: lessonData.slug },
          {
            $set: {
              ...lessonFields,
              courseId: course._id,
              chapterId: chapter._id,
              content,
            },
          },
          { new: true, upsert: true },
        );
        console.log(`[Seed] Lesson upserted: ${lessonData.title}`);

        totalChapterLessons++;
        totalChapterEstimatedMinutes += lessonData.estimatedMinutes || 0;

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
                },
              },
              { new: true, upsert: true },
            );
            console.log(`[Seed] Quiz upserted: ${quizData.title}`);
          }
        }
      }
    }

    // Update chapter totals
    await ChapterModel.findByIdAndUpdate(chapter._id, {
      totalLessons: totalChapterLessons,
      estimatedMinutes: totalChapterEstimatedMinutes,
    });

    totalCourseLessons += totalChapterLessons;
    totalCourseEstimatedMinutes += totalChapterEstimatedMinutes;
  }

  // Update course totals
  await CourseModel.findByIdAndUpdate(course._id, {
    totalChapters: totalCourseChapters,
    totalLessons: totalCourseLessons,
    estimatedMinutes: totalCourseEstimatedMinutes,
  });

  console.log(`[Seed] Done updating totals for Course: ${courseData.title}`);
}
