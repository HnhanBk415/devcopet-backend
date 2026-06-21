import * as dns from 'node:dns';
// Force Google DNS - VNPT DNS does not resolve MongoDB Atlas reliably.
dns.setServers(['8.8.8.8', '8.8.4.4']);

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CourseSchema } from '../../modules/courses/schemas/course.schema';
import { ChapterSchema } from '../../modules/chapters/schemas/chapter.schema';
import { LessonSchema } from '../../modules/lessons/schemas/lesson.schema';
import { QuizSchema } from '../../modules/quizzes/schemas/quiz.schema';
import { ArenaQuestionSchema } from '../../modules/arena/schemas/arena-question.schema';

import {
  seedPythonBasic,
  seedPythonDsa,
  type SeedMode,
} from './python-dsa.seed';

dotenv.config();

function getModel(name: string, schema: mongoose.Schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

function getSeedMode(): SeedMode {
  const mode = process.env.SEED_MODE || 'safe';

  if (mode !== 'safe' && mode !== 'reset') {
    throw new Error('SEED_MODE must be either "safe" or "reset".');
  }

  if (
    mode === 'reset' &&
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_PROD_SEED_RESET !== 'true'
  ) {
    throw new Error(
      'Refusing to run reset seed in production. Set ALLOW_PROD_SEED_RESET=true only after taking a DB backup.',
    );
  }

  return mode;
}

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const mode = getSeedMode();

    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB');
    console.log(`[Seed] Mode: ${mode}`);

    const CourseModel = getModel('Course', CourseSchema);
    const ChapterModel = getModel('Chapter', ChapterSchema);
    const LessonModel = getModel('Lesson', LessonSchema);
    const QuizModel = getModel('Quiz', QuizSchema);
    const ArenaQuestionModel = getModel('ArenaQuestion', ArenaQuestionSchema);

    const seedOptions = { mode };

    await seedPythonBasic(
      CourseModel,
      ChapterModel,
      LessonModel,
      QuizModel,
      ArenaQuestionModel,
      seedOptions,
    );
    await seedPythonDsa(
      CourseModel,
      ChapterModel,
      LessonModel,
      QuizModel,
      ArenaQuestionModel,
      seedOptions,
    );

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
