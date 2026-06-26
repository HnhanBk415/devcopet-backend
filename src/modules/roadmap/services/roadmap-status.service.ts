import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RoadmapProgress,
  RoadmapProgressDocument,
} from '../schemas/roadmap-progress.schema';
import type {
  RoadmapCompletion,
  RoadmapCompletionReview,
  RoadmapMode,
  RoadmapStatus,
} from '../roadmap.types';

export type RoadmapCompletionSummary = {
  completedNodes: number;
  totalNodes: number;
  percent: number;
  complete: boolean;
};

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
    review?: RoadmapCompletionReview,
  ): Promise<void> {
    await this.tryMarkNodeCompleted(userId, courseSlug, mode, nodeId, review);
  }

  async tryMarkNodeCompleted(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    nodeId: string,
    review?: RoadmapCompletionReview,
  ): Promise<boolean> {
    const completedAt = review?.completedAt
      ? new Date(review.completedAt)
      : new Date();
    const setOnInsert: Partial<RoadmapProgress> = {
      userId,
      courseSlug,
      mode,
      nodeId,
      completedAt,
      ...(review ? { review } : {}),
    };

    const result = await this.roadmapProgressModel
      .updateOne(
        { userId, courseSlug, mode, nodeId },
        { $setOnInsert: setOnInsert },
        { upsert: true },
      )
      .exec();

    return result.upsertedCount > 0;
  }

  async getCompletionSummary(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    orderedNodeIds: string[],
  ): Promise<RoadmapCompletionSummary> {
    const completedNodeIds = await this.getCompletedNodeIds(
      userId,
      courseSlug,
      mode,
    );
    const completedNodes = orderedNodeIds.filter((nodeId) =>
      completedNodeIds.has(nodeId),
    ).length;
    const totalNodes = orderedNodeIds.length;

    return {
      completedNodes,
      totalNodes,
      percent:
        totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100),
      complete: totalNodes > 0 && completedNodes === totalNodes,
    };
  }

  async getNodeCompletion(
    userId: string,
    courseSlug: string,
    mode: RoadmapMode,
    nodeId: string,
  ): Promise<RoadmapCompletion | null> {
    const row = await this.roadmapProgressModel
      .findOne({ userId, courseSlug, mode, nodeId })
      .select({ completedAt: 1, review: 1 })
      .lean<RoadmapCompletion | null>()
      .exec();

    return row;
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
