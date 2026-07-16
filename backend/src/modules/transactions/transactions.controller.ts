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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Create transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully.' })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Find all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully.' })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: TransactionFiltersDto,
  ) {
    return this.transactionsService.findAll(user.id, filters);
  }

  @ApiOperation({ summary: 'Find a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully.' })
  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully.' })
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully.' })
  @Delete(':id')
  @HttpCode(200)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
