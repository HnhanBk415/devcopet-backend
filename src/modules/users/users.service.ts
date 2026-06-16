import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    const created = new this.userModel(data);
    return created.save();
  }

  async findAll() {
    return this.userModel
      .find()
      .select('-passwordHash -refreshTokenHash')
      .lean();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  /** Raw document with all fields — used internally by AuthService */
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findBySocialId(
    provider: 'google' | 'facebook' | 'github',
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
    return user;
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
    provider: string,
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
}
