import { Types } from 'mongoose';

export type RoadmapStatus = 'locked' | 'available' | 'completed';
export type ChallengeOptionId = 'A' | 'B' | 'C' | 'D';
export type ChallengePromptType = 'code_mcq' | 'concept_mcq';
export type RoadmapMode = 'easy' | 'medium' | 'hard';
export type AdvancedRoadmapMode = 'medium' | 'hard';
export type AdvancedChallengeType =
  | 'multiple_choice'
  | 'drag_drop'
  | 'code_trace'
  | 'bug_hunt'
  | 'choose_better_algorithm'
  | 'simulation'
  | 'fill_missing_line'
  | 'drag_drop_matching'
  | 'ordering_steps'
  | 'ranking';

export interface LeanCourse {
  _id: Types.ObjectId;
  slug: string;
  title: string;
}

export interface LeanChapter {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  slug?: string;
  title: string;
  order: number;
}

export interface LeanLesson {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  order: number;
  xpReward?: number;
}

export interface EasyNodeContext {
  node: {
    id: string;
    lessonId: string;
    chapterId: string;
    label: string;
    title: string;
    status: RoadmapStatus;
  };
  chapter: LeanChapter;
  course: LeanCourse;
  lesson: LeanLesson;
}

export interface EasyChallengeData {
  id: string;
  chapterOrder: number;
  lessonOrder: number;
  label: string;
  lessonTitle: string;
  type: 'multiple_choice';
  promptType: ChallengePromptType;
  title: string;
  question: string;
  codeSnippet?: {
    language: 'python';
    code: string;
  };
  options: Array<{
    id: ChallengeOptionId;
    text: string;
  }>;
  correctOptionId: ChallengeOptionId;
  explanation: string;
  xp: number;
  estimatedMinutes: number;
}

export interface EasyChallengeFile {
  courseSlug: string;
  mode: 'easy';
  challenges: EasyChallengeData[];
}

export interface AdvancedBaseChallengeData {
  order: number;
  label: string;
  type: AdvancedChallengeType;
  title: string;
  question: string;
  codeSnippet?: {
    language: 'python';
    code: string;
  } | null;
  explanation: string;
  xp: number;
  estimatedMinutes: number;
}

export interface AdvancedMultipleChoiceChallengeData extends AdvancedBaseChallengeData {
  type: 'multiple_choice';
  options: Array<{
    id: ChallengeOptionId;
    text: string;
  }>;
  correctOptionId: ChallengeOptionId;
}

export interface AdvancedDragDropChallengeData extends AdvancedBaseChallengeData {
  type: 'drag_drop';
  template: string;
  poolItems: Array<{
    id: string;
    text: string;
  }>;
  correctDropZoneMap: Record<string, string>;
}

export interface AdvancedGenericChallengeData extends AdvancedBaseChallengeData {
  type: Exclude<AdvancedChallengeType, 'multiple_choice' | 'drag_drop'>;
  [key: string]: unknown;
}

export type AdvancedChallengeData =
  | AdvancedMultipleChoiceChallengeData
  | AdvancedDragDropChallengeData
  | AdvancedGenericChallengeData;

export interface AdvancedChapterData {
  chapterOrder: number;
  chapterTitle: string;
  nodes: AdvancedChallengeData[];
}

export interface AdvancedChallengeFile {
  courseSlug: string;
  mode: AdvancedRoadmapMode;
  chapters: AdvancedChapterData[];
}

export interface AdvancedNodeContext {
  node: {
    id: string;
    label: string;
    title: string;
    type: AdvancedChallengeType;
    status: RoadmapStatus;
  };
  course: LeanCourse;
  chapter?: LeanChapter;
  chapterData: AdvancedChapterData;
  challenge: AdvancedChallengeData;
  globalNodeIndex: number;
}

export interface RoadmapOrderedNode {
  id: string;
}
