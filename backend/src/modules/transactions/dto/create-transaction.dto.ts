import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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
    description: 'Transaction date in ISO 8601 format. This is the date the transaction occurred, not when it was recorded.',
    example: '2025-01-15',
  })
  @IsDateString()
  date!: string;

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
