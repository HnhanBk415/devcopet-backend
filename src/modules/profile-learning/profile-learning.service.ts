import { Injectable } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { RoadmapService } from '../roadmap/roadmap.service';

@Injectable()
export class ProfileLearningService {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly roadmapService: RoadmapService,
  ) {}

  async getLearningProgress(userId: string) {
    const courses = await this.coursesService.findAll(userId);
    const courseList = Array.isArray(courses) ? courses : [];

    const coursesWithSummary = await Promise.all(
      courseList.map(async (course) => {
        const courseSlug = String(course.slug || course.id);
        const roadmapSummary = await this.roadmapService
          .getRoadmapSummary(courseSlug, userId)
          .catch(() => null);

        return {
          course,
          roadmapSummary,
        };
      }),
    );

    return {
      courses: coursesWithSummary,
    };
  }
}
