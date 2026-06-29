import { Injectable } from '@nestjs/common';
import { AdvancedRoadmapBaseService } from './advanced-roadmap-base.service';
import { RoadmapChallengeLoaderService } from './roadmap-challenge-loader.service';
import { RoadmapQueryService } from './roadmap-query.service';
import { RoadmapReviewService } from './roadmap-review.service';
import { RoadmapStatusService } from './roadmap-status.service';

import { UsersService } from '../../users/users.service';
import { LearningHistoryService } from '../../learning-history/learning-history.service';
import { MissionsService } from '../../missions/missions.service';
import { MissionNotificationService } from '../../missions/services/mission-notification.service';

@Injectable()
export class HardRoadmapService extends AdvancedRoadmapBaseService {
  protected readonly mode = 'hard' as const;

  constructor(
    challengeLoader: RoadmapChallengeLoaderService,
    queryService: RoadmapQueryService,
    reviewService: RoadmapReviewService,
    statusService: RoadmapStatusService,
    usersService: UsersService,
    learningHistoryService: LearningHistoryService,
    missionsService: MissionsService,
    notificationService: MissionNotificationService,
  ) {
    super(
      challengeLoader,
      queryService,
      reviewService,
      statusService,
      usersService,
      learningHistoryService,
      missionsService,
      notificationService,
    );
  }
}
