import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../../ai-chat/providers/gemini.provider';
import type {
  AiSelectedMission,
  LearningSnapshot,
  MissionCandidate,
  MissionKind,
  MissionSelectionResult,
} from '../missions.types';
import { MissionFallbackService } from './mission-fallback.service';
import { MissionValidatorService } from './mission-validator.service';

@Injectable()
export class MissionAiSelectorService {
  private readonly logger = new Logger(MissionAiSelectorService.name);

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly validator: MissionValidatorService,
    private readonly fallback: MissionFallbackService,
  ) {}

  async select(
    snapshot: LearningSnapshot,
    candidates: MissionCandidate[],
    kind: MissionKind,
  ): Promise<MissionSelectionResult> {
    const fallback = this.fallback.select(snapshot, candidates, kind);
    const requiredCount = kind === 'HARDCORE' ? 1 : 4;
    if (fallback.missions.length !== requiredCount) return fallback;

    try {
      const result = await this.geminiProvider.generate({
        system: [
          'You personalize learning missions for DevCopet.',
          `Select exactly ${requiredCount} ${kind.toLowerCase()} mission(s).`,
          'Only use candidateId values provided by the backend.',
          'Never invent targets, rewards, URLs, progress, or completion state.',
          'Prioritize weak topics, recent failures, useful progress, diversity, and realistic workload.',
          'Write Vietnamese title (max 45 chars) and message (max 120 chars).',
          'Return JSON only.',
        ].join(' '),
        user: JSON.stringify({
          snapshot,
          candidates: candidates.map((candidate) => ({
            candidateId: candidate.candidateId,
            actionType: candidate.actionType,
            targetType: candidate.targetType,
            topic: candidate.topic,
            difficulty: candidate.difficulty,
            estimatedMinutes: candidate.estimatedMinutes,
            defaultTitle: candidate.title,
            defaultMessage: candidate.message,
          })),
          output: {
            analysisSummary: { focusTopic: 'string', reason: 'string' },
            missions: [
              {
                candidateId: 'string',
                title: 'string',
                message: 'string',
                reasonCode:
                  'CONTINUE_PROGRESS | WEAK_TOPIC | RETRY_FAILED | REVIEW | DAILY_HABIT | CHALLENGE',
              },
            ],
          },
        }),
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 700,
      });
      const parsed = this.parseJson(result.answer) as {
        analysisSummary?: Record<string, unknown>;
        missions?: AiSelectedMission[];
      };
      const missions = parsed.missions ?? [];
      this.validator.validate(missions, candidates, kind);
      return {
        source: 'AI',
        missions,
        analysisSummary: parsed.analysisSummary ?? {},
        aiMetadata: {
          model: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
      };
    } catch (error) {
      this.logger.warn(
        `AI mission selection failed; using fallback: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return fallback;
    }
  }

  private parseJson(raw: string) {
    const trimmed = raw.trim();
    const withoutFence = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    return JSON.parse(withoutFence) as unknown;
  }
}
