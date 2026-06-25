import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { CalculationsService } from './calculations.service';

@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @Get('monthly')
  getMonthlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.calculationsService.getMonthlySummary(user.id, year, month);
  }

  @Get('quarterly')
  getQuarterlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter', ParseIntPipe) quarter: number,
  ) {
    return this.calculationsService.getQuarterlySummary(user.id, year, quarter);
  }

  @Get('yearly')
  getYearlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.calculationsService.getYearlySummary(user.id, year);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.calculationsService.getCategoryBreakdown(user.id, year, month);
  }
}
