import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { ArenaMatch, ArenaMatchDocument } from '../schemas/arena-match.schema';

@Injectable()
export class ArenaQueryService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ArenaMatch.name)
    private readonly arenaMatchModel: Model<ArenaMatchDocument>,
  ) {}

  async getMyProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select({
        username: 1,
        email: 1,
        avatarUrl: 1,
        arenaRating: 1,
        arenaRank: 1,
        arenaTotalMatches: 1,
        arenaWins: 1,
        arenaLosses: 1,
        arenaDraws: 1,
        matchesInCurrentRank: 1,
        winsInCurrentRank: 1,
        lossesInCurrentRank: 1,
        lastArenaPlayedAt: 1,
      })
      .lean()
      .exec();

    if (!user) throw new NotFoundException('User not found');

    const totalMatches = user.arenaTotalMatches ?? 0;
    const winRate =
      totalMatches > 0
        ? Math.round(((user.arenaWins ?? 0) / totalMatches) * 100)
        : 0;

    return {
      id: String(user._id),
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      arenaRating: user.arenaRating ?? 1000,
      arenaRank: user.arenaRank ?? 'Beginner',
      arenaTotalMatches: totalMatches,
      arenaWins: user.arenaWins ?? 0,
      arenaLosses: user.arenaLosses ?? 0,
      arenaDraws: user.arenaDraws ?? 0,
      winRate,
      matchesInCurrentRank: user.matchesInCurrentRank ?? 0,
      winsInCurrentRank: user.winsInCurrentRank ?? 0,
      lossesInCurrentRank: user.lossesInCurrentRank ?? 0,
      lastArenaPlayedAt: user.lastArenaPlayedAt,
    };
  }

  async getMyHistory(userId: string, limit: number) {
    if (!Types.ObjectId.isValid(userId)) return [];

    return this.arenaMatchModel
      .find({ 'players.userId': new Types.ObjectId(userId) })
      .select({
        roomId: 1,
        courseSlug: 1,
        mode: 1,
        matchTier: 1,
        players: 1,
        finalScoreboard: 1,
        winnerUserId: 1,
        resultType: 1,
        status: 1,
        startedAt: 1,
        finishedAt: 1,
        createdAt: 1,
      })
      .sort({ finishedAt: -1, createdAt: -1 })
      .limit(this.clampLimit(limit, 1, 50))
      .lean()
      .exec();
  }

  async getLeaderboard(limit: number) {
    const users = await this.userModel
      .find({ arenaTotalMatches: { $gte: 0 } })
      .select({
        username: 1,
        avatarUrl: 1,
        arenaRating: 1,
        arenaRank: 1,
        arenaTotalMatches: 1,
        arenaWins: 1,
        arenaLosses: 1,
        arenaDraws: 1,
      })
      .sort({ arenaRating: -1, arenaWins: -1, arenaTotalMatches: 1 })
      .limit(this.clampLimit(limit, 1, 100))
      .lean()
      .exec();

    return users.map((user, index) => ({
      rank: index + 1,
      userId: String(user._id),
      username: user.username,
      avatarUrl: user.avatarUrl ?? null,
      arenaRating: user.arenaRating ?? 1000,
      arenaRank: user.arenaRank ?? 'Beginner',
      arenaTotalMatches: user.arenaTotalMatches ?? 0,
      arenaWins: user.arenaWins ?? 0,
      arenaLosses: user.arenaLosses ?? 0,
      arenaDraws: user.arenaDraws ?? 0,
    }));
  }

  private clampLimit(value: number, min: number, max: number) {
    if (!Number.isFinite(value)) return min;
    return Math.min(Math.max(Math.floor(value), min), max);
  }
}
