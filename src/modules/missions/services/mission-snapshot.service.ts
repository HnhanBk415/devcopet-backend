import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LearningHistoryService } from '../../learning-history/learning-history.service';
import {
  UserPersonality,
  UserPersonalityDocument,
} from '../../onboarding/schemas/user-personality.schema';
import type { LearningSnapshot } from '../missions.types';

@Injectable()
export class MissionSnapshotService {
  constructor(
    private readonly learningHistoryService: LearningHistoryService,
    @InjectModel(UserPersonality.name)
    private readonly personalityModel: Model<UserPersonalityDocument>,
  ) {}

  async build(userId: string): Promise<LearningSnapshot> {
    const [profile, personality] = await Promise.all([
      this.learningHistoryService.refreshProfile(userId),
      this.personalityModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .lean()
        .exec(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      confidence: profile?.confidence ?? 'COLD_START',
      recentAccuracy: profile?.recentAccuracy ?? 0,
      averageDurationSeconds: profile?.averageDurationSeconds ?? 0,
      missionCompletionRate: profile?.missionCompletionRate ?? 0,
      missionDismissRate: profile?.missionDismissRate ?? 0,
      weakTopics: profile?.weakTopics ?? [],
      strongTopics: profile?.strongTopics ?? [],
      topicStats: profile?.topicStats ?? [],
      preferredDifficulty: profile?.preferredDifficulty ?? 'easy',
      personality: {
        dominantTraits: personality?.dominantTraits ?? [],
        analytical: personality?.analyticalNorm ?? 0.5,
        creative: personality?.creativeNorm ?? 0.5,
        disciplined: personality?.disciplinedNorm ?? 0.5,
        competitive: personality?.competitiveNorm ?? 0.5,
        adaptable: personality?.adaptableNorm ?? 0.5,
        curious: personality?.curiousNorm ?? 0.5,
      },
    };
  }
}
