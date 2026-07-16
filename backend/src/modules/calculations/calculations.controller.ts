import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { CalculationsService } from './calculations.service';

@ApiTags('Calculations')
@ApiBearerAuth()
@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @ApiOperation({ summary: 'Get monthly summary' })
  @ApiResponse({ status: 200, description: 'Monthly summary retrieved successfully.' })
  @Get('monthly')
  getMonthlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.calculationsService.getMonthlySummary(user.id, year, month);
  }

  @ApiOperation({ summary: 'Get quarterly summary' })
  @ApiResponse({ status: 200, description: 'Quarterly summary retrieved successfully.' })
  @Get('quarterly')
  getQuarterlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter', ParseIntPipe) quarter: number,
  ) {
    return this.calculationsService.getQuarterlySummary(user.id, year, quarter);
  }

  @ApiOperation({ summary: 'Get yearly summary' })
  @ApiResponse({ status: 200, description: 'Yearly summary retrieved successfully.' })
  @Get('yearly')
  getYearlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.calculationsService.getYearlySummary(user.id, year);
  }

  @ApiOperation({ summary: 'Get category breakdown' })
  @ApiResponse({ status: 200, description: 'Category breakdown retrieved successfully.' })
  @Get('category-breakdown')
  getCategoryBreakdown(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.calculationsService.getCategoryBreakdown(user.id, year, month);
  }
}
