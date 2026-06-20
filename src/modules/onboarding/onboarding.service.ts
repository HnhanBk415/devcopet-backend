import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AssessmentResult,
  AssessmentResultDocument,
} from './schemas/assessment-result.schema';
import {
  UserPersonality,
  UserPersonalityDocument,
} from './schemas/user-personality.schema';
import { UsersService } from '../users/users.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import {
  ONBOARDING_QUESTIONS,
  PERSONALITY_TRAITS,
  TRAIT_DISPLAY_NAMES,
  type PersonalityTrait,
} from './data/seed-questions';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(AssessmentResult.name)
    private readonly assessmentModel: Model<AssessmentResultDocument>,

    @InjectModel(UserPersonality.name)
    private readonly personalityModel: Model<UserPersonalityDocument>,

    private readonly usersService: UsersService,
  ) {}

  getQuestions() {
    return {
      totalQuestions: ONBOARDING_QUESTIONS.length,
      traits: PERSONALITY_TRAITS,
      questions: ONBOARDING_QUESTIONS,
    };
  }

  async submitAnswers(userId: string, dto: SubmitAnswersDto) {
    await this.assertOnboardingNotCompleted(userId);

    if (!dto.answers || dto.answers.length !== ONBOARDING_QUESTIONS.length) {
      throw new BadRequestException(
        `Expected ${ONBOARDING_QUESTIONS.length} answers, got ${dto.answers?.length ?? 0}`,
      );
    }

    const answersMap = this.validateAndBuildAnswersMap(dto);
    const rawScores = this.calculateRawScores(dto);
    const normalizedScores = this.calculateNormalizedScores(rawScores);
    const dominantTraits = [...PERSONALITY_TRAITS]
      .sort((a, b) => rawScores[b] - rawScores[a])
      .slice(0, 3);

    let assessmentResult: AssessmentResultDocument;
    try {
      assessmentResult = await this.assessmentModel.create({
        userId: new Types.ObjectId(userId),
        assessmentVersion: 'v1',
        scoringVersion: 'v1',
        answers: answersMap,
        analytical: rawScores.analytical,
        creative: rawScores.creative,
        disciplined: rawScores.disciplined,
        independent: rawScores.independent,
        empathetic: rawScores.empathetic,
        competitive: rawScores.competitive,
        adaptable: rawScores.adaptable,
        curious: rawScores.curious,
        analyticalNorm: normalizedScores.analytical,
        creativeNorm: normalizedScores.creative,
        disciplinedNorm: normalizedScores.disciplined,
        independentNorm: normalizedScores.independent,
        empatheticNorm: normalizedScores.empathetic,
        competitiveNorm: normalizedScores.competitive,
        adaptableNorm: normalizedScores.adaptable,
        curiousNorm: normalizedScores.curious,
        primaryPersonality: dominantTraits[0],
        secondaryPersonality: dominantTraits[1] ?? null,
        tertiaryPersonality: dominantTraits[2] ?? null,
        completedAt: new Date(),
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Onboarding has already been completed.');
      }
      throw error;
    }

    await this.personalityModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        analytical: rawScores.analytical,
        creative: rawScores.creative,
        disciplined: rawScores.disciplined,
        independent: rawScores.independent,
        empathetic: rawScores.empathetic,
        competitive: rawScores.competitive,
        adaptable: rawScores.adaptable,
        curious: rawScores.curious,
        analyticalNorm: normalizedScores.analytical,
        creativeNorm: normalizedScores.creative,
        disciplinedNorm: normalizedScores.disciplined,
        independentNorm: normalizedScores.independent,
        empatheticNorm: normalizedScores.empathetic,
        competitiveNorm: normalizedScores.competitive,
        adaptableNorm: normalizedScores.adaptable,
        curiousNorm: normalizedScores.curious,
        dominantTraits,
        lastUpdatedFrom: 'onboarding',
        sourceAssessmentId: assessmentResult._id,
      },
      { upsert: true, new: true },
    );

    await this.usersService.markOnboardingCompleted(userId);

    const topTraits = dominantTraits.map((trait) => ({
      key: trait,
      nameVi: TRAIT_DISPLAY_NAMES[trait].vi,
      nameEn: TRAIT_DISPLAY_NAMES[trait].en,
      rawScore: rawScores[trait],
      normalizedScore: normalizedScores[trait],
    }));

    return {
      message: 'Onboarding completed',
      personalityScores: {
        raw: rawScores,
        normalized: normalizedScores,
      },
      topTraits,
    };
  }

  async getUserPersonality(userId: string) {
    const personality = await this.personalityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    if (!personality) {
      return null;
    }

    return {
      scores: {
        raw: {
          analytical: personality.analytical,
          creative: personality.creative,
          disciplined: personality.disciplined,
          independent: personality.independent,
          empathetic: personality.empathetic,
          competitive: personality.competitive,
          adaptable: personality.adaptable,
          curious: personality.curious,
        },
        normalized: {
          analytical: personality.analyticalNorm,
          creative: personality.creativeNorm,
          disciplined: personality.disciplinedNorm,
          independent: personality.independentNorm,
          empathetic: personality.empatheticNorm,
          competitive: personality.competitiveNorm,
          adaptable: personality.adaptableNorm,
          curious: personality.curiousNorm,
        },
      },
      dominantTraits: personality.dominantTraits.map((trait) => ({
        key: trait,
        nameVi: TRAIT_DISPLAY_NAMES[trait as PersonalityTrait]?.vi ?? trait,
        nameEn: TRAIT_DISPLAY_NAMES[trait as PersonalityTrait]?.en ?? trait,
      })),
      lastUpdatedFrom: personality.lastUpdatedFrom,
    };
  }

  private async assertOnboardingNotCompleted(userId: string) {
    const objectUserId = new Types.ObjectId(userId);
    const [userCompleted, existingPersonality, existingAssessment] =
      await Promise.all([
        this.usersService.hasCompletedOnboarding(userId),
        this.personalityModel.exists({ userId: objectUserId }).exec(),
        this.assessmentModel.exists({ userId: objectUserId }).exec(),
      ]);

    if (userCompleted || existingPersonality || existingAssessment) {
      throw new ConflictException('Onboarding has already been completed.');
    }
  }

  private validateAndBuildAnswersMap(dto: SubmitAnswersDto) {
    const answersMap = new Map<string, string>();

    for (const answer of dto.answers) {
      const question = ONBOARDING_QUESTIONS.find(
        (q) => q.questionNumber === answer.questionNumber,
      );
      if (!question) {
        throw new BadRequestException(
          `Invalid question number: ${answer.questionNumber}`,
        );
      }

      const validKeys = question.options.map((o) => o.key);
      if (!validKeys.includes(answer.selectedOption)) {
        throw new BadRequestException(
          `Invalid option "${answer.selectedOption}" for question ${answer.questionNumber}. Valid: ${validKeys.join(', ')}`,
        );
      }

      const answerKey = String(answer.questionNumber);
      if (answersMap.has(answerKey)) {
        throw new BadRequestException(
          `Duplicate answer for question ${answer.questionNumber}`,
        );
      }

      answersMap.set(answerKey, answer.selectedOption);
    }

    return answersMap;
  }

  private calculateRawScores(dto: SubmitAnswersDto) {
    const rawScores: Record<PersonalityTrait, number> = {
      analytical: 0,
      creative: 0,
      disciplined: 0,
      independent: 0,
      empathetic: 0,
      competitive: 0,
      adaptable: 0,
      curious: 0,
    };

    for (const answer of dto.answers) {
      const question = ONBOARDING_QUESTIONS.find(
        (q) => q.questionNumber === answer.questionNumber,
      )!;
      const option = question.options.find(
        (o) => o.key === answer.selectedOption,
      )!;

      for (const trait of PERSONALITY_TRAITS) {
        rawScores[trait] +=
          (option.scores as Record<string, number>)[trait] ?? 0;
      }
    }

    return rawScores;
  }

  private calculateNormalizedScores(
    rawScores: Record<PersonalityTrait, number>,
  ) {
    const maxPossibleScores = this.calculateMaxPossibleScores();
    const normalizedScores: Record<PersonalityTrait, number> = {
      analytical: 0,
      creative: 0,
      disciplined: 0,
      independent: 0,
      empathetic: 0,
      competitive: 0,
      adaptable: 0,
      curious: 0,
    };

    for (const trait of PERSONALITY_TRAITS) {
      const maxScore = maxPossibleScores[trait];
      normalizedScores[trait] =
        maxScore > 0
          ? Math.round((rawScores[trait] / maxScore) * 100) / 100
          : 0;
    }

    return normalizedScores;
  }

  private calculateMaxPossibleScores(): Record<PersonalityTrait, number> {
    const maxScores: Record<PersonalityTrait, number> = {
      analytical: 0,
      creative: 0,
      disciplined: 0,
      independent: 0,
      empathetic: 0,
      competitive: 0,
      adaptable: 0,
      curious: 0,
    };

    for (const question of ONBOARDING_QUESTIONS) {
      for (const trait of PERSONALITY_TRAITS) {
        let maxForThisQuestion = 0;
        for (const option of question.options) {
          const score = (option.scores as Record<string, number>)[trait] ?? 0;
          if (score > maxForThisQuestion) {
            maxForThisQuestion = score;
          }
        }
        maxScores[trait] += maxForThisQuestion;
      }
    }

    return maxScores;
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
