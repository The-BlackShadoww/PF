import { Module } from '@nestjs/common';
import { CalculationsModule } from '../calculations/calculations.module';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

@Module({
  imports: [CalculationsModule],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
