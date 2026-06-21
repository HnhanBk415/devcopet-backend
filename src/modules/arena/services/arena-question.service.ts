import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import {
  ARENA_DIFFICULTY_ORDER,
  ARENA_QUESTION_MIX,
  ARENA_QUESTION_TIME,
  ARENA_TOTAL_QUESTIONS,
} from '../constants/arena.constants';
import {
  ArenaDifficulty,
  ArenaRank,
  ArenaRuntimeQuestion,
  PublicArenaQuestion,
} from '../types/arena.types';
import {
  ArenaQuestion,
  ArenaQuestionDocument,
} from '../schemas/arena-question.schema';

@Injectable()
export class ArenaQuestionService {
  constructor(
    @InjectModel(ArenaQuestion.name)
    private readonly arenaQuestionModel: Model<ArenaQuestionDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  getQuestionMix(rank: ArenaRank) {
    return { ...ARENA_QUESTION_MIX[rank] };
  }

  async selectQuestions(input: {
    courseSlug: string;
    matchTier: ArenaRank;
    userIds: string[];
  }): Promise<ArenaRuntimeQuestion[]> {
    const courseSlug = input.courseSlug.toLowerCase().trim();
    const allQuestions = await this.arenaQuestionModel
      .find({ courseSlug, isActive: true })
      .lean()
      .exec();

    if (allQuestions.length < ARENA_TOTAL_QUESTIONS) {
      throw new BadRequestException('Not enough active arena questions.');
    }

    const recentIds = await this.getRecentQuestionIds(input.userIds);
    const selected: ArenaRuntimeQuestion[] = [];
    const selectedIds = new Set<string>();
    const mix = ARENA_QUESTION_MIX[input.matchTier];

    for (const difficulty of this.difficultiesInOrder()) {
      const needed = mix[difficulty];
      if (needed <= 0) continue;

      this.pickIntoSelection({
        pool: allQuestions.filter(
          (question) =>
            question.difficulty === difficulty &&
            !recentIds.has(String(question._id)),
        ),
        needed,
        selected,
        selectedIds,
      });

      if (this.countDifficulty(selected, difficulty) < needed) {
        this.pickIntoSelection({
          pool: allQuestions.filter(
            (question) => question.difficulty === difficulty,
          ),
          needed: needed - this.countDifficulty(selected, difficulty),
          selected,
          selectedIds,
        });
      }

      if (this.countDifficulty(selected, difficulty) < needed) {
        this.pickIntoSelection({
          pool: this.closestDifficultyPool(allQuestions, difficulty),
          needed: needed - this.countDifficulty(selected, difficulty),
          selected,
          selectedIds,
        });
      }
    }

    if (selected.length < ARENA_TOTAL_QUESTIONS) {
      this.pickIntoSelection({
        pool: allQuestions,
        needed: ARENA_TOTAL_QUESTIONS - selected.length,
        selected,
        selectedIds,
      });
    }

    if (selected.length < ARENA_TOTAL_QUESTIONS) {
      throw new BadRequestException(
        'Not enough unique active arena questions.',
      );
    }

    return this.orderQuestions(selected.slice(0, ARENA_TOTAL_QUESTIONS));
  }

  toPublicQuestion(
    question: ArenaRuntimeQuestion,
    timeLimitSeconds = ARENA_QUESTION_TIME[question.difficulty],
  ): PublicArenaQuestion {
    return {
      id: question.id,
      type: question.type,
      title: question.title,
      question: question.question,
      codeSnippet: question.codeSnippet ?? null,
      template: question.template,
      options: question.options ?? [],
      poolItems: question.poolItems ?? [],
      dropZones: this.getPublicDropZones(question),
      difficulty: question.difficulty,
      timeLimitSeconds,
      chapterOrder: question.chapterOrder,
      conceptTags: question.conceptTags ?? [],
    };
  }

  private async getRecentQuestionIds(userIds: string[]) {
    const validIds = userIds.filter((id) => Types.ObjectId.isValid(id));
    if (validIds.length === 0) return new Set<string>();

    const users = await this.userModel
      .find({ _id: { $in: validIds } })
      .select({ recentArenaQuestionIds: 1 })
      .lean()
      .exec();

    return new Set(
      users.flatMap((user) =>
        (user.recentArenaQuestionIds ?? []).map((id) => String(id)),
      ),
    );
  }

  private pickIntoSelection(input: {
    pool: ArenaQuestion[];
    needed: number;
    selected: ArenaRuntimeQuestion[];
    selectedIds: Set<string>;
  }) {
    const shuffled = this.shuffle(input.pool).sort((a, b) => {
      const chapterPenalty =
        this.chapterCount(input.selected, a.chapterOrder) -
        this.chapterCount(input.selected, b.chapterOrder);
      if (chapterPenalty !== 0) return chapterPenalty;
      return (
        this.typeCount(input.selected, a.type) -
        this.typeCount(input.selected, b.type)
      );
    });

    for (const question of shuffled) {
      if (input.selected.length >= ARENA_TOTAL_QUESTIONS) return;
      if (input.needed <= 0) return;

      const id = String(
        (question as ArenaQuestion & { _id: Types.ObjectId })._id,
      );
      if (input.selectedIds.has(id)) continue;

      input.selected.push(this.toRuntimeQuestion(question));
      input.selectedIds.add(id);
      input.needed -= 1;
    }
  }

  private toRuntimeQuestion(question: ArenaQuestion): ArenaRuntimeQuestion {
    const id = String(
      (question as ArenaQuestion & { _id: Types.ObjectId })._id,
    );
    return {
      id,
      objectId: new Types.ObjectId(id),
      courseSlug: question.courseSlug,
      difficulty: question.difficulty,
      chapterOrder: question.chapterOrder,
      chapterTitle: question.chapterTitle,
      lessonSlug: question.lessonSlug,
      lessonTitle: question.lessonTitle,
      title: question.title,
      question: question.question,
      type: question.type,
      codeSnippet: question.codeSnippet ?? null,
      template: question.template,
      options: question.options ?? [],
      correctOptionId: question.correctOptionId,
      poolItems: question.poolItems ?? [],
      dropZones: question.dropZones ?? [],
      correctDropZoneMap: question.correctDropZoneMap,
      explanation: question.explanation,
      conceptTags: question.conceptTags ?? [],
      estimatedSeconds: question.estimatedSeconds,
      baseScore: question.baseScore,
      isActive: question.isActive,
    };
  }

  private getPublicDropZones(question: ArenaRuntimeQuestion) {
    if (question.dropZones?.length) return question.dropZones;

    return Object.keys(question.correctDropZoneMap ?? {}).map((id) => ({
      id,
      label: this.formatDropZoneLabel(id),
    }));
  }

  private formatDropZoneLabel(id: string) {
    return id
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  private orderQuestions(questions: ArenaRuntimeQuestion[]) {
    const grouped = this.difficultiesInOrder().flatMap((difficulty) =>
      this.shuffle(
        questions.filter((question) => question.difficulty === difficulty),
      ),
    );

    return grouped.sort(
      (a, b) =>
        ARENA_DIFFICULTY_ORDER[a.difficulty] -
        ARENA_DIFFICULTY_ORDER[b.difficulty],
    );
  }

  private closestDifficultyPool(
    questions: ArenaQuestion[],
    difficulty: ArenaDifficulty,
  ) {
    return this.shuffle(questions).sort(
      (a, b) =>
        Math.abs(
          ARENA_DIFFICULTY_ORDER[a.difficulty] -
            ARENA_DIFFICULTY_ORDER[difficulty],
        ) -
        Math.abs(
          ARENA_DIFFICULTY_ORDER[b.difficulty] -
            ARENA_DIFFICULTY_ORDER[difficulty],
        ),
    );
  }

  private difficultiesInOrder(): ArenaDifficulty[] {
    return ['easy', 'medium', 'hard'];
  }

  private countDifficulty(
    questions: ArenaRuntimeQuestion[],
    difficulty: ArenaDifficulty,
  ) {
    return questions.filter((question) => question.difficulty === difficulty)
      .length;
  }

  private chapterCount(
    questions: ArenaRuntimeQuestion[],
    chapterOrder: number,
  ) {
    return questions.filter(
      (question) => question.chapterOrder === chapterOrder,
    ).length;
  }

  private typeCount(questions: ArenaRuntimeQuestion[], type: string) {
    return questions.filter((question) => question.type === type).length;
  }

  private shuffle<T>(items: T[]) {
    return [...items].sort(() => Math.random() - 0.5);
  }
}
