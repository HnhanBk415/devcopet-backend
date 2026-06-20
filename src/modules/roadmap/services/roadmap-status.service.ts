import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RoadmapProgress,
  RoadmapProgressDocument,
} from '../schemas/roadmap-progress.schema';
import type { RoadmapMode, RoadmapStatus } from '../roadmap.types';

@Injectable()
export class RoadmapStatusService {
  constructor(
    @InjectModel(RoadmapProgress.name)
    private readonly roadmapProgressModel: Model<RoadmapProgressDocument>,
  ) {}

  async getStatusMap(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    orderedNodeIds: string[],
  ): Promise<Map<string, RoadmapStatus>> {
    const completedNodeIds = await this.getCompletedNodeIds(
      userId,
      courseSlug,
      mode,
    );

    return this.calculateSequentialNodeStatuses(
      orderedNodeIds,
      completedNodeIds,
    );
  }

  calculateSequentialNodeStatuses(
    orderedNodeIds: string[],
    completedNodeIds: Set<string>,
  ): Map<string, RoadmapStatus> {
    const statuses = new Map<string, RoadmapStatus>();
    let foundFirstIncomplete = false;

    for (const nodeId of orderedNodeIds) {
      if (!foundFirstIncomplete && completedNodeIds.has(nodeId)) {
        statuses.set(nodeId, 'completed');
        continue;
      }

      if (!foundFirstIncomplete) {
        statuses.set(nodeId, 'available');
        foundFirstIncomplete = true;
        continue;
      }

      statuses.set(nodeId, 'locked');
    }

    return statuses;
  }

  async markNodeCompleted(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    nodeId: string,
  ): Promise<void> {
    await this.roadmapProgressModel
      .updateOne(
        { userId, courseSlug, mode, nodeId },
        {
          $setOnInsert: {
            userId,
            courseSlug,
            mode,
            nodeId,
            completedAt: new Date(),
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async resetRoadmapProgress(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
  ): Promise<void> {
    await this.roadmapProgressModel
      .deleteMany({ userId, courseSlug, mode })
      .exec();
  }

  private async getCompletedNodeIds(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
  ): Promise<Set<string>> {
    const rows = await this.roadmapProgressModel
      .find({ userId, courseSlug, mode })
      .select({ nodeId: 1 })
      .lean<Array<{ nodeId: string }>>()
      .exec();

    return new Set(rows.map((row) => row.nodeId));
  }
}
