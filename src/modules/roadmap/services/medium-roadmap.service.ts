import { Injectable } from '@nestjs/common';
import { AdvancedRoadmapBaseService } from './advanced-roadmap-base.service';
import { RoadmapChallengeLoaderService } from './roadmap-challenge-loader.service';
import { RoadmapQueryService } from './roadmap-query.service';
import { RoadmapReviewService } from './roadmap-review.service';
import { RoadmapStatusService } from './roadmap-status.service';

import { UsersService } from '../../users/users.service';

@Injectable()
export class MediumRoadmapService extends AdvancedRoadmapBaseService {
  protected readonly mode = 'medium' as const;

  constructor(
    challengeLoader: RoadmapChallengeLoaderService,
    queryService: RoadmapQueryService,
    reviewService: RoadmapReviewService,
    statusService: RoadmapStatusService,
    usersService: UsersService,
  ) {
    super(
      challengeLoader,
      queryService,
      reviewService,
      statusService,
      usersService,
    );
  }
}
