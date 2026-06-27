import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  petName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}
