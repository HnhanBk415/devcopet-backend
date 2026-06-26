import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../progress/schemas/lesson-progress.schema';
import {
  RoadmapProgress,
  RoadmapProgressDocument,
} from '../roadmap/schemas/roadmap-progress.schema';
import { Pet, PetDocument } from '../pets/schemas/pet.schema';

type MissionStatus = 'active' | 'completed';

type MissionResponse = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardXp: number;
  status: MissionStatus;
};

@Injectable()
export class MissionsService {
  constructor(
    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(RoadmapProgress.name)
    private readonly roadmapProgressModel: Model<RoadmapProgressDocument>,
    @InjectModel(Pet.name)
    private readonly petModel: Model<PetDocument>,
  ) {}

  async getMyMissions(userId: string): Promise<MissionResponse[]> {
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : null;

    const [roadmapNodeCount, lessonCount, pet] = await Promise.all([
      this.roadmapProgressModel.countDocuments({ userId }).exec(),
      userObjectId
        ? this.lessonProgressModel
            .countDocuments({ userId: userObjectId, completed: true })
            .exec()
        : Promise.resolve(0),
      userObjectId
        ? this.petModel
            .findOne({ ownerId: userObjectId })
            .select({ totalFeeds: 1 })
            .lean<Pick<Pet, 'totalFeeds'> | null>()
            .exec()
        : Promise.resolve(null),
    ]);

    return [
      this.buildMission({
        id: 'complete-roadmap-node',
        title: 'Complete 1 roadmap challenge',
        description: 'Finish any roadmap challenge',
        progress: roadmapNodeCount,
        target: 1,
        rewardXp: 50,
      }),
      this.buildMission({
        id: 'complete-lesson',
        title: 'Complete 1 lesson',
        description: 'Complete any course lesson',
        progress: lessonCount,
        target: 1,
        rewardXp: 100,
      }),
      this.buildMission({
        id: 'feed-pet',
        title: 'Feed your pet once',
        description: 'Spend Available XP to feed your pet',
        progress: pet?.totalFeeds ?? 0,
        target: 1,
        rewardXp: 30,
      }),
    ];
  }

  private buildMission(
    input: Omit<MissionResponse, 'status'>,
  ): MissionResponse {
    const progress = Math.min(input.progress, input.target);
    const status: MissionStatus =
      progress >= input.target ? 'completed' : 'active';

    return {
      ...input,
      progress,
      status,
    };
  }
}
