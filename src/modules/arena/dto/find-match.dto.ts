import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import type { ArenaMode } from '../types/arena.types';

export class FindMatchDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  courseSlug!: string;

  @IsOptional()
  @IsIn(['ranked', 'casual', 'practice'])
  mode?: ArenaMode;
}
