import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ArenaAnswerDto {
  @IsOptional()
  @IsString()
  optionId?: string;

  @IsOptional()
  @IsObject()
  dropZoneMap?: Record<string, string>;
}

export class SubmitAnswerDto {
  @IsString()
  roomId!: string;

  @IsString()
  questionId!: string;

  @ValidateNested()
  @Type(() => ArenaAnswerDto)
  answer!: ArenaAnswerDto;
}

export class MatchDecisionDto {
  @IsString()
  roomId!: string;
}

export class LeaveRoomDto {
  @IsString()
  roomId!: string;
}
