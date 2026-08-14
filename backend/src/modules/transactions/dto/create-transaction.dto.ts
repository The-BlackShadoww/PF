import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Whether this is income or an expense',
    enum: TransactionType,
    example: 'expense',
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    description: 'Transaction amount in dollars. Stored internally as cents.',
    example: 49.99,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description:
      'The date money physically changed hands (received or paid). This is informational only — it does NOT determine which month/year the transaction appears in on the dashboard. Use transactionMonth and transactionYear for period attribution.',
    example: '2025-01-15',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    description:
      'The month this transaction belongs to (billing period). 1 = January, 12 = December. This determines which month the transaction appears in on the dashboard and reports — independent of the date field.',
    example: 7,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  transactionMonth!: number;

  @ApiProperty({
    description:
      'The year this transaction belongs to (billing period). This determines which year the transaction appears in on the dashboard.',
    example: 2026,
    minimum: 2000,
    maximum: 2100,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  transactionYear!: number;

  @ApiProperty({
    description: 'UUID of the category this transaction belongs to. Must belong to the authenticated user and match the transaction type.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Optional note or description for this transaction',
    example: 'Monthly grocery run at Agora',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
