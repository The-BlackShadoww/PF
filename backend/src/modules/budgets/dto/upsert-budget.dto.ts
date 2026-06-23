import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class UpsertBudgetDto {
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
