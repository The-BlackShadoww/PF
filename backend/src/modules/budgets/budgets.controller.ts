import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { ApiErrorResponse } from '../../common/swagger/api-response.swagger';
import { BudgetsService } from './budgets.service';
import { BudgetStatusQueryDto } from './dto/budget-status-query.dto';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth('access-token')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @ApiOperation({
    summary: 'Create or update a budget',
    description: 'Creates a budget for the given year and month. ' +
      'If a budget already exists for that period and categoryId, it is updated (upsert). ' +
      'Omit categoryId for a global monthly spending cap. ' +
      'Include categoryId to set a budget for a specific category.',
  })
  @ApiBody({ type: UpsertBudgetDto })
  @ApiResponse({
    status: 200,
    description: 'Budget created or updated',
    schema: {
      example: {
        data: { id: '...', year: 2025, month: 1, amountCents: 50000, categoryId: null },
        meta: { timestamp: '...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponse })
  @Put()
  upsert(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertBudgetDto) {
    return this.budgetsService.upsert(user.id, dto);
  }

  @ApiOperation({
    summary: 'Get budget vs actual spending',
    description: 'Returns all budgets for the specified month alongside actual spending. ' +
      'Shows budget amount, amount spent, amount remaining, percentage used, ' +
      'and whether the budget is exceeded.',
  })
  @ApiQuery({ name: 'year', required: true, example: 2025 })
  @ApiQuery({ name: 'month', required: true, example: 1, description: '1 = January, 12 = December' })
  @ApiResponse({
    status: 200,
    description: 'Budget status with actual spending',
    schema: {
      example: {
        data: [{
          budgetId: '...',
          categoryId: null,
          categoryName: null,
          budgetAmountCents: 50000,
          spentCents: 32500,
          remainingCents: 17500,
          percentUsed: 65.0,
          isOverBudget: false,
        }],
        meta: { timestamp: '...' },
      },
    },
  })
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
