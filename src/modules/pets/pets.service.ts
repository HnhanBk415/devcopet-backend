import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Pet, PetDocument } from './schemas/pet.schema';
import {
  calculatePetLevelFromTotalXp,
  getPetCurrentLevelProgress,
  resolveTotalPetXpFromStoredPet,
} from './pet-xp.util';

export const PET_FEED_COST_XP = 100;
export const PET_EXP_GAIN_PER_FEED = 25;

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
    private readonly usersService: UsersService,
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
      nextLevelExp: progress.levelRequiredExp,
      nextLevelThresholdXp: progress.nextLevelThresholdXp,
      progressPercent: progress.progressPercent,
      evolutionStage: this.getEvolutionStage(progress.level),
      avatar: pet.avatarUrl || pet.equippedSkin || undefined,
    };
  }
}
