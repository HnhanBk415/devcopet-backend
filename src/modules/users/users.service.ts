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
    return this.userModel.find().select('-passwordHash').lean();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findSafeById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
