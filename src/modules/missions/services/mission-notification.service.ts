import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MissionNotification,
  MissionNotificationDocument,
} from '../schemas/mission-notification.schema';

@Injectable()
export class MissionNotificationService {
  constructor(
    @InjectModel(MissionNotification.name)
    private readonly notificationModel: Model<MissionNotificationDocument>,
  ) {}

  async create(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    missionId?: string;
  }) {
    return this.notificationModel.create({
      ...input,
      userId: new Types.ObjectId(input.userId),
      purgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  async list(userId: string, limit = 20) {
    const userObjectId = new Types.ObjectId(userId);
    const [items, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(Math.min(Math.max(limit, 1), 50))
        .lean()
        .exec(),
      this.notificationModel.countDocuments({
        userId: userObjectId,
        read: false,
      }),
    ]);
    return { unreadCount, items };
  }

  async markRead(userId: string, notificationId: string) {
    if (!Types.ObjectId.isValid(notificationId)) return null;
    return this.notificationModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(notificationId),
          userId: new Types.ObjectId(userId),
        },
        { $set: { read: true, readAt: new Date() } },
        { new: true },
      )
      .lean()
      .exec();
  }
}
