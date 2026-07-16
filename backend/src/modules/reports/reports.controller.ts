import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Download CSV report' })
  @ApiResponse({ status: 200, description: 'CSV file generated successfully.' })
  @Get('csv')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 3600 } })
  async downloadCsv(
    @Query()
    filters: {
      startDate?: string;
      endDate?: string;
      year?: string;
      month?: string;
    },
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transactions.csv',
    );

    const stream = await this.reportsService.generateCsv(user.id, filters);
    stream.pipe(res);
  }
}
