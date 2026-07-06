import { Types } from 'mongoose';
import { PetPersonalizationService } from './pet-personalization.service';
import type { PetBehaviorConfig, PetTone } from './personality-engine.types';

function createUserModel(petName = 'Mochi') {
  return {
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ petName }),
      }),
    }),
  };
}

function createProfile(input: {
  tone: PetTone;
  dominantTraits: string[];
  topTrait: string;
  messageLength?: PetBehaviorConfig['messageLength'];
}) {
  return {
    config: {
      tone: input.tone,
      directness: 0.5,
      encouragementLevel: 0.7,
      challengeLevel: 0.5,
      messageLength: input.messageLength ?? 'medium',
      useCompetition: input.topTrait === 'competitive',
      useProgressEvidence: input.topTrait === 'analytical',
      reminderStyle: 'supportive',
      reminderFrequency: 'medium',
      learningMode: 'solo',
    },
    personalityFound: true,
    dominantTraits: input.dominantTraits,
    topTrait: input.topTrait,
    defaultUsed: false,
  };
}

function createService(
  petName: string,
  profile: ReturnType<typeof createProfile>,
) {
  return new PetPersonalizationService(
    createUserModel(petName) as never,
    {
      getPersonalizationProfile: jest.fn().mockResolvedValue(profile),
    } as never,
  );
}

describe('PetPersonalizationService', () => {
  const userId = new Types.ObjectId().toHexString();
  const baseText = 'Variables store reusable values.';

  it('uses petName in every correct explanation', async () => {
    const service = createService(
      'Mochi',
      createProfile({
        tone: 'gentle',
        dominantTraits: ['empathetic'],
        topTrait: 'empathetic',
      }),
    );

    const result = await service.personalizeText({
      userId,
      baseText,
      fallbackText: 'This matches the key rule.',
      context: { interactionType: 'challenge_correct', mode: 'easy' },
    });

    expect(result.speaker).toEqual({ name: 'Mochi', type: 'PET' });
    expect(result.text).toContain('Mochi');
    expect(result.text).toContain(baseText);
  });

  it('does not append generic education phrases or force ellipsis', async () => {
    const service = createService(
      'LogicBot',
      createProfile({
        tone: 'analytical',
        dominantTraits: ['analytical'],
        topTrait: 'analytical',
        messageLength: 'short',
      }),
    );
    const detailedBase =
      'The command is python app.py because the terminal sends the saved file name to the Python interpreter, which then executes that exact file from top to bottom.';

    const result = await service.personalizeText({
      userId,
      baseText: detailedBase,
      fallbackText: 'This matches the key rule.',
      context: {
        interactionType: 'challenge_correct',
        mode: 'easy',
        challengeType: 'multiple_choice',
      },
    });

    expect(result.text).toContain(detailedBase);
    expect(result.text).not.toContain(
      'The key is to understand each step without rushing',
    );
    expect(result.text).not.toContain('This is a foundation concept');
    expect(result.text).not.toContain('...');
  });

  it('uses the top trait for short praise messages', () => {
    const service = createService(
      'Mochi',
      createProfile({
        tone: 'gentle',
        dominantTraits: ['empathetic'],
        topTrait: 'empathetic',
      }),
    );

    expect(service.getPraiseMessage('gentle', 'analytical')).toBe(
      'Correct logic.',
    );
    expect(service.getPraiseMessage('gentle', 'empathetic')).toBe(
      'Nice work - you handled that carefully.',
    );
    expect(service.getPraiseMessage('motivational', 'competitive')).toBe(
      'Checkpoint cleared.',
    );
  });

  it('produces different text for analytical and empathetic users', async () => {
    const analytical = createService(
      'LogicBot',
      createProfile({
        tone: 'analytical',
        dominantTraits: ['analytical'],
        topTrait: 'analytical',
        messageLength: 'detailed',
      }),
    );
    const empathetic = createService(
      'Mochi',
      createProfile({
        tone: 'gentle',
        dominantTraits: ['empathetic'],
        topTrait: 'empathetic',
      }),
    );

    const input = {
      userId,
      baseText,
      fallbackText: 'This matches the key rule.',
      context: {
        interactionType: 'challenge_correct' as const,
        mode: 'medium' as const,
        challengeType: 'multiple_choice',
      },
    };

    const a = await analytical.personalizeText(input);
    const b = await empathetic.personalizeText(input);
    expect(a.text).not.toBe(b.text);
    expect(a.text).toContain('LogicBot');
    expect(b.text).toContain('Mochi');
  });

  it('produces different text for competitive and independent users', async () => {
    const competitive = createService(
      'Blaze',
      createProfile({
        tone: 'motivational',
        dominantTraits: ['competitive'],
        topTrait: 'competitive',
      }),
    );
    const independent = createService(
      'Solo',
      createProfile({
        tone: 'direct',
        dominantTraits: ['independent'],
        topTrait: 'independent',
        messageLength: 'short',
      }),
    );

    const input = {
      userId,
      baseText,
      fallbackText: 'This matches the key rule.',
      context: { interactionType: 'challenge_correct' as const },
    };

    const a = await competitive.personalizeText(input);
    const b = await independent.personalizeText(input);
    expect(a.text).not.toBe(b.text);
  });

  it('does not include base explanation or answer-looking strings in wrong feedback', async () => {
    const service = createService(
      'Bolt',
      createProfile({
        tone: 'playful',
        dominantTraits: ['creative'],
        topTrait: 'creative',
      }),
    );

    const result = await service.personalizeText({
      userId,
      baseText: 'The correct answer is B. DROP_ZONE_A is O(1).',
      fallbackText: 'Try again.',
      context: {
        interactionType: 'challenge_wrong',
        mode: 'hard',
        challengeType: 'drag_drop',
      },
    });

    expect(result.text).toContain('Bolt');
    expect(result.text).not.toContain('correct answer');
    expect(result.text).not.toContain('DROP_ZONE_A');
    expect(result.text).not.toContain('O(1)');
    expect(result.tone).toBe('playful');
  });

  it('short messageLength produces shorter output than detailed', async () => {
    const shortService = createService(
      'Solo',
      createProfile({
        tone: 'direct',
        dominantTraits: ['independent'],
        topTrait: 'independent',
        messageLength: 'short',
      }),
    );
    const detailedService = createService(
      'LogicBot',
      createProfile({
        tone: 'analytical',
        dominantTraits: ['analytical'],
        topTrait: 'analytical',
        messageLength: 'detailed',
      }),
    );

    const input = {
      userId,
      baseText:
        'The variable is updated before the condition is checked, so the final output follows the updated value.',
      fallbackText: 'This matches the key rule.',
      context: {
        interactionType: 'challenge_correct' as const,
        mode: 'hard' as const,
        challengeType: 'code_trace',
      },
    };

    const shortResult = await shortService.personalizeText(input);
    const detailedResult = await detailedService.personalizeText(input);
    expect(shortResult.text.length).toBeLessThan(detailedResult.text.length);
  });

  it('returns debug meta with tone, dominantTraits, and defaultUsed', async () => {
    const service = createService(
      'Mochi',
      createProfile({
        tone: 'gentle',
        dominantTraits: ['empathetic'],
        topTrait: 'empathetic',
      }),
    );

    const result = await service.personalizeText({
      userId,
      baseText,
      fallbackText: 'This matches the key rule.',
      context: { interactionType: 'challenge_correct' },
    });

    expect(result.meta).toMatchObject({
      petName: 'Mochi',
      tone: 'gentle',
      dominantTraits: ['empathetic'],
      defaultUsed: false,
    });
  });
});
