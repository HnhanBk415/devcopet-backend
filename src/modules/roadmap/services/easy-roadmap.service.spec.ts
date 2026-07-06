import { Types } from 'mongoose';
import { EasyRoadmapService } from './easy-roadmap.service';
import type {
  EasyChallengeData,
  EasyNodeContext,
  RoadmapCompletionReview,
} from '../roadmap.types';

const course = {
  _id: new Types.ObjectId(),
  slug: 'python-basic',
  title: 'Python Basic',
};
const chapter = {
  _id: new Types.ObjectId(),
  courseId: course._id,
  slug: 'intro',
  title: 'Intro',
  order: 1,
};
const lesson = {
  _id: new Types.ObjectId(),
  chapterId: chapter._id,
  slug: 'python-role',
  title: 'Python Role',
  order: 1,
};
const nodeContext: EasyNodeContext = {
  node: {
    id: String(lesson._id),
    lessonId: String(lesson._id),
    chapterId: String(chapter._id),
    label: '1.1',
    title: lesson.title,
    status: 'available',
  },
  chapter,
  course,
  lesson,
};
const challenge: EasyChallengeData = {
  id: 'easy-1',
  chapterOrder: 1,
  lessonOrder: 1,
  label: '1.1',
  lessonTitle: lesson.title,
  type: 'multiple_choice',
  promptType: 'concept_mcq',
  title: 'Python Role',
  question: 'What is Python doing when it runs your program?',
  options: [
    { id: 'A', text: 'It follows saved instructions step by step.' },
    { id: 'B', text: 'It guesses what the developer wanted.' },
    { id: 'C', text: 'It fixes syntax errors automatically.' },
    { id: 'D', text: 'It ignores written code.' },
  ],
  correctOptionId: 'A',
  explanation: 'Python executes saved instructions.',
  xp: 50,
  estimatedMinutes: 1,
};

function createService() {
  const queryService = {
    findCourseBySlugOrThrow: jest.fn().mockResolvedValue(course),
    findPublishedChapters: jest.fn().mockResolvedValue([chapter]),
    findPublishedLessons: jest.fn().mockResolvedValue([lesson]),
  };
  const reviewService = {
    toEasyReview: jest.fn(
      (
        _userId: string,
        _challenge: EasyChallengeData,
        selectedOptionId: 'A' | 'B' | 'C' | 'D',
      ): RoadmapCompletionReview => ({
        selectedOptionId,
        correctOptionId: challenge.correctOptionId,
        correct: true,
        explanation: `Current correct answer is ${selectedOptionId}.`,
        explanationSpeaker: { name: 'LogicBot', type: 'PET' },
        explanationTone: 'analytical',
        personalizationMeta: {
          petName: 'LogicBot',
          topTrait: 'analytical',
        },
        completedAt: new Date(0).toISOString(),
      }),
    ),
    toEasyCompletedReview: jest.fn(),
  };
  const statusService = {
    getStatusMap: jest
      .fn()
      .mockResolvedValue(
        new Map<string, string>([[String(lesson._id), 'available']]),
      ),
    tryMarkNodeCompleted: jest.fn().mockResolvedValue(true),
    getNodeCompletion: jest.fn(),
  };
  const usersService = {
    findById: jest.fn().mockResolvedValue({ petName: 'LogicBot' }),
    awardXpWithLevelInfo: jest.fn().mockResolvedValue({
      leveledUp: false,
      level: 1,
      lifetimeXp: 50,
    }),
  };
  const learningHistoryService = {
    recordAttempt: jest.fn().mockResolvedValue(undefined),
    recordEvent: jest.fn().mockResolvedValue({ created: false }),
  };
  const missionsService = {
    processActivityEvent: jest.fn().mockResolvedValue(undefined),
  };
  const notificationService = {
    create: jest.fn().mockResolvedValue(undefined),
  };
  const personalization = {
    personalizeText: jest.fn().mockResolvedValue({
      text: 'LogicBot: Not correct. Trace the requirement -> rule -> result.',
      speaker: { name: 'LogicBot', type: 'PET' },
      tone: 'analytical',
      meta: { petName: 'LogicBot', topTrait: 'analytical' },
    }),
    getPraiseMessage: jest.fn().mockReturnValue('Correct logic.'),
  };

  const service = new EasyRoadmapService(
    {} as never,
    queryService as never,
    reviewService as never,
    statusService as never,
    usersService as never,
    learningHistoryService as never,
    missionsService as never,
    notificationService as never,
    personalization as never,
  );

  jest.spyOn(service, 'getNodeContext').mockResolvedValue(nodeContext);
  jest.spyOn(service, 'findChallenge').mockReturnValue(challenge);

  return {
    service,
    reviewService,
    statusService,
    personalization,
  };
}

describe('EasyRoadmapService retry regression', () => {
  it('does not create review or leak answer fields on wrong submit', async () => {
    const { service, reviewService, statusService, personalization } =
      createService();

    const result = await service.submitNodeChallenge(
      String(lesson._id),
      'B',
      'user-1',
      { sessionId: 'session-a' },
    );

    expect(result).toMatchObject({
      correct: false,
      status: 'FAILED',
      shouldExit: true,
      retryRequired: true,
      explanation: undefined,
      correctOptionId: undefined,
      navigation: { mustReturnToRoadmap: true },
    });
    expect('review' in result).toBe(false);
    expect(reviewService.toEasyReview).not.toHaveBeenCalled();
    expect(statusService.tryMarkNodeCompleted).not.toHaveBeenCalled();
    expect(personalization.personalizeText).toHaveBeenCalledWith(
      expect.objectContaining({
        baseText: '',
        context: expect.objectContaining({
          interactionType: 'challenge_wrong',
          mistakeType: 'B',
        }) as unknown,
      }),
    );
  });

  it('uses only the current correct retry payload for the stored review', async () => {
    const { service, reviewService } = createService();

    await service.submitNodeChallenge(String(lesson._id), 'B', 'user-1', {
      sessionId: 'session-a',
    });
    const retry = await service.submitNodeChallenge(
      String(lesson._id),
      'A',
      'user-1',
      { sessionId: 'session-b' },
    );

    expect(retry.correct).toBe(true);
    expect(retry.review).toMatchObject({
      selectedOptionId: 'A',
      correctOptionId: 'A',
    });
    expect(retry.explanation).toContain('A');
    expect(retry.explanation).not.toContain('B');
    expect(reviewService.toEasyReview).toHaveBeenCalledTimes(1);
    expect(reviewService.toEasyReview).toHaveBeenCalledWith(
      'user-1',
      challenge,
      'A',
    );
  });
});
