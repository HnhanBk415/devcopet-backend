export type RoadmapMode = 'easy' | 'medium' | 'hard';

export type AiPromptId =
  | 'EXPLAIN_NODE'
  | 'SIMPLE_EXAMPLE'
  | 'COURSE_CONNECTION'
  | 'CHALLENGE_HINT'
  | 'COMMON_MISTAKE'
  | 'NEXT_STEP';

export type AiNodeStatus = 'locked' | 'available' | 'completed';

export interface RoadmapPromptOption {
  id: AiPromptId;
  label: string;
  description: string;
}

export interface AiRoadmapContext {
  mode: RoadmapMode;
  course: {
    id?: string;
    slug: string;
    title: string;
  };
  node: {
    id: string;
    label: string;
    title: string;
    status: AiNodeStatus;
    type?: string;
  };
  chapter?: {
    id?: string;
    title: string;
    order: number;
  };
  relatedLesson?: {
    id: string;
    title: string;
    description?: string;
    href: string;
  };
  challenge?: {
    id?: string;
    type: string;
    title: string;
    question: string;
    promptType?: string;
    codeSnippet?: unknown;
    options?: Array<{
      id: string;
      text: string;
    }>;
    template?: string;
    poolItems?: Array<{
      id: string;
      text: string;
    }>;
    estimatedMinutes?: number;
    xp?: number;
  };
  review?: unknown;
}
