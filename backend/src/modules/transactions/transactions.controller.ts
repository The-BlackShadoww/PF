import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { ApiErrorResponse } from '../../common/swagger/api-response.swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Create a transaction',
    description: 'Creates an income or expense transaction. The categoryId must belong to the authenticated user and match the transaction type.',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction created',
    schema: {
      example: {
        data: { id: '...', type: 'expense', amount: 49.99, date: '2025-01-15', categoryName: 'Groceries', note: 'Monthly groceries' },
        meta: { timestamp: '...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error or category type mismatch', type: ApiErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponse })
  @ApiResponse({ status: 404, description: 'Category not found or does not belong to user', type: ApiErrorResponse })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.id, dto);
  }

  @ApiOperation({
    summary: 'List transactions',
    description: 'Returns paginated transactions for the authenticated user. Supports filtering by date range, type, and category.',
  })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-31' })
  @ApiQuery({ name: 'type', required: false, enum: ['income', 'expense'] })
  @ApiQuery({ name: 'categoryId', required: false, example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Paginated transaction list',
    schema: {
      example: {
        data: { transactions: [], total: 0, page: 1, limit: 20 },
        meta: { timestamp: '...' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponse })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: TransactionFiltersDto,
  ) {
    return this.transactionsService.findAll(user.id, filters);
  }

  @ApiOperation({
    summary: 'Get a single transaction',
    description: 'Returns one transaction by ID. Returns 404 if not found or does not belong to the authenticated user.',
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponse })
  @ApiResponse({ status: 404, description: 'Transaction not found', type: ApiErrorResponse })
  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @ApiOperation({
    summary: 'Update a transaction',
    description: 'Partially updates a transaction. Only include the fields you want to change.',
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({ status: 200, description: 'Transaction updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponse })
  @ApiResponse({ status: 404, description: 'Transaction not found', type: ApiErrorResponse })
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @ApiOperation({
    summary: 'Delete a transaction',
    description: 'Soft-deletes a transaction. The record is retained in the database for audit purposes but excluded from all queries and calculations.',
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted',
    schema: { example: { data: { success: true }, meta: { timestamp: '...' } } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponse })
  @ApiResponse({ status: 404, description: 'Transaction not found', type: ApiErrorResponse })
  @Delete(':id')
  @HttpCode(200)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
