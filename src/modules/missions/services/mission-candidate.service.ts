import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Chapter,
  ChapterDocument,
} from '../../chapters/schemas/chapter.schema';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';
import { LearningHistoryService } from '../../learning-history/learning-history.service';
import { Lesson, LessonDocument } from '../../lessons/schemas/lesson.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from '../../progress/schemas/lesson-progress.schema';
import {
  RoadmapProgress,
  RoadmapProgressDocument,
} from '../../roadmap/schemas/roadmap-progress.schema';
import type { RoadmapMode } from '../../roadmap/roadmap.types';
import type {
  LearningSnapshot,
  MissionCandidate,
  MissionKind,
  MissionSourceType,
} from '../missions.types';

type LeanLesson = Lesson & { _id: Types.ObjectId };

@Injectable()
export class MissionCandidateService {
  constructor(
    private readonly learningHistoryService: LearningHistoryService,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<ChapterDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(RoadmapProgress.name)
    private readonly roadmapProgressModel: Model<RoadmapProgressDocument>,
  ) {}

  async build(
    userId: string,
    snapshot: LearningSnapshot,
    kind: MissionKind,
  ): Promise<MissionCandidate[]> {
    const userObjectId = new Types.ObjectId(userId);
    const [courses, completedLessons, recentAttempts, roadmapRows] =
      await Promise.all([
        this.courseModel
          .find({ isPublished: true })
          .sort({ order: 1 })
          .lean<Array<Course & { _id: Types.ObjectId }>>()
          .exec(),
        this.lessonProgressModel
          .find({ userId: userObjectId, completed: true })
          .select({ lessonId: 1, updatedAt: 1 })
          .lean<Array<{ lessonId: Types.ObjectId; updatedAt?: Date }>>()
          .exec(),
        this.learningHistoryService.getRecentAttempts(userId, 100),
        this.roadmapProgressModel
          .find({ userId })
          .select({ nodeId: 1 })
          .limit(20)
          .lean<Array<{ nodeId: string }>>()
          .exec(),
      ]);

    const completedLessonIds = new Set(
      completedLessons.map((row) => String(row.lessonId)),
    );
    const isStarter =
      completedLessonIds.size === 0 &&
      recentAttempts.length === 0 &&
      roadmapRows.length === 0 &&
      snapshot.weakTopics.length === 0;

    if (isStarter) {
      return this.buildStarterCandidates(courses, kind, snapshot);
    }

    const candidates: MissionCandidate[] = [];

    for (const course of courses) {
      const chapters = await this.chapterModel
        .find({ courseId: course._id, isPublished: true })
        .sort({ order: 1 })
        .select({ _id: 1 })
        .lean<Array<{ _id: Types.ObjectId }>>()
        .exec();
      const lessons = await this.lessonModel
        .find({
          chapterId: { $in: chapters.map((chapter) => chapter._id) },
          isPublished: true,
        })
        .sort({ order: 1 })
        .lean<LeanLesson[]>()
        .exec();
      const availableLesson = lessons.find(
        (lesson, index) =>
          !completedLessonIds.has(String(lesson._id)) &&
          (index === 0 ||
            completedLessonIds.has(String(lessons[index - 1]._id))),
      );

      if (availableLesson) {
        candidates.push(
          this.lessonCandidate(
            course.slug,
            availableLesson,
            'CONTINUE_LESSON',
            'PROGRESS_BASED',
            snapshot,
          ),
          this.lessonCandidate(
            course.slug,
            availableLesson,
            'PASS_QUIZ',
            'PROGRESS_BASED',
            snapshot,
          ),
        );

        const roadmapCompleted = await this.roadmapProgressModel.exists({
          userId,
          courseSlug: course.slug,
          mode: 'easy',
          nodeId: String(availableLesson._id),
        });
        if (!roadmapCompleted) {
          candidates.push({
            candidateId: `roadmap:easy:${String(availableLesson._id)}`,
            actionType: 'COMPLETE_ROADMAP_NODE',
            targetType: 'NODE',
            targetId: String(availableLesson._id),
            topic: this.topicFromLesson(availableLesson),
            title: `Complete ${availableLesson.title}`.slice(0, 45),
            message: 'Finish the next checkpoint on your roadmap.',
            href: `/roadmaps/${course.slug}/easy/nodes/${String(availableLesson._id)}`,
            difficulty: 'easy',
            estimatedMinutes: Math.max(
              5,
              availableLesson.estimatedMinutes || 5,
            ),
            rewardXp: 20,
            expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
            sourceType: 'ROADMAP_STATE',
            generatedReason: 'Next available easy roadmap checkpoint.',
            metadata: { courseSlug: course.slug, mode: 'easy' },
          });
        }
      }

      const reviewLesson = [...lessons]
        .reverse()
        .find((lesson) => completedLessonIds.has(String(lesson._id)));
      if (reviewLesson) {
        candidates.push(
          this.lessonCandidate(
            course.slug,
            reviewLesson,
            'REVIEW_LESSON',
            'PROGRESS_BASED',
            snapshot,
          ),
        );
      }
    }

    const failedRoadmapTargets = recentAttempts.filter(
      (attempt) => attempt.sourceType === 'ROADMAP' && !attempt.passed,
    );
    for (const attempt of failedRoadmapTargets.slice(0, 5)) {
      const mode = this.asRoadmapMode(attempt.mode);
      const completed = await this.roadmapProgressModel.exists({
        userId,
        nodeId: attempt.targetId,
        ...(attempt.courseSlug ? { courseSlug: attempt.courseSlug } : {}),
        ...(mode ? { mode } : {}),
      });
      if (completed) continue;
      const retryHref =
        typeof attempt.metadata?.href === 'string'
          ? attempt.metadata.href
          : `/roadmaps/${attempt.courseSlug ?? 'python-basic'}/${attempt.mode ?? 'easy'}/nodes/${attempt.targetId}`;
      candidates.push({
        candidateId: `retry:${attempt.mode ?? 'easy'}:${attempt.targetId}`,
        actionType: 'RETRY_NODE',
        targetType: 'NODE',
        targetId: attempt.targetId,
        topic: attempt.topic,
        title: `Retry ${this.humanize(attempt.topic)}`.slice(0, 45),
        message: 'Try the checkpoint that challenged you and finish it.',
        href: retryHref,
        ctaPath: retryHref.endsWith('/challenge')
          ? retryHref
          : `${retryHref}/challenge`,
        difficulty: mode ?? 'easy',
        estimatedMinutes: 8,
        rewardXp: mode === 'hard' ? 40 : 25,
        expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
        sourceType: 'ROADMAP_STATE',
        generatedReason: 'Recent failed roadmap attempt that is not completed.',
        metadata: {
          courseSlug: attempt.courseSlug,
          mode,
          previousMistake: attempt.primaryMistake,
        },
      });
    }

    for (const topic of snapshot.weakTopics.slice(0, 3)) {
      candidates.push({
        candidateId: `practice-topic:${topic}`,
        actionType: 'PRACTICE_TOPIC',
        targetType: 'TOPIC',
        targetId: topic,
        topic,
        title: `Strengthen ${this.humanize(topic)}`.slice(0, 45),
        message: 'Complete one correct challenge in this weak topic.',
        href: '/roadmaps',
        difficulty:
          snapshot.preferredDifficulty === 'hard'
            ? 'hard'
            : snapshot.preferredDifficulty === 'medium'
              ? 'medium'
              : 'easy',
        estimatedMinutes: 7,
        rewardXp: 20,
        expectedEventTypes: ['ROADMAP_ATTEMPTED', 'QUIZ_ATTEMPTED'],
        sourceType: 'WEAK_TOPIC',
        generatedReason: 'Weak topic detected from recent learning attempts.',
      });
    }

    candidates.push({
      candidateId: 'daily:feed-pet',
      actionType: 'FEED_PET',
      targetType: 'PET',
      targetId: 'my-pet',
      title: 'Check your pet progress',
      message: 'Feed your pet once before you continue learning.',
      href: '/pet',
      difficulty: 'easy',
      estimatedMinutes: 1,
      rewardXp: 5,
      expectedEventTypes: ['PET_FED'],
      sourceType: 'PET_TONE',
      generatedReason: 'Daily pet/profile engagement.',
    });

    const unique = [
      ...new Map(candidates.map((item) => [item.candidateId, item])).values(),
    ];
    if (kind === 'HARDCORE') {
      return unique
        .filter((candidate) => candidate.actionType !== 'FEED_PET')
        .map((candidate) => ({
          ...candidate,
          difficulty: 'hard' as const,
          rewardXp: Math.max(50, candidate.rewardXp),
          estimatedMinutes: Math.max(10, candidate.estimatedMinutes),
          candidateId: `hardcore:${candidate.candidateId}`,
          title: `Hardcore: ${candidate.title}`.slice(0, 45),
          actionType:
            candidate.actionType === 'PASS_QUIZ' ? 'HARD_QUIZ' : 'HARD_LEVEL',
          sourceType: candidate.sourceType ?? 'PROGRESS_BASED',
          generatedReason:
            candidate.generatedReason ?? 'Optional challenge after normals.',
        }));
    }
    return unique;
  }

