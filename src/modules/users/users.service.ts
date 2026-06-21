import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocialProvider, User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

const BATTLE_WIN_XP = 150;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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
    return {
      ...user,
      petName: user.petName ?? 'Axo-Script',
    };
  }

  /** Saves a hashed refresh token (or clears it on logout) */
  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshTokenHash: hashedToken,
    });
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
    return user;
  }

  async getLeaderboard() {
    return this.userModel
      .find({ onboardingCompleted: true })
      .sort({ exp: -1, level: -1 })
      .limit(20)
      .select('username level exp avatarUrl bio')
      .lean()
      .exec();
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
        .select('username level exp avatarUrl bio')
        .lean()
        .exec();
    }
    const random = Math.floor(Math.random() * count);
    return this.userModel
      .findOne({ _id: { $ne: userId }, onboardingCompleted: true })
      .skip(random)
      .select('username level exp avatarUrl bio')
      .lean()
      .exec();
  }

  async updateXp(userId: string, expChange: number): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        [
          {
            $set: {
              exp: {
                $max: [
                  0,
                  {
                    $add: [{ $ifNull: ['$exp', 0] }, Math.trunc(expChange)],
                  },
                ],
              },
            },
          },
          {
            $set: {
              level: {
                $add: [{ $floor: { $divide: ['$exp', 1000] } }, 1],
              },
            },
          },
        ],
        { new: true },
      )
      .select('-passwordHash -refreshTokenHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async awardBattleWinXp(userId: string): Promise<UserDocument> {
    return this.updateXp(userId, BATTLE_WIN_XP);
  }
}
