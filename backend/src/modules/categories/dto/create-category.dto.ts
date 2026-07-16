import { IsEnum, IsInt, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsEnum(['income', 'expense'])
  type!: 'income' | 'expense';

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  icon?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
