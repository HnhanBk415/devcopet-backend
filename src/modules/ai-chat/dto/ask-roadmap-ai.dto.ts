import { IsEnum } from 'class-validator';

export enum AiPromptIdDto {
  EXPLAIN_NODE = 'EXPLAIN_NODE',
  SIMPLE_EXAMPLE = 'SIMPLE_EXAMPLE',
  COURSE_CONNECTION = 'COURSE_CONNECTION',
  CHALLENGE_HINT = 'CHALLENGE_HINT',
  COMMON_MISTAKE = 'COMMON_MISTAKE',
  NEXT_STEP = 'NEXT_STEP',
}

export class AskRoadmapAiDto {
  @IsEnum(AiPromptIdDto)
  promptId!: AiPromptIdDto;
}
