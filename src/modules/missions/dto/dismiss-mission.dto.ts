import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DismissMissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  reason?: string;
}
