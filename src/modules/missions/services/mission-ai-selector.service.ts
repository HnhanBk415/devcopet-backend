import { Injectable, Logger } from '@nestjs/common';
import type {
  AiSelectedMission,
  LearningSnapshot,
  MissionCandidate,
  MissionKind,
  MissionSelectionResult,
} from '../missions.types';
import { MissionFallbackService } from './mission-fallback.service';
import { GeminiProvider } from '../../ai-chat/providers/gemini.provider';

@Injectable()
export class MissionAiSelectorService {
  private readonly logger = new Logger(MissionAiSelectorService.name);

  constructor(
    private readonly fallback: MissionFallbackService,
    private readonly gemini: GeminiProvider,
  ) {}

  async select(
    snapshot: LearningSnapshot,
    candidates: MissionCandidate[],
    kind: MissionKind,
  ): Promise<MissionSelectionResult> {
    const count = 5;

    // We only send minimal data to Gemini to save tokens
    const promptSnapshot = {
      confidence: snapshot.confidence,
      weakTopics: snapshot.weakTopics,
      preferredDifficulty: snapshot.preferredDifficulty,
      personality: snapshot.personality.dominantTraits,
    };

    const promptCandidates = candidates.map((c) => ({
      candidateId: c.candidateId,
      title: c.title,
      message: c.message,
      difficulty: c.difficulty,
      topic: c.topic,
      actionType: c.actionType,
    }));

    const systemPrompt = `You are a gamification AI for a coding learning app.
Your task is to select exactly ${count} mission(s) from the provided candidates list for a user.
Pick exactly 5 diverse missions.
Prioritize:
1. 'CONTINUE_LESSON' to keep them progressing.
2. Weak topics if they exist in the snapshot.
3. Align with their preferred difficulty and personality.
4. DO NOT select duplicate targets (e.g., don't pick PASS_QUIZ and CONTINUE_LESSON for the exact same lesson/topic).
5. Output MUST strictly follow the JSON schema provided.`;

    const userPrompt = `Snapshot: ${JSON.stringify(promptSnapshot)}
Candidates: ${JSON.stringify(promptCandidates)}`;

    try {
      const result = await this.gemini.generate({
        system: systemPrompt,
        user: userPrompt,
        maxOutputTokens: 1000,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            missions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: { type: 'string' },
                  title: { type: 'string' },
                  message: { type: 'string' },
                  reasonCode: {
                    type: 'string',
                    enum: [
                      'CONTINUE_PROGRESS',
                      'WEAK_TOPIC',
                      'RETRY_FAILED',
                      'REVIEW',
                      'DAILY_HABIT',
                      'CHALLENGE',
                    ],
                  },
                },
                required: ['candidateId', 'title', 'message', 'reasonCode'],
              },
            },
          },
          required: ['missions'],
        },
      });

      const parsed = JSON.parse(result.answer) as {
        missions: AiSelectedMission[];
      };

      // Ensure we actually got the right number of valid missions
      if (
        !parsed.missions ||
        !Array.isArray(parsed.missions) ||
        parsed.missions.length !== count
      ) {
        throw new Error(
          `AI returned ${parsed.missions?.length} missions instead of ${count}`,
        );
      }

      // Validate that the returned candidates actually exist
      const validCandidateIds = new Set(candidates.map((c) => c.candidateId));
      for (const m of parsed.missions) {
        if (!validCandidateIds.has(m.candidateId)) {
          throw new Error(`AI returned invalid candidateId: ${m.candidateId}`);
        }
      }

      return {
        source: 'AI',
        missions: parsed.missions,
        aiMetadata: {
          model: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
      };
    } catch (error) {
      this.logger.warn(
        `AI selection failed, falling back to deterministic selection: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return this.fallback.select(snapshot, candidates, kind);
    }
  }
}
