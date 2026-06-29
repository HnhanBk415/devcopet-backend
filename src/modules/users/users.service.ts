import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SocialProvider, User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Pet, PetDocument } from '../pets/schemas/pet.schema';
import {
  getPetCurrentLevelProgress,
  resolveTotalPetXpFromStoredPet,
} from '../pets/pet-xp.util';
import { BATTLE_WIN_XP, calculateLevelFromXp, getNextLevelXp } from './xp.util';

type UserXpSnapshot = {
  lifetimeXp: number;
  currentXp: number;
  level: number;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
  ) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    const created = new this.userModel(data);
    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() });
  }

  /** Raw document with all fields — used internally by AuthService */
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findBySocialId(
    provider: SocialProvider,
    providerId: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ [`${provider}Id`]: providerId });
  }

  /** Safe profile for API responses — strips sensitive fields */
  async findSafeById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash -refreshTokenHash')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    const xp = this.resolveXp(user);
    return {
      ...user,
      level: xp.level,
      lifetimeXp: xp.lifetimeXp,
      currentXp: xp.currentXp,
      exp: xp.lifetimeXp,
      petName: user.petName ?? 'Axo-Script',
    };
  }

  /** Saves a hashed refresh token (or clears it on logout) */
  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      refreshTokenHash: hashedToken,
    });
    if (!result) throw new NotFoundException('User not found');
  }

  async markEmailVerified(userId: string, verifiedAt: Date): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
    });
    if (!result) throw new NotFoundException('User not found');
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      passwordHash,
      refreshTokenHash: null,
    });
    if (!result) throw new NotFoundException('User not found');
  }

  /** Links a social provider ID to an existing user */
  async linkSocialProvider(
    userId: string,
    provider: SocialProvider,
    providerId: string,
    avatarUrl?: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        [`${provider}Id`]: providerId,
        $addToSet: { authProviders: provider },
        ...(avatarUrl ? { avatarUrl } : {}),
      },
      { new: true },
    );
  }

  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select({ onboardingCompleted: 1 })
      .lean<{ onboardingCompleted?: boolean }>()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.onboardingCompleted === true;
  }

  async markOnboardingCompleted(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      onboardingCompleted: true,
    });
    if (!result) throw new NotFoundException('User not found');
    await this.ensurePetForUser(userId, result.petName);
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<UserDocument> {
    const update: Partial<UpdateProfileDto> & {
      petProfileInitialized?: boolean;
    } = {
      ...data,
    };

    if (data.petName) {
      update.petName = data.petName.trim();
      update.petProfileInitialized = true;
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .select('-passwordHash -refreshTokenHash');
    if (!user) throw new NotFoundException('User not found');
    if (data.petName) {
      await this.ensurePetForUser(userId, data.petName.trim());
    }
    return user;
  }

  async getLeaderboard() {
    const users = await this.userModel
      .find({ onboardingCompleted: true })
      .select('username level exp lifetimeXp currentXp avatarUrl arenaRank')
      .lean()
      .exec();

    return users
      .map((user) => {
        const xp = this.resolveXp(user);
        return {
          userId: String(user._id),
          name: user.username,
          avatar: user.avatarUrl,
          currentXp: xp.currentXp,
          lifetimeXp: xp.lifetimeXp,
          level: xp.level,
          arenaRank: user.arenaRank ?? 'Beginner',
        };
      })
      .sort((a, b) => b.lifetimeXp - a.lifetimeXp)
      .slice(0, 20)
      .map((user, index) => ({
        rank: index + 1,
        ...user,
      }));
  }

  async getRandomOpponent(userId: string) {
    const count = await this.userModel.countDocuments({
      _id: { $ne: userId },
      onboardingCompleted: true,
    });
    if (count === 0) {
      const fallbackCount = await this.userModel.countDocuments({
        _id: { $ne: userId },
      });
      if (fallbackCount === 0) {
        return null;
      }
      const random = Math.floor(Math.random() * fallbackCount);
      return this.userModel
        .findOne({ _id: { $ne: userId } })
        .skip(random)
        .select('username level exp lifetimeXp currentXp avatarUrl bio')
        .lean()
        .exec();
    }
    const random = Math.floor(Math.random() * count);
    return this.userModel
      .findOne({ _id: { $ne: userId }, onboardingCompleted: true })
      .skip(random)
      .select('username level exp lifetimeXp currentXp avatarUrl bio')
      .lean()
      .exec();
  }

  async updateXp(userId: string, expChange: number): Promise<UserDocument> {
    const amount = Math.trunc(expChange);
    if (amount >= 0) return this.awardXp(userId, amount);

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const xp = this.resolveXp(user);
    const currentXp = Math.max(0, xp.currentXp + amount);
    const level = calculateLevelFromXp(xp.lifetimeXp);

    user.lifetimeXp = xp.lifetimeXp;
    user.currentXp = currentXp;
    user.exp = xp.lifetimeXp;
    user.level = level;
    await user.save();

    const safeUser = await this.userModel
      .findById(userId)
      .select('-passwordHash -refreshTokenHash');
    if (!safeUser) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }
    return safeUser;
  }

  async awardXp(userId: string, rewardXp: number): Promise<UserDocument> {
    const result = await this.awardXpWithLevelInfo(userId, rewardXp);
    return result.user;
  }

  async awardXpWithLevelInfo(
    userId: string,
    rewardXp: number,
  ): Promise<{
    user: UserDocument;
    previousLevel: number;
    level: number;
    leveledUp: boolean;
    lifetimeXp: number;
  }> {
    const amount = Math.max(0, Math.trunc(rewardXp));
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const xp = this.resolveXp(user);
    const previousLevel = xp.level;
    const lifetimeXp = xp.lifetimeXp + amount;
    const currentXp = xp.currentXp + amount;
    const level = calculateLevelFromXp(lifetimeXp);

    user.lifetimeXp = lifetimeXp;
    user.currentXp = currentXp;
    user.exp = lifetimeXp;
    user.level = level;
    await user.save();

    const safeUser = await this.userModel
      .findById(userId)
      .select('-passwordHash -refreshTokenHash');
    if (!safeUser) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }
    return {
      user: safeUser,
      previousLevel,
      level,
      leveledUp: level > previousLevel,
      lifetimeXp,
    };
  }

  async spendCurrentXp(userId: string, costXp: number): Promise<UserDocument> {
    const cost = Math.max(0, Math.trunc(costXp));
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const xp = this.resolveXp(user);
    if (xp.currentXp < cost) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_XP',
        errorCode: 'INSUFFICIENT_XP',
        message: 'Not enough XP to feed pet',
      });
    }

    user.lifetimeXp = xp.lifetimeXp;
    user.currentXp = xp.currentXp - cost;
    user.exp = xp.lifetimeXp;
    user.level = calculateLevelFromXp(xp.lifetimeXp);
    await user.save();

    const safeUser = await this.userModel
      .findById(userId)
      .select('-passwordHash -refreshTokenHash');
    if (!safeUser) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }
    return safeUser;
  }

  async getProfileMe(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash -refreshTokenHash')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const xp = this.resolveXp(user);
    const pet = await this.ensurePetForUser(userId, user.petName);
    const globalRank = await this.getGlobalRankForLifetimeXp(xp.lifetimeXp);

    return {
      id: String(user._id),
      name: user.username,
      email: user.email,
      avatar: user.avatarUrl,
      level: xp.level,
      lifetimeXp: xp.lifetimeXp,
      currentXp: xp.currentXp,
      nextLevelXp: getNextLevelXp(xp.level),
      globalRank,
      arenaRank: user.arenaRank ?? 'Beginner',
      pet: this.toProfilePet(pet),
    };
  }

  async ensurePetForUser(userId: string, petName?: string) {
    const name = petName?.trim() || 'Axo';
    return this.petModel
      .findOneAndUpdate(
        { ownerId: new Types.ObjectId(userId) },
        {
          $set: { name },
          $setOnInsert: {
            ownerId: new Types.ObjectId(userId),
            type: 'default',
            level: 1,
            exp: 0,
            nextLevelExp: 100,
            evolutionStage: 1,
            avatarUrl: '',
            totalFeeds: 0,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();
  }

  async awardBattleWinXp(userId: string): Promise<UserDocument> {
    return this.updateXp(userId, BATTLE_WIN_XP);
  }

  private resolveXp(user: Partial<User>): UserXpSnapshot {
    const legacyXp = Math.max(0, Math.floor(user.exp ?? 0));
    const lifetimeXp = Math.max(0, Math.floor(user.lifetimeXp ?? legacyXp));
    const currentXp = Math.max(0, Math.floor(user.currentXp ?? lifetimeXp));
    const level = calculateLevelFromXp(lifetimeXp);

    return { lifetimeXp, currentXp, level };
  }

  private async getGlobalRankForLifetimeXp(
    lifetimeXp: number,
  ): Promise<number> {
    const users = await this.userModel
      .find({ onboardingCompleted: true })
      .select('exp lifetimeXp currentXp')
      .lean()
      .exec();
    const ranks = users
      .map((user) => this.resolveXp(user).lifetimeXp)
      .sort((a, b) => b - a);
    const index = ranks.findIndex((xp) => lifetimeXp >= xp);

    return index >= 0 ? index + 1 : ranks.length + 1;
  }

  private toProfilePet(pet: Partial<Pet>) {
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
      evolutionStage: Math.min(
        3,
        Math.floor((Math.max(1, progress.level) - 1) / 5) + 1,
      ),
      avatar: pet.avatarUrl || pet.equippedSkin || undefined,
    };
  }
}
