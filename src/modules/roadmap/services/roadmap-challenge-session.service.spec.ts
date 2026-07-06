import { HttpException } from '@nestjs/common';
import { RoadmapChallengeSessionService } from './roadmap-challenge-session.service';

function createService(session: Record<string, unknown> | null) {
  const sessionModel = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(session),
    }),
  };

  return {
    service: new RoadmapChallengeSessionService(
      sessionModel as never,
      {} as never,
      {} as never,
      {} as never,
    ),
    sessionModel,
  };
}

describe('RoadmapChallengeSessionService', () => {
  it('rejects a failed session so retry must use a new in-progress session', async () => {
    const { service } = createService({
      id: 'session-a',
      userId: 'user-1',
      courseSlug: 'python-basic',
      mode: 'easy',
      nodeId: 'node-1',
      status: 'FAILED',
      expiresAt: new Date(Date.now() + 60_000),
    });

    try {
      await service.assertReadyForSubmit({
        userId: 'user-1',
        courseSlug: 'python-basic',
        mode: 'easy',
        nodeId: 'node-1',
        sessionId: 'session-a',
      });
      throw new Error('Expected failed session to be rejected.');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(409);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: 'SESSION_NOT_IN_PROGRESS',
      });
    }
  });
});
