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
  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsDateString()
  date!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