  private async buildStarterCandidates(
    courses: Array<Course & { _id: Types.ObjectId }>,
    kind: MissionKind,
    snapshot: LearningSnapshot,
  ): Promise<MissionCandidate[]> {
    const course = courses[0];
    if (!course) return [];

    const lesson = await this.findFirstPublishedLesson(course._id);
    if (!lesson) return [];

    const lessonMission = this.lessonCandidate(
      course.slug,
      lesson,
      'CONTINUE_LESSON',
      'STARTER',
      snapshot,
    );
    const topic = this.topicFromLesson(lesson);
    const starter: MissionCandidate[] = [
      {
        ...lessonMission,
        candidateId: `starter:first-lesson:${String(lesson._id)}`,
        title: 'Complete your first Python lesson',
        message: this.withToneMessage(
          'Start with one beginner lesson today.',
          snapshot,
        ),
        generatedReason: 'Starter mission for a new learner.',
      },
      {
        candidateId: `starter:first-roadmap:${String(lesson._id)}`,
        actionType: 'COMPLETE_ROADMAP_NODE',
        targetType: 'NODE',
        targetId: String(lesson._id),
        topic,
        title: 'Start your first roadmap challenge',
        message: this.withToneMessage(
          'Open the first checkpoint and finish it.',
          snapshot,
        ),
        href: `/roadmaps/${course.slug}/easy/nodes/${String(lesson._id)}`,
        difficulty: 'easy',
        estimatedMinutes: Math.max(5, lesson.estimatedMinutes || 5),
        rewardXp: 20,
        expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
        sourceType: 'STARTER',
        generatedReason: 'Starter mission for first roadmap challenge.',
        metadata: { courseSlug: course.slug, mode: 'easy' },
      },
      {
        candidateId: `starter:review-concept:${topic}`,
        actionType: 'LIGHT_PRACTICE',
        targetType: 'TOPIC',
        targetId: topic,
        topic,
        title: 'Review a beginner Python concept',
        message: this.withToneMessage(
          'Practice one small Python basic concept.',
          snapshot,
        ),
        href: `/lessons/${String(lesson._id)}`,
        difficulty: 'easy',
        estimatedMinutes: 5,
        rewardXp: 15,
        expectedEventTypes: ['ROADMAP_ATTEMPTED', 'QUIZ_ATTEMPTED'],
        sourceType: 'STARTER',
        generatedReason: 'Starter mission for light concept practice.',
      },
      {
        candidateId: 'starter:check-pet-progress',
        actionType: 'FEED_PET',
        targetType: 'PET',
        targetId: 'my-pet',
        title: 'Check your pet progress',
        message: this.withToneMessage(
          'Visit your pet/profile and feed your companion.',
          snapshot,
        ),
        href: '/pet',
        difficulty: 'easy',
        estimatedMinutes: 1,
        rewardXp: 5,
        expectedEventTypes: ['PET_FED'],
        sourceType: 'STARTER',
        generatedReason: 'Starter mission for pet/profile discovery.',
      },
      {
        candidateId: `starter:hardcore:${String(lesson._id)}`,
        actionType: 'HARD_LEVEL',
        targetType: 'NODE',
        targetId: String(lesson._id),
        topic,
        title: 'Hardcore: first checkpoint',
        message: this.withToneMessage(
          'Unlock this after finishing all normal missions.',
          snapshot,
        ),
        href: `/roadmaps/${course.slug}/easy/nodes/${String(lesson._id)}`,
        difficulty: 'hard',
        estimatedMinutes: 10,
        rewardXp: 50,
        expectedEventTypes: ['ROADMAP_NODE_COMPLETED'],
        sourceType: 'STARTER',
        generatedReason: 'Locked starter hardcore mission.',
        metadata: { courseSlug: course.slug, mode: 'easy' },
      },
    ];

    return kind === 'HARDCORE' ? [starter[4]] : starter.slice(0, 4);
  }

