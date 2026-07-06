import { Types } from 'mongoose';
import { PersonalityEngineService } from './personality-engine.service';

function createModel(personality: unknown) {
  return {
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(personality),
    }),
  };
}

describe('PersonalityEngineService', () => {
  const userId = new Types.ObjectId().toHexString();

  it('returns default gentle config when no personality exists', async () => {
    const service = new PersonalityEngineService(createModel(null) as never);

    await expect(service.getPetBehaviorConfig(userId)).resolves.toMatchObject({
      tone: 'gentle',
      encouragementLevel: 0.7,
    });
    await expect(
      service.getPersonalizationProfile(userId),
    ).resolves.toMatchObject({
      personalityFound: false,
      defaultUsed: true,
      dominantTraits: [],
      config: { tone: 'gentle' },
    });
  });

  it('maps analytical dominant personality to analytical tone', async () => {
    const service = new PersonalityEngineService(
      createModel({
        analyticalNorm: 0.9,
        creativeNorm: 0.1,
        disciplinedNorm: 0.2,
        independentNorm: 0.2,
        empatheticNorm: 0.1,
        competitiveNorm: 0.1,
        adaptableNorm: 0.2,
        curiousNorm: 0.6,
        dominantTraits: ['analytical'],
      }) as never,
    );

    await expect(service.getPetBehaviorConfig(userId)).resolves.toMatchObject({
      tone: 'analytical',
      messageLength: 'detailed',
      useProgressEvidence: true,
    });
  });

  it('maps competitive dominant personality to motivational challenge config', async () => {
    const service = new PersonalityEngineService(
      createModel({
        analyticalNorm: 0.2,
        creativeNorm: 0.1,
        disciplinedNorm: 0.4,
        independentNorm: 0.4,
        empatheticNorm: 0.1,
        competitiveNorm: 0.9,
        adaptableNorm: 0.2,
        curiousNorm: 0.2,
        dominantTraits: ['competitive'],
      }) as never,
    );

    const config = await service.getPetBehaviorConfig(userId);
    expect(config.tone).toBe('motivational');
    expect(config.useCompetition).toBe(true);
    expect(config.challengeLevel).toBeGreaterThan(0.65);
  });

  it('maps empathetic dominant personality to gentle tone', async () => {
    const service = new PersonalityEngineService(
      createModel({
        analyticalNorm: 0.1,
        creativeNorm: 0.1,
        disciplinedNorm: 0.2,
        independentNorm: 0.1,
        empatheticNorm: 0.95,
        competitiveNorm: 0.1,
        adaptableNorm: 0.4,
        curiousNorm: 0.2,
        dominantTraits: ['empathetic'],
      }) as never,
    );

    const config = await service.getPetBehaviorConfig(userId);
    expect(config.tone).toBe('gentle');
    expect(config.encouragementLevel).toBeGreaterThan(0.75);
  });

  it('maps independent dominant personality to direct short config', async () => {
    const service = new PersonalityEngineService(
      createModel({
        analyticalNorm: 0.2,
        creativeNorm: 0.1,
        disciplinedNorm: 0.2,
        independentNorm: 0.95,
        empatheticNorm: 0.1,
        competitiveNorm: 0.2,
        adaptableNorm: 0.2,
        curiousNorm: 0.2,
        dominantTraits: ['independent'],
      }) as never,
    );

    const profile = await service.getPersonalizationProfile(userId);
    expect(profile.config.tone).toBe('direct');
    expect(profile.config.messageLength).toBe('short');
    expect(profile.topTrait).toBe('independent');
    expect(profile.defaultUsed).toBe(false);
  });
});
