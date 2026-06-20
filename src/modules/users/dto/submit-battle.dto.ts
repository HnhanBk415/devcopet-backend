import { IsInt, Max, Min } from 'class-validator';

export class SubmitBattleDto {
  @IsInt()
  @Min(0)
  @Max(1000)
  expChange!: number;
}
