import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RecordActivityEventInput,
  RecordLearningAttemptInput,
  TopicLearningStat,
} from './learning-history.types';
import {
  ActivityEvent,
  ActivityEventDocument,
} from './schemas/activity-event.schema';
import {
  LearningAttempt,
  LearningAttemptDocument,
} from './schemas/learning-attempt.schema';
import {
  UserLearningProfile,
  UserLearningProfileDocument,
} from './schemas/user-learning-profile.schema';

@Injectable()
export class LearningHistoryService {
  constructor(
    @InjectModel(LearningAttempt.name)
    private readonly attemptModel: Model<LearningAttemptDocument>,
    @InjectModel(ActivityEvent.name)
    private readonly eventModel: Model<ActivityEventDocument>,
    @InjectModel(UserLearningProfile.name)
    private readonly profileModel: Model<UserLearningProfileDocument>,
  ) {}

  async recordAttempt(input: RecordLearningAttemptInput) {
    const userId = new Types.ObjectId(input.userId);
    const submissionId = input.submissionId?.trim() || randomUUID();
    const existing = await this.attemptModel
      .findOne({ userId, submissionId })
      .exec();
    if (existing) return { attempt: existing, created: false };

    const attemptNumber =
      (await this.attemptModel
        .countDocuments({
          userId,
          sourceType: input.sourceType,
          targetId: input.targetId,
        })
        .exec()) + 1;

    try {
      const attempt = await this.attemptModel.create({
        ...input,
        userId,
        submissionId,
        attemptNumber,
        score: Math.max(0, input.score ?? (input.passed ? 1 : 0)),
        maxScore: Math.max(0, input.maxScore ?? 1),
        durationSeconds: Math.max(0, input.durationSeconds ?? 0),
        hintUsed: Math.max(0, input.hintUsed ?? 0),
        topic: this.normalizeTopic(input.topic),
        metadata: input.metadata ?? {},
        attemptedAt: new Date(),
      });
      return { attempt, created: true };
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) throw error;
      const attempt = await this.attemptModel
        .findOne({ userId, submissionId })
        .orFail()
        .exec();
      return { attempt, created: false };
    }
  }

  async recordEvent(input: RecordActivityEventInput) {
    const userId = new Types.ObjectId(input.userId);
    const existing = await this.eventModel
      .findOne({ userId, idempotencyKey: input.idempotencyKey })
      .exec();
    if (existing) return { event: existing, created: false };

    try {
      const event = await this.eventModel.create({
        ...input,
        userId,
        topic: input.topic ? this.normalizeTopic(input.topic) : undefined,
        metadata: input.metadata ?? {},
        occurredAt: input.occurredAt ?? new Date(),
      });
      return { event, created: true };
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) throw error;
      const event = await this.eventModel
        .findOne({ userId, idempotencyKey: input.idempotencyKey })
        .orFail()
        .exec();
      return { event, created: false };
    }
  }

  async getRecentAttempts(userId: string, limit = 100) {
    return this.attemptModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ attemptedAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 500))
      .lean()
      .exec();
  }

  async refreshProfile(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const [attempts, missionEvents] = await Promise.all([
      this.attemptModel
        .find({ userId: userObjectId, attemptedAt: { $gte: since } })
        .sort({ attemptedAt: -1 })
        .limit(500)
        .lean()
        .exec(),
      this.eventModel
        .find({
          userId: userObjectId,
          eventType: {
            $in: ['MISSION_OPENED', 'MISSION_COMPLETED', 'MISSION_DISMISSED'],
          },
          occurredAt: { $gte: since },
        })
        .lean()
        .exec(),
    ]);

    const topicStats = this.buildTopicStats(attempts);
    const passedCount = attempts.filter((attempt) => attempt.passed).length;
    const totalDuration = attempts.reduce(
      (sum, attempt) => sum + (attempt.durationSeconds ?? 0),
      0,
    );
    const opened = missionEvents.filter(
      (event) => event.eventType === 'MISSION_OPENED',
    ).length;
    const completed = missionEvents.filter(
      (event) => event.eventType === 'MISSION_COMPLETED',
    ).length;
    const dismissed = missionEvents.filter(
      (event) => event.eventType === 'MISSION_DISMISSED',
    ).length;
    const modes = attempts
      .map((attempt) => attempt.mode)
      .filter((mode): mode is string => Boolean(mode));

    const profile = await this.profileModel
      .findOneAndUpdate(
        { userId: userObjectId },
        {
          $set: {
            recentAccuracy:
              attempts.length === 0 ? 0 : passedCount / attempts.length,
            averageDurationSeconds:
              attempts.length === 0
                ? 0
                : Math.round(totalDuration / attempts.length),
            missionCompletionRate:
              opened === 0 ? 0 : Math.min(1, completed / opened),
            missionDismissRate:
              opened === 0 ? 0 : Math.min(1, dismissed / opened),
            topicStats,
            weakTopics: topicStats
              .filter((stat) => stat.attempts >= 2 && stat.accuracy < 0.7)
              .slice(0, 5)
              .map((stat) => stat.topic),
            strongTopics: topicStats
              .filter((stat) => stat.attempts >= 2 && stat.accuracy >= 0.85)
              .slice(0, 5)
              .map((stat) => stat.topic),
            preferredDifficulty: this.resolvePreferredDifficulty(modes),
            confidence: this.resolveConfidence(attempts.length),
            profileVersion: 1,
            lastActiveAt: attempts[0]?.attemptedAt,
            calculatedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();

    return profile;
  }

  async getActivityHistory(userId: string, limit = 50) {
    return this.eventModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ occurredAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 200))
      .lean()
      .exec();
  }

  private buildTopicStats(
    attempts: Array<{
      topic: string;
      targetId: string;
      passed: boolean;
      score?: number;
      maxScore?: number;
      primaryMistake?: string;
      attemptedAt: Date;
    }>,
  ): TopicLearningStat[] {
    const grouped = new Map<string, typeof attempts>();
    for (const attempt of attempts) {
      const topic = this.normalizeTopic(attempt.topic || 'general');
      grouped.set(topic, [...(grouped.get(topic) ?? []), attempt]);
    }

    return [...grouped.entries()]
      .map(([topic, rows]) => {
        const passedAttempts = rows.filter((row) => row.passed).length;
        const scorePercentSum = rows.reduce((sum, row) => {
          const maxScore = row.maxScore ?? 0;
          return sum + (maxScore > 0 ? (row.score ?? 0) / maxScore : 0);
        }, 0);
        const uniqueTargets = new Set(rows.map((row) => row.targetId)).size;
        const mistakes = rows
          .map((row) => row.primaryMistake)
          .filter((value): value is string => Boolean(value));

        return {
          topic,
          attempts: rows.length,
          passedAttempts,
          accuracy: rows.length === 0 ? 0 : passedAttempts / rows.length,
          averageScorePercent:
            rows.length === 0 ? 0 : scorePercentSum / rows.length,
          retryRate:
            rows.length === 0
              ? 0
              : Math.max(0, rows.length - uniqueTargets) / rows.length,
          primaryMistakes: [...new Set(mistakes)].slice(0, 3),
          lastAttemptAt: rows[0]?.attemptedAt ?? new Date(0),
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
  }

  private resolvePreferredDifficulty(modes: string[]) {
    if (modes.length === 0) return 'easy';
    const counts = modes.reduce<Record<string, number>>((result, mode) => {
      result[mode] = (result[mode] ?? 0) + 1;
      return result;
    }, {});
    return [...(['hard', 'medium', 'easy'] as const)].sort(
      (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0),
    )[0];
  }

  private resolveConfidence(attemptCount: number) {
    if (attemptCount === 0) return 'COLD_START';
    if (attemptCount < 5) return 'LOW';
    if (attemptCount < 20) return 'MEDIUM';
    return 'HIGH';
  }

  private normalizeTopic(topic: string) {
    return topic.trim().toLowerCase() || 'general';
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
