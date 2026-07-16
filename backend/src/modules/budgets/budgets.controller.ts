import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { BudgetsService } from './budgets.service';
import { BudgetStatusQueryDto } from './dto/budget-status-query.dto';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @ApiOperation({ summary: 'Upsert budget' })
  @ApiResponse({ status: 200, description: 'Budget successfully upserted.' })
  @Put()
  upsert(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertBudgetDto) {
    return this.budgetsService.upsert(user.id, dto);
  }

  @ApiOperation({ summary: 'Get monthly budget status' })
  @ApiResponse({ status: 200, description: 'Monthly budget status retrieved successfully.' })
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
