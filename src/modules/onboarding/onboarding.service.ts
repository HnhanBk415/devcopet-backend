import { Injectable, BadRequestException } from '@nestjs/common';
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

  /**
   * Return all 15 onboarding questions (served from constant).
   */
  getQuestions() {
    return {
      totalQuestions: ONBOARDING_QUESTIONS.length,
      traits: PERSONALITY_TRAITS,
      questions: ONBOARDING_QUESTIONS,
    };
  }

  /**
   * Submit all 15 answers, calculate personality scores,
   * create AssessmentResult + UserPersonality,
   * and mark onboardingCompleted on User.
   */
  async submitAnswers(userId: string, dto: SubmitAnswersDto) {
    // 1. Validate: exactly 15 answers
    if (!dto.answers || dto.answers.length !== ONBOARDING_QUESTIONS.length) {
      throw new BadRequestException(
        `Expected ${ONBOARDING_QUESTIONS.length} answers, got ${dto.answers?.length ?? 0}`,
      );
    }

    // 2. Validate each answer and build answers map
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

      answersMap.set(String(answer.questionNumber), answer.selectedOption);
    }

    // 3. Calculate raw scores
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
        rawScores[trait] += (option.scores as Record<string, number>)[trait] ?? 0;
      }
    }

    // 4. Calculate max possible score per trait for normalization
    const maxPossibleScores = this.calculateMaxPossibleScores();

    // 5. Normalize scores (0-1)
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

    // 6. Determine top 3 dominant traits
    const sortedTraits = [...PERSONALITY_TRAITS].sort(
      (a, b) => rawScores[b] - rawScores[a],
    );
    const dominantTraits = sortedTraits.slice(0, 3);

    // 7. Save AssessmentResult (immutable snapshot)
    const assessmentResult = await this.assessmentModel.create({
      userId: new Types.ObjectId(userId),
      assessmentVersion: 'v1',
      scoringVersion: 'v1',
      answers: answersMap,
      // Raw scores
      analytical: rawScores.analytical,
      creative: rawScores.creative,
      disciplined: rawScores.disciplined,
      independent: rawScores.independent,
      empathetic: rawScores.empathetic,
      competitive: rawScores.competitive,
      adaptable: rawScores.adaptable,
      curious: rawScores.curious,
      // Normalized scores
      analyticalNorm: normalizedScores.analytical,
      creativeNorm: normalizedScores.creative,
      disciplinedNorm: normalizedScores.disciplined,
      independentNorm: normalizedScores.independent,
      empatheticNorm: normalizedScores.empathetic,
      competitiveNorm: normalizedScores.competitive,
      adaptableNorm: normalizedScores.adaptable,
      curiousNorm: normalizedScores.curious,
      // Top traits
      primaryPersonality: dominantTraits[0],
      secondaryPersonality: dominantTraits[1] ?? null,
      tertiaryPersonality: dominantTraits[2] ?? null,
      completedAt: new Date(),
    });

    // 8. Upsert UserPersonality (living document)
    await this.personalityModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        // Raw scores
        analytical: rawScores.analytical,
        creative: rawScores.creative,
        disciplined: rawScores.disciplined,
        independent: rawScores.independent,
        empathetic: rawScores.empathetic,
        competitive: rawScores.competitive,
        adaptable: rawScores.adaptable,
        curious: rawScores.curious,
        // Normalized scores
        analyticalNorm: normalizedScores.analytical,
        creativeNorm: normalizedScores.creative,
        disciplinedNorm: normalizedScores.disciplined,
        independentNorm: normalizedScores.independent,
        empatheticNorm: normalizedScores.empathetic,
        competitiveNorm: normalizedScores.competitive,
        adaptableNorm: normalizedScores.adaptable,
        curiousNorm: normalizedScores.curious,
        // Meta
        dominantTraits,
        lastUpdatedFrom: 'onboarding',
        sourceAssessmentId: assessmentResult._id,
      },
      { upsert: true, new: true },
    );

    // 9. Mark onboardingCompleted on User
    await this.usersService.markOnboardingCompleted(userId);

    // 10. Build response
    const topTraits = dominantTraits.map((trait) => ({
      key: trait,
      nameVi: TRAIT_DISPLAY_NAMES[trait as PersonalityTrait].vi,
      nameEn: TRAIT_DISPLAY_NAMES[trait as PersonalityTrait].en,
      rawScore: rawScores[trait as PersonalityTrait],
      normalizedScore: normalizedScores[trait as PersonalityTrait],
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

  /**
   * Get the current personality profile for a user.
   */
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

  /**
   * Calculate max possible score per trait across all questions.
   * For each question, pick the option that gives the highest score for that trait.
   */
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
          const score =
            (option.scores as Record<string, number>)[trait] ?? 0;
          if (score > maxForThisQuestion) {
            maxForThisQuestion = score;
          }
        }
        maxScores[trait] += maxForThisQuestion;
      }
    }

    return maxScores;
  }
}