  private async findFirstPublishedLesson(courseId: Types.ObjectId) {
    const chapters = await this.chapterModel
      .find({ courseId, isPublished: true })
      .sort({ order: 1 })
      .select({ _id: 1 })
      .lean<Array<{ _id: Types.ObjectId }>>()
      .exec();

    if (chapters.length === 0) return null;

    return this.lessonModel
      .findOne({
        chapterId: { $in: chapters.map((chapter) => chapter._id) },
        isPublished: true,
      })
      .sort({ order: 1 })
      .lean<LeanLesson | null>()
      .exec();
  }

  private lessonCandidate(
    courseSlug: string,
    lesson: LeanLesson,
    actionType: 'CONTINUE_LESSON' | 'PASS_QUIZ' | 'REVIEW_LESSON',
    sourceType: MissionSourceType,
    snapshot: LearningSnapshot,
  ): MissionCandidate {
    const id = String(lesson._id);
    const topic = this.topicFromLesson(lesson);
    const definitions = {
      CONTINUE_LESSON: {
        title: `Continue ${lesson.title}`,
        message: 'Complete the next lesson in your learning path.',
        events: ['LESSON_COMPLETED'] as const,
        rewardXp: 20,
      },
      PASS_QUIZ: {
        title: `Pass the ${lesson.title} quiz`,
        message: 'Take the lesson quiz and reach the required score.',
        events: ['QUIZ_ATTEMPTED', 'LESSON_COMPLETED'] as const,
        rewardXp: 20,
      },
      REVIEW_LESSON: {
        title: `Review ${lesson.title}`,
        message: 'Retake the quiz to strengthen what you learned.',
        events: ['QUIZ_ATTEMPTED'] as const,
        rewardXp: 15,
      },
    }[actionType];
    return {
      candidateId: `${actionType.toLowerCase()}:${id}`,
      actionType,
      targetType: 'LESSON',
      targetId: id,
      topic,
      title: definitions.title.slice(0, 45),
      message: this.withToneMessage(definitions.message, snapshot),
      href: `/lessons/${id}`,
      difficulty: 'easy',
      estimatedMinutes: Math.max(5, lesson.estimatedMinutes || 5),
      rewardXp: definitions.rewardXp,
      expectedEventTypes: [...definitions.events],
      sourceType,
      generatedReason:
        sourceType === 'STARTER'
          ? 'Starter mission for early account progress.'
          : 'Next useful lesson action from course progress.',
      metadata: { courseSlug },
    };
  }

  private withToneMessage(message: string, snapshot: LearningSnapshot) {
    const traits = snapshot.personality.dominantTraits;
    if (traits.includes('competitive')) {
      return `${message} Aim for a clean win.`.slice(0, 120);
    }
    if (traits.includes('analytical')) {
      return `${message} Notice the key rule as you go.`.slice(0, 120);
    }
    if (traits.includes('curious') || traits.includes('creative')) {
      return `${message} Explore one detail that surprises you.`.slice(0, 120);
    }
    return message;
  }

  private topicFromLesson(lesson: LeanLesson) {
    return (lesson.slug || lesson.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  private humanize(value: string) {
    return value
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private asRoadmapMode(value?: string): RoadmapMode | undefined {
    return value === 'easy' || value === 'medium' || value === 'hard'
      ? value
      : undefined;
  }
}
