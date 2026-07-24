import {
  IsString, IsEnum, IsOptional, IsBoolean,
  IsInt, IsHexColor, MinLength, MaxLength, Min
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export type CategoryType = 'income' | 'expense';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEnum(['income', 'expense'])
  type: CategoryType;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  type?: never;
}
