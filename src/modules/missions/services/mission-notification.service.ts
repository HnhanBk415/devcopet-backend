import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MissionNotification,
  MissionNotificationDocument,
} from '../schemas/mission-notification.schema';

type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  missionId?: string;
  metadata?: Record<string, unknown>;
};

type LeanNotification = Partial<MissionNotification> & {
  _id: unknown;
  userId: unknown;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class MissionNotificationService {
  constructor(
    @InjectModel(MissionNotification.name)
    private readonly notificationModel: Model<MissionNotificationDocument>,
  ) {}

  async create(input: NotificationInput) {
    return this.notificationModel.create({
      ...input,
      userId: new Types.ObjectId(input.userId),
      isRead: false,
      read: false,
      metadata: input.metadata ?? {},
      purgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  async list(userId: string, limit = 20, page = 1) {
    const userObjectId = new Types.ObjectId(userId);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;
    const unreadFilter = {
      userId: userObjectId,
      $or: [{ isRead: false }, { read: false }],
    };
    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments({ userId: userObjectId }),
      this.notificationModel.countDocuments(unreadFilter),
    ]);
    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      unreadCount,
      page: safePage,
      limit: safeLimit,
      hasMore: skip + items.length < total,
    };
  }

  async unreadCount(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const unreadCount = await this.notificationModel.countDocuments({
      userId: userObjectId,
      $or: [{ isRead: false }, { read: false }],
    });
    return { unreadCount };
  }

  async markRead(userId: string, notificationId: string) {
    if (!Types.ObjectId.isValid(notificationId)) return null;
    const notification = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(notificationId),
          userId: new Types.ObjectId(userId),
        },
        { $set: { read: true, isRead: true, readAt: new Date() } },
        { new: true },
      )
      .lean()
      .exec();
    return notification ? this.toResponse(notification) : null;
  }

  async markAllRead(userId: string) {
    const now = new Date();
    await this.notificationModel
      .updateMany(
        {
          userId: new Types.ObjectId(userId),
          $or: [{ isRead: false }, { read: false }],
        },
        { $set: { read: true, isRead: true, readAt: now } },
      )
      .exec();

    return this.unreadCount(userId);
  }

  private toResponse(notification: LeanNotification) {
    const read = notification.isRead === true || notification.read === true;
    return {
      ...notification,
      id: String(notification._id),
      userId: String(notification.userId),
      isRead: read,
      read,
      metadata:
        typeof notification.metadata === 'object' && notification.metadata
          ? notification.metadata
          : {},
    };
  }
}
