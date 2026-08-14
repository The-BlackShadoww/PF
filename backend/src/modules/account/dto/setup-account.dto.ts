import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class SetupAccountDto {
  @ApiProperty({ description: 'Initial account balance in whole dollars.', example: 22500, minimum: 0 })
  @IsInt()
  @Min(0)
  initialBalance!: number;

  @ApiPropertyOptional({ description: 'Low-balance warning threshold in whole dollars.', example: 5000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowBalanceThreshold?: number;
}
