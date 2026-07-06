import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { PersonalityEngineService } from './personality-engine.service';
import type {
  PersonalizationContext,
  PersonalizeTextInput,
  PersonalizedTextResult,
  PersonalityTrait,
  PetBehaviorConfig,
  PetTone,
} from './personality-engine.types';

const DEFAULT_PET_NAME = 'Axo-Script';
const MAX_MESSAGE_LENGTH = {
  short: 160,
  medium: 200,
  detailed: 220,
} satisfies Record<PetBehaviorConfig['messageLength'], number>;

@Injectable()
export class PetPersonalizationService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly personalityEngine: PersonalityEngineService,
  ) {}

  async personalizeText(
    input: PersonalizeTextInput,
  ): Promise<PersonalizedTextResult> {
    const user = Types.ObjectId.isValid(input.userId)
      ? await this.userModel
          .findById(input.userId)
          .select({ petName: 1 })
          .lean()
      : null;
    const petName = user?.petName?.trim() || DEFAULT_PET_NAME;
    const profile = await this.personalityEngine.getPersonalizationProfile(
      input.userId,
      {
        interactionType:
          input.context.interactionType === 'challenge_wrong'
            ? 'failure_support'
            : 'task_complete',
        metadata: input.context.metadata,
      },
    );
    const config = profile.config;
    const tone = config.tone;
    const templatesUsed: string[] = [];
    const baseText = this.cleanText(input.baseText || input.fallbackText);
    const topTrait = this.asTrait(profile.topTrait);

    const text =
      input.context.interactionType === 'challenge_wrong'
        ? this.buildWrongFeedback({
            petName,
            tone,
            config,
            topTrait,
            context: input.context,
            templatesUsed,
          })
        : input.context.interactionType === 'challenge_hint'
          ? this.buildHintMessage({
              petName,
              tone,
              config,
              topTrait,
              context: input.context,
              templatesUsed,
            })
          : input.context.interactionType === 'challenge_review'
            ? this.buildReviewExplanation({
                petName,
                tone,
                config,
                baseText,
                topTrait,
                context: input.context,
                templatesUsed,
              })
            : this.buildCorrectExplanation({
                petName,
                tone,
                config,
                baseText,
                topTrait,
                context: input.context,
                templatesUsed,
              });

    return {
      text,
      speaker: {
        name: petName,
        type: 'PET',
      },
      tone,
      meta: {
        userId: input.userId,
        petName,
        tone,
        dominantTraits: profile.dominantTraits,
        topTrait: profile.topTrait,
        directness: config.directness,
        encouragementLevel: config.encouragementLevel,
        challengeLevel: config.challengeLevel,
        messageLength: config.messageLength,
        useCompetition: config.useCompetition,
        useProgressEvidence: config.useProgressEvidence,
        personalityFound: profile.personalityFound,
        defaultUsed: profile.defaultUsed,
        templatesUsed,
        context: input.context,
      },
    };
  }

  getPraiseMessage(tone: string | undefined, topTrait?: string): string {
    const trait = this.asTrait(topTrait);
    if (trait === 'analytical') return 'Correct logic.';
    if (trait === 'empathetic')
      return 'Nice work - you handled that carefully.';
    if (trait === 'competitive') return 'Checkpoint cleared.';
    if (trait === 'disciplined') return 'Correct. Clean execution.';
    if (trait === 'independent') return 'Correct. You had the rule.';
    if (trait === 'curious') return 'Correct - you spotted the pattern.';
    if (trait === 'creative') return 'Correct - the idea clicked.';
    if (trait === 'adaptable') return 'Correct - good adjustment.';
    if (tone === 'direct') return 'Correct.';
    if (tone === 'motivational') return 'Checkpoint cleared.';
    if (tone === 'analytical') return 'Correct logic.';
    if (tone === 'playful') return 'Pattern caught.';
    return 'Nice work - you got it.';
  }

  private buildCorrectExplanation(input: BuildInput): string {
    const { petName, tone, baseText, topTrait, templatesUsed } = input;
    templatesUsed.push(`correct:${tone}`);
    const byTone: Record<PetTone, string> = {
      gentle: `${petName}: Nice work. ${baseText}`,
      direct: `${petName}: Correct. ${baseText}`,
      motivational: `${petName}: Checkpoint cleared. ${baseText}`,
      analytical: `${petName}'s logic check: ${baseText}`,
      playful: `${petName} spotted the pattern: ${baseText}`,
    };
    return this.joinParts([
      byTone[tone],
      this.traitModifier(topTrait, 'correct', templatesUsed),
    ]);
  }

  private buildWrongFeedback(input: Omit<BuildInput, 'baseText'>): string {
    const { petName, tone, config, topTrait, templatesUsed } = input;
    templatesUsed.push(`wrong:${tone}`);
    const byTrait: Partial<Record<PersonalityTrait, string>> = {
      analytical: `${petName}: Not correct. Go back and trace the requirement -> rule -> result.`,
      empathetic: `${petName}: Not correct yet. Take it slowly, reread the prompt, then try again.`,
      competitive: `${petName}: Not cleared yet. Reset, check the rule, and take the next run cleanly.`,
      disciplined: `${petName}: Not correct. Retry with read -> trace -> choose.`,
      independent: `${petName}: Not correct. Recheck the main rule yourself, then retry.`,
      curious: `${petName}: Not correct. Look for what pattern the question is testing, then retry.`,
      creative: `${petName}: Not correct. Shift perspective and check what behavior the prompt asks for.`,
      adaptable: `${petName}: Not correct. Try another angle: requirement first, option second.`,
    };
    const byTone: Record<PetTone, string> = {
      gentle: `${petName}: Not correct yet. Reread the prompt, then try again.`,
      direct: `${petName}: Incorrect. Check the rule and retry.`,
      motivational: `${petName}: Not cleared yet. Reset and retry the checkpoint.`,
      analytical: `${petName}: Not correct. Trace the requirement -> rule -> result.`,
      playful: `${petName}: Not correct yet. Spot the pattern, then retry.`,
    };
    return this.fitMessage(
      (topTrait ? byTrait[topTrait] : undefined) ?? byTone[tone],
      config.messageLength,
    );
  }

  private buildReviewExplanation(input: BuildInput): string {
    input.templatesUsed.push('review:repersonalized');
    return this.buildCorrectExplanation(input);
  }

  private buildHintMessage(input: Omit<BuildInput, 'baseText'>): string {
    const { petName, tone, config, topTrait, context, templatesUsed } = input;
    templatesUsed.push(`hint:${tone}`);
    const tonePrefix: Record<PetTone, string> = {
      gentle: `${petName}: Here is a gentle hint.`,
      direct: `${petName}: Hint.`,
      motivational: `${petName}: One cue to help clear the checkpoint.`,
      analytical: `${petName}'s hint check:`,
      playful: `${petName} drops a small clue:`,
    };
    return this.fitMessage(
      this.joinParts([
        tonePrefix[tone],
        this.challengeTypeModifier(context.challengeType, templatesUsed),
        this.traitModifier(topTrait, 'wrong', templatesUsed),
      ]),
      config.messageLength,
    );
  }

  private traitModifier(
    trait: PersonalityTrait | undefined,
    result: 'correct' | 'wrong',
    templatesUsed: string[],
  ): string | null {
    if (!trait) return null;
    templatesUsed.push(`trait:${trait}:${result}`);
    const modifiers: Record<
      PersonalityTrait,
      Record<'correct' | 'wrong', string | null>
    > = {
      analytical: {
        correct: 'Logic chain: requirement -> rule -> result.',
        wrong: 'Next time, trace the logic chain before choosing.',
      },
      competitive: {
        correct: 'Good clear. Carry this pattern into the next node.',
        wrong: 'Next time, clear this checkpoint cleanly.',
      },
      empathetic: {
        correct:
          'Keep this one steady; this is the kind of detail that becomes easier with practice.',
        wrong: 'No worries, this one is easy to mix up. Retry more slowly.',
      },
      disciplined: {
        correct:
          'Rule to keep: identify what the command or runtime actually does.',
        wrong: 'Retry with three steps: read, trace, choose.',
      },
      independent: {
        correct: null,
        wrong: 'Review the main rule yourself, then retry.',
      },
      curious: {
        correct: null,
        wrong: 'Find the pattern first, then choose.',
      },
      creative: {
        correct: null,
        wrong:
          'Shift perspective: the prompt asks about behavior, not just syntax.',
      },
      adaptable: {
        correct: null,
        wrong: 'Try another angle: trace a small example first.',
      },
    };
    return modifiers[trait][result];
  }

  private challengeTypeModifier(
    challengeType: string | undefined,
    templatesUsed: string[],
  ): string | null {
    if (!challengeType) return null;
    const modifiers: Record<string, string> = {
      multiple_choice: 'Eliminate wrong options using the prompt requirements.',
      code_trace: 'Track each variable state after every line.',
      bug_hunt:
        'Find the first line where the state diverges from the expected behavior.',
      drag_drop: 'Ask what role each blank needs to play.',
      drag_drop_matching: 'Match by role first, then verify the details.',
      ordering_steps:
        'Dependent steps must come after the step that creates their data.',
      ranking: 'Order by the strongest criterion first.',
      fill_missing_line:
        'The missing line must connect the line before it with the line after it.',
    };
    const modifier = modifiers[challengeType];
    if (modifier) templatesUsed.push(`challengeType:${challengeType}`);
    return modifier ?? null;
  }

  private fitMessage(
    text: string,
    messageLength: PetBehaviorConfig['messageLength'],
  ) {
    const max = MAX_MESSAGE_LENGTH[messageLength];
    if (text.length <= max) return text;

    const truncated = text.slice(0, max);
    const lastSpace = truncated.lastIndexOf(' ');
    const safe =
      lastSpace > Math.floor(max * 0.7)
        ? truncated.slice(0, lastSpace)
        : truncated;
    return safe.trim();
  }

  private joinParts(parts: Array<string | null | undefined>) {
    return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  private cleanText(text: string) {
    return text.trim().replace(/\s+/g, ' ');
  }

  private asTrait(value: string | undefined): PersonalityTrait | undefined {
    const traits: PersonalityTrait[] = [
      'analytical',
      'creative',
      'disciplined',
      'independent',
      'empathetic',
      'competitive',
      'adaptable',
      'curious',
    ];
    return traits.includes(value as PersonalityTrait)
      ? (value as PersonalityTrait)
      : undefined;
  }
}

type BuildInput = {
  petName: string;
  tone: PetTone;
  config: PetBehaviorConfig;
  baseText: string;
  topTrait?: PersonalityTrait;
  context: PersonalizationContext;
  templatesUsed: string[];
};
