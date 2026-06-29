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
 * PersonalityEngine reads UserPersonality and produces behavior configs
 * that pet/AI services can use to personalize interactions.
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
   */
  async getPetBehaviorConfig(
    userId: string,
    _context?: PetInteractionContext,
  ): Promise<PetBehaviorConfig> {
    void _context;

    const personality = await this.personalityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    if (!personality) {
      // Return defaults if no personality data exists
      return this.getDefaultConfig();
    }

    // Personality-aware behavior falls back to defaults until mappings are enabled.
    return this.getDefaultConfig();
  }

  /**
   * Generate a reminder strategy based on personality and context.
   */
  async generateReminderStrategy(
    userId: string,
    _context: ReminderContext,
  ): Promise<ReminderStrategy> {
    void _context;

    await this.personalityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

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
