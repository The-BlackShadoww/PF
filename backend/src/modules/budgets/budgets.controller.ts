import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { BudgetsService } from './budgets.service';
import { BudgetStatusQueryDto } from './dto/budget-status-query.dto';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Put()
  upsert(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertBudgetDto) {
    return this.budgetsService.upsert(user.id, dto);
  }

  @Get('status')
  getMonthlyBudgetStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: BudgetStatusQueryDto,
  ) {
    return this.budgetsService.getMonthlyBudgetStatus(
      user.id,
      query.year,
      query.month,
    );
  }
}
