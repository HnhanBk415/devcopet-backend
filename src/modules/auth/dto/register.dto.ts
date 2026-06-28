import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName?: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword?: string;

  @Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const [month, day, year] = trimmed.split('/');
    if (month && day && year) {
      return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return trimmed;
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  dateOfBirth?: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(80)
  experienceLevel?: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value === 'true' : value,
  )
  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value === 'true' : value,
  )
  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
