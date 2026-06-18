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
  ReminderContext,
  ReminderStrategy,
} from './personality-engine.types';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context?: PetInteractionContext,
  ): Promise<PetBehaviorConfig> {
    const personality = await this.personalityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    if (!personality) {
      // Return defaults if no personality data exists
      return this.getDefaultConfig();
    }

    // TODO: Map personality scores to behavior config.
    // For now, return defaults.
    // Future implementation will use personality.dominantTraits
    // and normalized scores to calculate each config field.
    return this.getDefaultConfig();
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
}
