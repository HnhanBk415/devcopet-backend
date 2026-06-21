import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import {
  ARENA_MIN_RATING,
  ARENA_RANK_RATING_FLOOR,
  ARENA_RANK_UP_RULES,
  ARENA_RATING_DELTA,
} from '../constants/arena.constants';
import type {
  ArenaRank,
  ArenaRuntimePlayer,
  RatingChange,
  RankUpPayload,
} from '../types/arena.types';

@Injectable()
export class ArenaRatingService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  getRankForRating(rating: number): ArenaRank {
    if (rating >= ARENA_RANK_RATING_FLOOR.Expert) return 'Expert';
    if (rating >= ARENA_RANK_RATING_FLOOR.Senior) return 'Senior';
    if (rating >= ARENA_RANK_RATING_FLOOR.Fresher) return 'Fresher';
    return 'Beginner';
  }

  canRankUp(input: {
    rank: ArenaRank;
    rating: number;
    matchesInCurrentRank: number;
  }) {
    const rule = ARENA_RANK_UP_RULES[input.rank];
    if (!rule) return false;

    return (
      input.rating >= rule.minRating &&
      input.matchesInCurrentRank >= rule.minMatches
    );
  }

  async applyMatchResults(input: {
    players: ArenaRuntimePlayer[];
    winnerUserId?: string;
    isDraw: boolean;
    questionIds: string[];
  }): Promise<{ ratingChanges: RatingChange[]; rankUps: RankUpPayload[] }> {
    const ratingChanges: RatingChange[] = [];
    const rankUps: RankUpPayload[] = [];

    for (const player of input.players) {
      if (player.isBot) continue;

      const user = await this.userModel.findById(player.userId);
      if (!user) throw new NotFoundException('Arena user not found.');

      const oldRating = user.arenaRating ?? ARENA_MIN_RATING;
      const oldRank = (user.arenaRank ?? 'Beginner') as ArenaRank;
      const outcome = input.isDraw
        ? 'draw'
        : input.winnerUserId === player.userId
          ? 'win'
          : 'lose';
      const delta = ARENA_RATING_DELTA[outcome];
      const newRating = Math.max(ARENA_MIN_RATING, oldRating + delta);

      user.arenaRating = newRating;
      user.arenaTotalMatches = (user.arenaTotalMatches ?? 0) + 1;
      user.matchesInCurrentRank = (user.matchesInCurrentRank ?? 0) + 1;

      if (outcome === 'win') {
        user.arenaWins = (user.arenaWins ?? 0) + 1;
        user.winsInCurrentRank = (user.winsInCurrentRank ?? 0) + 1;
      } else if (outcome === 'lose') {
        user.arenaLosses = (user.arenaLosses ?? 0) + 1;
        user.lossesInCurrentRank = (user.lossesInCurrentRank ?? 0) + 1;
      } else {
        user.arenaDraws = (user.arenaDraws ?? 0) + 1;
      }

      const beforeRankUp = user.arenaRank as ArenaRank;
      if (
        this.canRankUp({
          rank: beforeRankUp,
          rating: newRating,
          matchesInCurrentRank: user.matchesInCurrentRank,
        })
      ) {
        const nextRank = ARENA_RANK_UP_RULES[beforeRankUp]!.nextRank;
        user.arenaRank = nextRank;
        user.matchesInCurrentRank = 0;
        user.winsInCurrentRank = 0;
        user.lossesInCurrentRank = 0;
        rankUps.push({
          userId: player.userId,
          oldRank: beforeRankUp,
          newRank: nextRank,
        });
      }

      const recentIds = input.questionIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
      const existingRecent = user.recentArenaQuestionIds ?? [];
      user.recentArenaQuestionIds = [...existingRecent, ...recentIds].slice(
        -50,
      );
      user.lastArenaPlayedAt = new Date();

      await user.save();

      player.ratingBefore = oldRating;
      player.ratingAfter = user.arenaRating;
      player.ratingDelta = user.arenaRating - oldRating;
      player.arenaRank = user.arenaRank as ArenaRank;
      player.arenaRating = user.arenaRating;

      ratingChanges.push({
        userId: player.userId,
        oldRating,
        newRating: user.arenaRating,
        delta: user.arenaRating - oldRating,
        oldRank,
        newRank: user.arenaRank as ArenaRank,
      });
    }

    return { ratingChanges, rankUps };
  }
}
