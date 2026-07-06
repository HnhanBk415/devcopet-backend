import { RoadmapReviewService } from './roadmap-review.service';
import { ChallengeExplanationBuilderService } from './challenge-explanation-builder.service';
import type { EasyChallengeData } from '../roadmap.types';

describe('RoadmapReviewService', () => {
  const challenge: EasyChallengeData = {
    id: 'c1',
    chapterOrder: 1,
    lessonOrder: 1,
    label: '1.1',
    lessonTitle: 'Variables',
    type: 'multiple_choice',
    promptType: 'concept_mcq',
    title: 'Variables',
    question: 'What do variables do?',
    options: [
      { id: 'A', text: 'Store values' },
      { id: 'B', text: 'Delete code' },
      { id: 'C', text: 'Run servers' },
      { id: 'D', text: 'Format files' },
    ],
    correctOptionId: 'A',
    explanation: 'Variables store reusable values.',
    xp: 50,
    estimatedMinutes: 1,
  };

  it('returns personalized easy review explanation and speaker', async () => {
    const personalizeText = jest
      .fn<Promise<unknown>, [Record<string, unknown>]>()
      .mockResolvedValue({
        text: 'Mochi says: variables store reusable values.',
        speaker: { name: 'Mochi', type: 'PET' },
        tone: 'playful',
        meta: { petName: 'Mochi' },
      });
    const service = new RoadmapReviewService(
      {
        personalizeText,
      } as never,
      new ChallengeExplanationBuilderService(),
    );

    const review = await service.toEasyReview('user-id', challenge, 'A');

    expect(review.explanation).toBe(
      'Mochi says: variables store reusable values.',
    );
    expect(review.explanationSpeaker).toEqual({ name: 'Mochi', type: 'PET' });
    expect(review.explanationTone).toBe('playful');
    expect(review.correctOptionId).toBe('A');
    expect(review.personalizationMeta).toEqual({ petName: 'Mochi' });
    expect(personalizeText).toHaveBeenCalledTimes(1);
  });

  it('re-personalizes stored completed review display explanation', async () => {
    const personalizeText = jest
      .fn<Promise<unknown>, [Record<string, unknown>]>()
      .mockResolvedValue({
        text: 'LogicBot logic check: variables store reusable values.',
        speaker: { name: 'LogicBot', type: 'PET' },
        tone: 'analytical',
        meta: { petName: 'LogicBot', defaultUsed: false },
      });
    const service = new RoadmapReviewService(
      { personalizeText } as never,
      new ChallengeExplanationBuilderService(),
    );

    const review = await service.toEasyCompletedReview('user-id', challenge, {
      completedAt: new Date('2026-01-01T00:00:00.000Z'),
      review: {
        selectedOptionId: 'A',
        correctOptionId: 'A',
        correct: true,
        explanation: 'Stored old explanation.',
        explanationSpeaker: { name: 'OldPet', type: 'PET' },
        explanationTone: 'gentle',
        completedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    expect(review.selectedOptionId).toBe('A');
    expect(review.correctOptionId).toBe('A');
    expect(review.explanation).toBe(
      'LogicBot logic check: variables store reusable values.',
    );
    expect(review.explanationSpeaker).toEqual({
      name: 'LogicBot',
      type: 'PET',
    });
    expect(review.explanationTone).toBe('analytical');
    expect(personalizeText).toHaveBeenCalledTimes(1);
    expect(personalizeText).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          interactionType: 'challenge_review',
        }) as unknown,
      }),
    );
  });
});
