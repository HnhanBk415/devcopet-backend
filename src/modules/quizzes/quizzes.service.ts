import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument, QuestionType } from './schemas/quiz.schema';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../progress/schemas/lesson-progress.schema';
import { LearningHistoryService } from '../learning-history/learning-history.service';
import { LessonsService } from '../lessons/lessons.service';
import { MissionsService } from '../missions/missions.service';
import { MissionNotificationService } from '../missions/services/mission-notification.service';
import { ProgressService } from '../progress/progress.service';
import { UsersService } from '../users/users.service';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { getLessonRewardXp } from '../users/xp.util';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    private readonly lessonsService: LessonsService,
    private readonly progressService: ProgressService,
    private readonly usersService: UsersService,
    private readonly learningHistoryService: LearningHistoryService,
    private readonly missionsService: MissionsService,
    private readonly notificationService: MissionNotificationService,
  ) {}

  async findByLessonId(lessonId: string, userId: string) {
    const objectId = this.toObjectId(lessonId, 'lessonId');
    const quiz = await this.quizModel
      .findOne({ lessonId: objectId, isPublished: true })
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz for lesson ${lessonId} not found`);
    }

    await this.lessonsService.assertLessonUnlockedForUser(
      String(quiz.lessonId),
      userId,
    );

    return this.sanitizeQuiz(quiz);
  }

  async submitQuiz(quizId: string, body: SubmitQuizDto, userId: string) {
    const answers = body.answers;
    const objectId = this.toObjectId(quizId, 'quizId');
    const quiz = await this.quizModel
      .findOne({ _id: objectId, isPublished: true })
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz ${quizId} not found`);
    }

    const lesson = await this.lessonsService.assertLessonUnlockedForUser(
      String(quiz.lessonId),
      userId,
    );

    let correctCount = 0;
    let earnedPoints = 0;
    let totalPoints = 0;

    const results = quiz.questions.map((q, index) => {
      totalPoints += q.points;

      const submitted = answers.find((a) => a.questionIndex === index);
      let isCorrect = false;

      if (!submitted) {
        return {
          questionIndex: index,
          isCorrect: false,
          selectedOptionIds: [],
          correctOptionIds: q.correctOptionIds,
          correctAnswerText: q.correctAnswerText,
          explanation: q.explanation,
          earnedPoints: 0,
          points: q.points,
        };
      }

      if (
        q.type === QuestionType.MULTIPLE_CHOICE ||
        q.type === QuestionType.TRUE_FALSE ||
        q.type === QuestionType.CODE_OUTPUT ||
        q.type === QuestionType.CODE_REASONING
      ) {
        isCorrect = this.areOptionAnswersEqual(
          submitted.selectedOptionIds ?? [],
          q.correctOptionIds,
        );
      } else if (q.type === QuestionType.FILL_BLANK) {
        const normalized = this.normalizeString(submitted.answerText ?? '');
        if (q.acceptedAnswers && q.acceptedAnswers.length > 0) {
          isCorrect = q.acceptedAnswers
            .map((a) => this.normalizeString(a))
            .includes(normalized);
        } else {
          isCorrect = normalized === this.normalizeString(q.correctAnswerText);
        }
      }

      if (isCorrect) {
        correctCount++;
        earnedPoints += q.points;
      }

      return {
        questionIndex: index,
        isCorrect,
        selectedOptionIds: submitted.selectedOptionIds ?? [],
        correctOptionIds: q.correctOptionIds,
        correctAnswerText: q.correctAnswerText,
        explanation: q.explanation,
        earnedPoints: isCorrect ? q.points : 0,
        points: q.points,
      };
    });

    const percentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;
    const topic = this.topicFromLesson(lesson);
    const submissionId =
      body.submissionId?.trim() || `quiz:${quizId}:${Date.now()}`;

    await this.learningHistoryService.recordAttempt({
      userId,
      submissionId,
      sourceType: 'QUIZ',
      courseSlug: await this.getCourseSlug(quiz.courseId),
      targetType: 'QUIZ',
      targetId: String(quiz._id),
      topic,
      challengeType: 'lesson-quiz',
      passed,
      score: percentage,
      maxScore: 100,
      durationSeconds: body.durationSeconds,
      hintUsed: body.hintUsed,
      primaryMistake: this.resolvePrimaryMistake(results),
      metadata: {
        quizId: String(quiz._id),
        lessonId: String(quiz.lessonId),
        passingScore: quiz.passingScore,
        href: `/lessons/${String(quiz.lessonId)}`,
      },
    });

    const quizEvent = await this.learningHistoryService.recordEvent({
      userId,
      eventType: 'QUIZ_ATTEMPTED',
      idempotencyKey: `quiz-attempt:${userId}:${submissionId}`,
      targetType: 'LESSON',
      targetId: String(quiz.lessonId),
      topic,
      passed,
      score: percentage,
      metadata: { quizId: String(quiz._id) },
    });
    if (quizEvent.created) {
      await this.missionsService.processActivityEvent({
        userId,
        eventType: 'QUIZ_ATTEMPTED',
        idempotencyKey: `quiz-attempt:${userId}:${submissionId}`,
        targetType: 'LESSON',
        targetId: String(quiz.lessonId),
        topic,
        passed,
        score: percentage,
        metadata: { quizId: String(quiz._id) },
      });
    }

    let rewardXp = 0;
    let alreadyCompleted = false;

    if (passed) {
      const existingCompletion = await this.lessonProgressModel
        .findOne({
          userId: new Types.ObjectId(userId),
          lessonId: quiz.lessonId,
          completed: true,
        })
        .select({ _id: 1 })
        .lean()
        .exec();

      alreadyCompleted = Boolean(existingCompletion);

      if (!alreadyCompleted) {
        try {
          const updateResult = await this.lessonProgressModel
            .updateOne(
              {
                userId: new Types.ObjectId(userId),
                lessonId: quiz.lessonId,
                completed: { $ne: true },
              },
              {
                $set: { completed: true, completedAt: new Date() },
                $max: { quizScore: percentage },
              },
              {
                upsert: true,
                setDefaultsOnInsert: true,
              },
            )
            .exec();

          if (
            updateResult.matchedCount === 0 &&
            updateResult.upsertedCount === 0
          ) {
            alreadyCompleted = true;
          }
        } catch (error) {
          if (this.isDuplicateKeyError(error)) {
            alreadyCompleted = true;
          } else {
            throw error;
          }
        }
      }

      if (!alreadyCompleted) {
        const course = await this.courseModel
          .findById(quiz.courseId)
          .select({ slug: 1 })
          .lean<{ slug?: string }>()
          .exec();
        const courseSlug = course?.slug;
        rewardXp = getLessonRewardXp(courseSlug);
        const xpResult = await this.usersService.awardXpWithLevelInfo(
          userId,
          rewardXp,
        );
        await this.createNotificationSafely({
          userId,
          type: 'COURSE_LESSON_COMPLETED',
          title: 'Lesson completed',
          message: `You earned ${rewardXp} XP from this lesson.`,
          metadata: {
            courseSlug,
            lessonId: String(quiz.lessonId),
            xp: rewardXp,
          },
        });
        if (xpResult.leveledUp) {
          await this.createNotificationSafely({
            userId,
            type: 'LEVEL_UP',
            title: 'Level up',
            message: `You reached Level ${xpResult.level}.`,
            metadata: {
              level: xpResult.level,
              lifetimeXp: xpResult.lifetimeXp,
            },
          });
        }

        const lessonEvent = await this.learningHistoryService.recordEvent({
          userId,
          eventType: 'LESSON_COMPLETED',
          idempotencyKey: `lesson-completed:${userId}:${String(quiz.lessonId)}`,
          targetType: 'LESSON',
          targetId: String(quiz.lessonId),
          topic,
          passed: true,
          score: percentage,
          metadata: { quizId: String(quiz._id), rewardXp },
        });
        if (lessonEvent.created) {
          await this.missionsService.processActivityEvent({
            userId,
            eventType: 'LESSON_COMPLETED',
            idempotencyKey: `lesson-completed:${userId}:${String(quiz.lessonId)}`,
            targetType: 'LESSON',
            targetId: String(quiz.lessonId),
            topic,
            passed: true,
            score: percentage,
            metadata: { quizId: String(quiz._id), rewardXp },
          });
        }
      }
    }
    const progress = await this.progressService.getLessonProgressSnapshot(
      lesson.courseId,
      userId,
      String(quiz.lessonId),
    );

    return {
      totalQuestions: quiz.questions.length,
      correctCount,
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      alreadyCompleted,
      rewardSummary: {
        xp: rewardXp,
        lifetimeXpIncreased: rewardXp,
        currentXpIncreased: rewardXp,
      },
      progress,
      results,
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId.`);
    }

    return new Types.ObjectId(value);
  }

  private sanitizeQuiz(quiz: QuizDocument) {
    return {
      _id: quiz._id,
      lessonId: quiz.lessonId,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map((q, index) => ({
        index,
        type: q.type,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        difficulty: q.difficulty,
        points: q.points,
      })),
    };
  }

  private normalizeString(value: string): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }

  private normalizeOptionIds(ids: string[]): string[] {
    return [...(ids ?? [])].sort();
  }

  private areOptionAnswersEqual(a: string[], b: string[]): boolean {
    const sortedA = this.normalizeOptionIds(a);
    const sortedB = this.normalizeOptionIds(b);
    return JSON.stringify(sortedA) === JSON.stringify(sortedB);
  }

  private topicFromLesson(lesson: { slug?: string; title?: string }) {
    return (lesson.slug || lesson.title || 'lesson')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  private async getCourseSlug(courseId: Types.ObjectId) {
    const course = await this.courseModel
      .findById(courseId)
      .select({ slug: 1 })
      .lean<{ slug?: string }>()
      .exec();
    return course?.slug;
  }

  private resolvePrimaryMistake(
    results: Array<{ isCorrect: boolean; questionIndex: number }>,
  ) {
    const firstWrong = results.find((result) => !result.isCorrect);
    return firstWrong ? `question-${firstWrong.questionIndex}` : undefined;
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private async createNotificationSafely(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    missionId?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.notificationService.create(input);
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to create notification: ${error.message}`
          : 'Failed to create notification.',
      );
    }
  }
}
