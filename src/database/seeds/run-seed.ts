import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CourseSchema } from '../../modules/courses/schemas/course.schema';
import { ChapterSchema } from '../../modules/chapters/schemas/chapter.schema';
import { LessonSchema } from '../../modules/lessons/schemas/lesson.schema';
import { QuizSchema } from '../../modules/quizzes/schemas/quiz.schema';

import { seedPythonBasic, seedPythonDsa } from './python-dsa.seed';

dotenv.config();

function getModel(name: string, schema: mongoose.Schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB');

    const CourseModel = getModel('Course', CourseSchema);
    const ChapterModel = getModel('Chapter', ChapterSchema);
    const LessonModel = getModel('Lesson', LessonSchema);
    const QuizModel = getModel('Quiz', QuizSchema);

    // Call seed functions
    await seedPythonBasic(CourseModel, ChapterModel, LessonModel, QuizModel);
    await seedPythonDsa(CourseModel, ChapterModel, LessonModel, QuizModel);

    console.log('[Seed] Done');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
