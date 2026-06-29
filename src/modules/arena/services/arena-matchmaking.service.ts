import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import {
  ARENA_BOT_FALLBACK_SECONDS,
  ARENA_RANK_VALUE,
} from '../constants/arena.constants';
import type { ArenaMode, ArenaRank } from '../types/arena.types';

export interface ArenaQueueEntry {
  userId: string;
  socketId: string;
  username: string;
  avatarUrl?: string | null;
  arenaRank: ArenaRank;
  arenaRating: number;
  courseSlug: string;
  mode: ArenaMode;
  queuedAt: number;
}

@Injectable()
export class ArenaMatchmakingService {
  private readonly queueByUserId = new Map<string, ArenaQueueEntry>();
  private readonly activeRoomByUserId = new Map<string, string>();

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async enqueue(input: {
    userId: string;
    socketId: string;
    courseSlug: string;
    mode: ArenaMode;
  }) {
    if (this.activeRoomByUserId.has(input.userId)) {
      throw new BadRequestException('User is already in an active arena room.');
    }

    const courseSlug = input.courseSlug.toLowerCase().trim();
    const existingEntry = this.queueByUserId.get(input.userId);
    if (existingEntry) {
      existingEntry.socketId = input.socketId;

      if (
        existingEntry.courseSlug !== courseSlug ||
        existingEntry.mode !== input.mode
      ) {
        existingEntry.courseSlug = courseSlug;
        existingEntry.mode = input.mode;
        existingEntry.queuedAt = Date.now();
      }

      return existingEntry;
    }

    const user = await this.userModel.findById(input.userId).lean().exec();
    if (!user) throw new BadRequestException('User not found.');

    const entry: ArenaQueueEntry = {
      userId: input.userId,
      socketId: input.socketId,
      username: user.username,
      avatarUrl: user.avatarUrl,
      arenaRank: (user.arenaRank ?? 'Beginner') as ArenaRank,
      arenaRating: user.arenaRating ?? 1000,
      courseSlug,
      mode: input.mode,
      queuedAt: Date.now(),
    };

    if (input.mode !== 'practice') {
      this.queueByUserId.set(input.userId, entry);
    }

    return entry;
  }

  findHumanMatch(entry: ArenaQueueEntry): ArenaQueueEntry | null {
    for (const candidate of this.queueByUserId.values()) {
      if (candidate.userId === entry.userId) continue;
      if (candidate.courseSlug !== entry.courseSlug) continue;
      if (candidate.mode !== entry.mode) continue;
      if (!this.canMatch(entry, candidate, Date.now())) continue;

      this.queueByUserId.delete(entry.userId);
      this.queueByUserId.delete(candidate.userId);
      return candidate;
    }

    return null;
  }

  cancel(userId: string) {
    return this.queueByUserId.delete(userId);
  }

  removeSocket(socketId: string) {
    for (const [userId, entry] of this.queueByUserId.entries()) {
      if (entry.socketId === socketId) {
        this.queueByUserId.delete(userId);
      }
    }
  }

  markActiveRoom(userIds: string[], roomId: string) {
    for (const userId of userIds) {
      if (!userId.startsWith('bot_')) {
        this.activeRoomByUserId.set(userId, roomId);
      }
    }
  }

  clearActiveRoom(userIds: string[]) {
    for (const userId of userIds) {
      this.activeRoomByUserId.delete(userId);
    }
  }

  getActiveRoomId(userId: string) {
    return this.activeRoomByUserId.get(userId);
  }

  shouldCreateBot(entry: ArenaQueueEntry, now = Date.now()) {
    if (entry.mode === 'practice') return true;
    return (
      Math.floor((now - entry.queuedAt) / 1000) >= ARENA_BOT_FALLBACK_SECONDS
    );
  }

  getWaitingSeconds(entry: ArenaQueueEntry, now = Date.now()) {
    return Math.floor((now - entry.queuedAt) / 1000);
  }

  canMatch(a: ArenaQueueEntry, b: ArenaQueueEntry, now = Date.now()) {
    const waitedSeconds = Math.max(
      Math.floor((now - a.queuedAt) / 1000),
      Math.floor((now - b.queuedAt) / 1000),
    );
    const rankDiff = Math.abs(
      ARENA_RANK_VALUE[a.arenaRank] - ARENA_RANK_VALUE[b.arenaRank],
    );
    const ratingDiff = Math.abs(a.arenaRating - b.arenaRating);

    if (rankDiff > 1) return false;

    if (waitedSeconds < 10) {
      return rankDiff === 0 && ratingDiff <= 100;
    }
    if (waitedSeconds < 15) {
      return rankDiff === 0 && ratingDiff <= 200;
    }
    if (waitedSeconds < 20) {
      return rankDiff <= 1 && ratingDiff <= 300;
    }
    if (waitedSeconds < 30) {
      return rankDiff <= 1 && ratingDiff <= 400;
    }

    return rankDiff <= 1 && ratingDiff <= 400;
  }
}
