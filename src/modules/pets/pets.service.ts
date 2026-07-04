import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { LearningHistoryService } from '../learning-history/learning-history.service';
import { MissionsService } from '../missions/missions.service';
import { MissionNotificationService } from '../missions/services/mission-notification.service';
import { Pet, PetDocument } from './schemas/pet.schema';
import {
  calculatePetLevelFromTotalXp,
  getPetCurrentLevelProgress,
  resolveTotalPetXpFromStoredPet,
} from './pet-xp.util';

export const PET_FEED_COST_XP = 100;
export const PET_EXP_GAIN_PER_FEED = 100;

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
    private readonly usersService: UsersService,
    private readonly learningHistoryService: LearningHistoryService,
    private readonly missionsService: MissionsService,
    private readonly notificationService: MissionNotificationService,
  ) {}

  async getMe(userId: string) {
    const pet = await this.usersService.ensurePetForUser(userId);
    return this.toPetResponse(pet);
  }

  async feed(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const pet = await this.petModel
      .findOne({ ownerId: new Types.ObjectId(userId) })
      .exec();
    if (!pet) {
      throw new NotFoundException({
        code: 'PET_NOT_FOUND',
        errorCode: 'PET_NOT_FOUND',
        message: 'Pet not found.',
      });
    }

    const updatedUser = await this.usersService.spendCurrentXp(
      userId,
      PET_FEED_COST_XP,
    );

    const totalPetXp = resolveTotalPetXpFromStoredPet(pet);
    const previousLevel = calculatePetLevelFromTotalXp(totalPetXp);
    pet.exp = totalPetXp + PET_EXP_GAIN_PER_FEED;
    const progress = getPetCurrentLevelProgress(pet.exp);
    pet.level = progress.level;
    pet.nextLevelExp = progress.nextLevelRequiredXp;
    pet.evolutionStage = this.getEvolutionStage(pet.level);
    pet.totalFeeds = (pet.totalFeeds ?? 0) + 1;

    await pet.save();
    await this.createNotificationSafely({
      userId,
      type: 'PET_EXP_GAINED',
      title: 'Pet EXP gained',
      message: `${pet.name} gained ${PET_EXP_GAIN_PER_FEED} Pet EXP.`,
      metadata: {
        petName: pet.name,
        petExpGain: PET_EXP_GAIN_PER_FEED,
        petLevel: pet.level,
      },
    });
    if (pet.level > previousLevel) {
      await this.createNotificationSafely({
        userId,
        type: 'PET_LEVEL_UP',
        title: 'Pet level up',
        message: `${pet.name} reached Level ${pet.level}.`,
        metadata: { petName: pet.name, petLevel: pet.level },
      });
    }

    const idempotencyKey =
      'pet-fed:' + userId + ':' + String(pet._id) + ':' + pet.totalFeeds;
    const event = await this.learningHistoryService.recordEvent({
      userId,
      eventType: 'PET_FED',
      idempotencyKey,
      targetType: 'PET',
      targetId: String(pet._id),
      passed: true,
      score: 1,
      metadata: {
        feedCostXp: PET_FEED_COST_XP,
        petExpGain: PET_EXP_GAIN_PER_FEED,
        totalFeeds: pet.totalFeeds,
      },
    });
    if (event.created) {
      await this.missionsService.processActivityEvent({
        userId,
        eventType: 'PET_FED',
        idempotencyKey,
        targetType: 'PET',
        targetId: String(pet._id),
        passed: true,
        score: 1,
        metadata: {
          feedCostXp: PET_FEED_COST_XP,
          petExpGain: PET_EXP_GAIN_PER_FEED,
          totalFeeds: pet.totalFeeds,
        },
      });
    }

    return {
      message: 'Pet fed successfully',
      feedCostXp: PET_FEED_COST_XP,
      petExpGain: PET_EXP_GAIN_PER_FEED,
      levelUp: pet.level > previousLevel,
      currentXp: updatedUser.currentXp,
      lifetimeXp: updatedUser.lifetimeXp,
      userLevel: updatedUser.level,
      pet: this.toPetResponse(pet),
    };
  }

  private getEvolutionStage(level: number): number {
    return Math.min(3, Math.floor((Math.max(1, level) - 1) / 5) + 1);
  }

  private toPetResponse(pet: Partial<Pet>) {
    const totalExp = resolveTotalPetXpFromStoredPet(pet);
    const progress = getPetCurrentLevelProgress(totalExp);

    return {
      name: pet.name,
      level: progress.level,
      totalExp,
      exp: progress.currentLevelXp,
      levelRequiredExp: progress.levelRequiredExp,
      nextLevelExp: progress.nextLevelRequiredXp,
      nextLevelThresholdXp: progress.nextLevelThresholdXp,
      progressPercent: progress.progressPercent,
      evolutionStage: this.getEvolutionStage(progress.level),
      avatar: pet.avatarUrl || pet.equippedSkin || undefined,
    };
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
