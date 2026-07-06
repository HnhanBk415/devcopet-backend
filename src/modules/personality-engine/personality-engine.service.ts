import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserPersonality,
  UserPersonalityDocument,
} from '../onboarding/schemas/user-personality.schema';
import type {
  PetBehaviorConfig,
  PetInteractionContext,
  PersonalityTrait,
  ReminderContext,
  ReminderStrategy,
} from './personality-engine.types';

const PERSONALITY_TRAITS: PersonalityTrait[] = [
  'analytical',
  'creative',
  'disciplined',
  'independent',
  'empathetic',
  'competitive',
  'adaptable',
  'curious',
];

type PersonalityScores = Record<PersonalityTrait, number>;

/**
 * PersonalityEngine — Placeholder service.
 *
 * Reads UserPersonality and produces behavior configs
 * that pet/AI services can use to personalize interactions.
 *
 * TODO: Implement full logic based on product requirements.
 */
@Injectable()
export class PersonalityEngineService {
  constructor(
    @InjectModel(UserPersonality.name)
    private readonly personalityModel: Model<UserPersonalityDocument>,
  ) {}

  /**
   * Get pet behavior configuration based on user personality.
   *
   * This is the main entry point for pet service.
   * Returns a behavior profile that dictates HOW the pet
   * should interact with the user (tone, frequency, challenge level, etc).
   *
   * TODO: Implement real mapping logic.
   */
  async getPetBehaviorConfig(
    userId: string,
    context?: PetInteractionContext,
  ): Promise<PetBehaviorConfig> {
    const profile = await this.getPersonalizationProfile(userId, context);
    return profile.config;
  }

  async getPersonalizationProfile(
    userId: string,
    context?: PetInteractionContext,
  ): Promise<{
    config: PetBehaviorConfig;
    personalityFound: boolean;
    dominantTraits: string[];
    topTrait?: string;
    rawScores?: Record<string, number>;
    normScores?: Record<string, number>;
    defaultUsed: boolean;
  }> {
    const personality = Types.ObjectId.isValid(userId)
      ? await this.personalityModel
          .findOne({ userId: new Types.ObjectId(userId) })
          .lean()
      : null;

    if (!personality) {
      return {
        config: this.getDefaultConfig(),
        personalityFound: false,
        dominantTraits: [],
        defaultUsed: true,
      };
    }

    const normScores = this.getNormScores(personality);
    const rawScores = this.getRawScores(personality);
    const dominantTraits = this.cleanDominantTraits(
      personality.dominantTraits ?? [],
    );
    const topTrait = this.getTopTrait(normScores, new Set(dominantTraits));

    return {
      config: this.mapPersonalityToConfig(
        personality,
        context,
        normScores,
        dominantTraits,
        topTrait,
      ),
      personalityFound: true,
      dominantTraits,
      topTrait,
      rawScores,
      normScores,
      defaultUsed: false,
    };
  }

  /**
   * Generate a reminder strategy based on personality and context.
   *
   * TODO: Implement real logic.
   */
  async generateReminderStrategy(
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ReminderContext,
  ): Promise<ReminderStrategy> {
    // TODO: Use personality data to customize reminder strategy
    await this.personalityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    // TODO: Implement mapping from personality → reminder strategy.
    return {
      shouldSend: true,
      tone: 'supportive',
      messageTemplateKey: 'default_reminder',
      delayMinutes: 0,
      templateParams: {},
    };
  }

  /**
   * Default behavior config when no personality data is available.
   */
  private getDefaultConfig(): PetBehaviorConfig {
    return {
      tone: 'gentle',
      directness: 0.5,
      encouragementLevel: 0.7,
      challengeLevel: 0.5,
      messageLength: 'medium',
      useCompetition: false,
      useProgressEvidence: true,
      reminderStyle: 'supportive',
      reminderFrequency: 'medium',
      learningMode: 'solo',
    };
  }

