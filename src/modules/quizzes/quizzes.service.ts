import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument, QuestionType } from './schemas/quiz.schema';
import { SubmitQuizAnswerDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<QuizDocument>) {}

  async findByLessonId(lessonId: string) {
    const objectId = new Types.ObjectId(lessonId);
    const quiz = await this.quizModel
      .findOne({ lessonId: objectId, isPublished: true })
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz for lesson ${lessonId} not found`);
    }

    return this.sanitizeQuiz(quiz);
  }

  async submitQuiz(quizId: string, answers: SubmitQuizAnswerDto[]) {
    const objectId = new Types.ObjectId(quizId);
    const quiz = await this.quizModel.findById(objectId).exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz ${quizId} not found`);
    }

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
        q.type === QuestionType.CODE_OUTPUT
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

    return {
      totalQuestions: quiz.questions.length,
      correctCount,
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      results,
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

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
}
