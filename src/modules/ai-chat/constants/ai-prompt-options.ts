import type { AiPromptId, RoadmapPromptOption } from '../ai-chat.types';

export const PROMPT_OPTIONS: Record<
  AiPromptId,
  Omit<RoadmapPromptOption, 'label'>
> = {
  EXPLAIN_NODE: {
    id: 'EXPLAIN_NODE',
    description: 'Review the key idea behind this node.',
  },
  SIMPLE_EXAMPLE: {
    id: 'SIMPLE_EXAMPLE',
    description: 'Show a small example connected to this node.',
  },
  COURSE_CONNECTION: {
    id: 'COURSE_CONNECTION',
    description: 'Connect this game node back to the course lesson.',
  },
  CHALLENGE_HINT: {
    id: 'CHALLENGE_HINT',
    description: 'Give a safe hint without revealing the answer.',
  },
  COMMON_MISTAKE: {
    id: 'COMMON_MISTAKE',
    description: 'Point out a common mistake for this node.',
  },
  NEXT_STEP: {
    id: 'NEXT_STEP',
    description: 'Suggest what to do after this node.',
  },
};