  private mapPersonalityToConfig(
    personality: Pick<
      UserPersonality,
      | 'analyticalNorm'
      | 'creativeNorm'
      | 'disciplinedNorm'
      | 'independentNorm'
      | 'empatheticNorm'
      | 'competitiveNorm'
      | 'adaptableNorm'
      | 'curiousNorm'
      | 'dominantTraits'
    >,
    context?: PetInteractionContext,
    knownScores?: PersonalityScores,
    knownDominantTraits?: PersonalityTrait[],
    knownTopTrait?: PersonalityTrait,
  ): PetBehaviorConfig {
    const scores = knownScores ?? this.getNormScores(personality);
    const dominant = new Set(
      knownDominantTraits ??
        this.cleanDominantTraits(personality.dominantTraits ?? []),
    );
    const topTrait = knownTopTrait ?? this.getTopTrait(scores, dominant);
    const defaultConfig = this.getDefaultConfig();

    const config: PetBehaviorConfig = {
      ...defaultConfig,
      tone: this.toneForTrait(topTrait, scores),
      directness: this.clamp01(
        0.35 +
          scores.analytical * 0.25 +
          scores.disciplined * 0.25 +
          scores.independent * 0.3 -
          scores.empathetic * 0.2,
      ),
      encouragementLevel: this.clamp01(
        0.45 +
          scores.empathetic * 0.35 +
          scores.curious * 0.15 +
          scores.adaptable * 0.15 -
          scores.independent * 0.1,
      ),
      challengeLevel: this.clamp01(
        0.35 +
          scores.competitive * 0.35 +
          scores.analytical * 0.15 +
          scores.independent * 0.15,
      ),
      messageLength: this.messageLengthForTrait(topTrait, scores),
      useCompetition: scores.competitive >= 0.6 || dominant.has('competitive'),
      useProgressEvidence:
        scores.analytical >= 0.55 || dominant.has('analytical'),
      reminderStyle: scores.disciplined >= 0.6 ? 'structured' : 'supportive',
      reminderFrequency:
        scores.disciplined >= 0.7 || scores.competitive >= 0.75
          ? 'high'
          : scores.independent >= 0.7
            ? 'low'
            : 'medium',
      learningMode:
        scores.independent >= 0.65
          ? 'solo'
          : scores.adaptable >= 0.65 || scores.empathetic >= 0.65
            ? 'mixed'
            : defaultConfig.learningMode,
    };

    if (context?.interactionType === 'failure_support') {
      config.directness = this.clamp01(config.directness - 0.1);
      config.encouragementLevel = this.clamp01(config.encouragementLevel + 0.1);
    }

    return config;
  }

  private getTopTrait(
    scores: PersonalityScores,
    dominantTraits: Set<string>,
  ): PersonalityTrait {
    const firstDominant = [...dominantTraits].find((trait) => trait in scores);
    if (this.isPersonalityTrait(firstDominant)) return firstDominant;

    return (
      (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] as
        | PersonalityTrait
        | undefined) ?? 'empathetic'
    );
  }

  private toneForTrait(
    trait: string,
    scores: PersonalityScores,
  ): PetBehaviorConfig['tone'] {
    if (trait === 'empathetic') return 'gentle';
    if (trait === 'competitive') return 'motivational';
    if (trait === 'disciplined' || trait === 'independent') return 'direct';
    if (trait === 'creative') return 'playful';
    if (trait === 'curious') {
      return scores.creative >= scores.analytical ? 'playful' : 'analytical';
    }
    if (trait === 'adaptable') {
      return scores.competitive >= scores.empathetic
        ? 'motivational'
        : 'gentle';
    }
    return 'analytical';
  }

  private messageLengthForTrait(
    trait: string,
    scores: PersonalityScores,
  ): PetBehaviorConfig['messageLength'] {
    if (trait === 'independent' || scores.independent >= 0.75) return 'short';
    if (trait === 'analytical' && scores.analytical >= 0.75) return 'detailed';
    if (trait === 'disciplined' && scores.disciplined >= 0.75) return 'short';
    return 'medium';
  }

  private clamp01(value: unknown): number {
    const numeric =
      typeof value === 'number' && Number.isFinite(value) ? value : 0;
    return Math.min(1, Math.max(0, numeric));
  }

  private getNormScores(
    personality: Pick<
      UserPersonality,
      | 'analyticalNorm'
      | 'creativeNorm'
      | 'disciplinedNorm'
      | 'independentNorm'
      | 'empatheticNorm'
      | 'competitiveNorm'
      | 'adaptableNorm'
      | 'curiousNorm'
    >,
  ): PersonalityScores {
    return {
      analytical: this.clamp01(personality.analyticalNorm),
      creative: this.clamp01(personality.creativeNorm),
      disciplined: this.clamp01(personality.disciplinedNorm),
      independent: this.clamp01(personality.independentNorm),
      empathetic: this.clamp01(personality.empatheticNorm),
      competitive: this.clamp01(personality.competitiveNorm),
      adaptable: this.clamp01(personality.adaptableNorm),
      curious: this.clamp01(personality.curiousNorm),
    };
  }

  private getRawScores(
    personality: Pick<
      UserPersonality,
      | 'analytical'
      | 'creative'
      | 'disciplined'
      | 'independent'
      | 'empathetic'
      | 'competitive'
      | 'adaptable'
      | 'curious'
    >,
  ): PersonalityScores {
    return {
      analytical: this.numberOrZero(personality.analytical),
      creative: this.numberOrZero(personality.creative),
      disciplined: this.numberOrZero(personality.disciplined),
      independent: this.numberOrZero(personality.independent),
      empathetic: this.numberOrZero(personality.empathetic),
      competitive: this.numberOrZero(personality.competitive),
      adaptable: this.numberOrZero(personality.adaptable),
      curious: this.numberOrZero(personality.curious),
    };
  }

  private cleanDominantTraits(traits: string[]): PersonalityTrait[] {
    return traits.filter((trait): trait is PersonalityTrait =>
      this.isPersonalityTrait(trait),
    );
  }

  private isPersonalityTrait(value: unknown): value is PersonalityTrait {
    return (
      typeof value === 'string' &&
      PERSONALITY_TRAITS.includes(value as PersonalityTrait)
    );
  }

  private numberOrZero(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
}
