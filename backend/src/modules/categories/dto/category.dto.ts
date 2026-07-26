import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType, OmitType } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsOptional,
  IsInt, IsHexColor, MinLength, MaxLength, Min
} from 'class-validator';

export type CategoryType = 'income' | 'expense';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name. Must be unique per user per type.',
    example: 'Groceries',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Whether this is an income or expense category. Cannot be changed after creation.',
    enum: ['income', 'expense'],
    example: 'expense',
  })
  @IsEnum(['income', 'expense'])
  type!: CategoryType;

  @ApiPropertyOptional({
    description: 'Hex color code for the category. Used for UI display.',
    example: '#dc2626',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
  })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier string. Must be a valid lucide-react icon name in kebab-case.',
    example: 'shopping-cart',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Sort order for display. Lower numbers appear first.',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['type'] as const),
) {}
