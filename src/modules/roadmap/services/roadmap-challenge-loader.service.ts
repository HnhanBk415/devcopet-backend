import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type {
  AdvancedChallengeFile,
  AdvancedRoadmapMode,
  EasyChallengeFile,
} from '../roadmap.types';
import {
  ADVANCED_NODE_COUNT_PER_CHAPTER,
  capitalizeMode,
} from '../utils/roadmap.util';

@Injectable()
export class RoadmapChallengeLoaderService {
  private readonly easyChallengeCache = new Map<string, EasyChallengeFile>();
  private readonly advancedChallengeCache = new Map<
    string,
    AdvancedChallengeFile
  >();

  loadEasyChallengeFile(courseSlug: string): EasyChallengeFile {
    const cached = this.easyChallengeCache.get(courseSlug);
    if (cached) return cached;

    const filePath = this.resolveChallengePath(
      courseSlug,
      'easy-roadmap-challenges.json',
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `Easy challenge data not found for course: ${courseSlug}`,
      );
    }

    const parsed = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    ) as EasyChallengeFile;

    this.easyChallengeCache.set(courseSlug, parsed);
    return parsed;
  }

  loadAdvancedChallengeFile(
    mode: AdvancedRoadmapMode,
    courseSlug: string,
  ): AdvancedChallengeFile {
    const cacheKey = `${mode}:${courseSlug}`;
    const cached = this.advancedChallengeCache.get(cacheKey);
    if (cached) return cached;

    const filePath = this.resolveChallengePath(
      courseSlug,
      `${mode}-roadmap-challenges.json`,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `${capitalizeMode(mode)} challenge data not found for course: ${courseSlug}`,
      );
    }

    const parsed = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    ) as AdvancedChallengeFile;

    this.assertValidAdvancedChallengeFile(parsed, courseSlug, mode);
    this.advancedChallengeCache.set(cacheKey, parsed);
    return parsed;
  }

  private resolveChallengePath(courseSlug: string, filename: string) {
    return path.resolve(
      process.cwd(),
      'src',
      'database',
      'seeds',
      'content',
      courseSlug,
      filename,
    );
  }

  private assertValidAdvancedChallengeFile(
    challengeFile: AdvancedChallengeFile,
    courseSlug: string,
    mode: AdvancedRoadmapMode,
  ) {
    if (
      challengeFile.courseSlug !== courseSlug ||
      challengeFile.mode !== mode
    ) {
      throw new BadRequestException(
        `Invalid ${capitalizeMode(mode)} challenge data for course: ${courseSlug}`,
      );
    }

    for (const chapter of challengeFile.chapters) {
      if (
        mode === 'medium' &&
        chapter.nodes.length !== ADVANCED_NODE_COUNT_PER_CHAPTER
      ) {
        throw new BadRequestException(
          `${capitalizeMode(mode)} chapter ${chapter.chapterOrder} must contain exactly ${ADVANCED_NODE_COUNT_PER_CHAPTER} nodes.`,
        );
      }

      if (
        mode === 'hard' &&
        (chapter.nodes.length < 1 ||
          chapter.nodes.length > ADVANCED_NODE_COUNT_PER_CHAPTER)
      ) {
        throw new BadRequestException(
          `${capitalizeMode(mode)} chapter ${chapter.chapterOrder} must contain between 1 and ${ADVANCED_NODE_COUNT_PER_CHAPTER} nodes while hard content is being authored.`,
        );
      }

      for (const node of chapter.nodes) {
        if (node.type !== 'multiple_choice' && node.type !== 'drag_drop') {
          throw new BadRequestException(
            `Unsupported ${capitalizeMode(mode)} node type in chapter ${chapter.chapterOrder}.`,
          );
        }
      }
    }
  }
}
