import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
  error?: {
    message?: string;
  };
};

export interface AiGenerateInput {
  system: string;
  user: string;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AiGenerateResult {
  answer: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

@Injectable()
export class GeminiProvider {
  constructor(private readonly configService: ConfigService) {}

  async generate(input: AiGenerateInput): Promise<AiGenerateResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY is not configured.',
      );
    }

    const model = this.getModel();
    const maxOutputTokens = input.maxOutputTokens ?? this.getMaxOutputTokens();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.getTimeoutMs());

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: input.system }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: input.user }],
            },
          ],
          generationConfig: {
            temperature: input.temperature ?? 0.4,
            topP: 0.9,
            maxOutputTokens,
            ...(input.responseMimeType
              ? { responseMimeType: input.responseMimeType }
              : {}),
            ...(input.responseSchema
              ? { responseSchema: input.responseSchema }
              : {}),
          },
        }),
      });

      const data = (await response.json()) as GeminiResponse;
      if (!response.ok) {
        throw new ServiceUnavailableException(
          data.error?.message ?? 'Gemini API request failed.',
        );
      }

      const answer =
        data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? '')
          .join('')
          .trim() ?? '';

      return {
        answer,
        model,
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException('Gemini API request timed out.');
      }

      throw new ServiceUnavailableException(
        error instanceof Error ? error.message : 'Gemini API request failed.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  getModel() {
    return (
      this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash-lite'
    );
  }

  private getMaxOutputTokens() {
    return this.getNumberEnv('AI_MAX_OUTPUT_TOKENS', 300);
  }

  private getTimeoutMs() {
    return this.getNumberEnv('AI_GEMINI_TIMEOUT_MS', 15000);
  }

  private getNumberEnv(key: string, fallback: number) {
    const raw = this.configService.get<string>(key);
    const parsed = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
