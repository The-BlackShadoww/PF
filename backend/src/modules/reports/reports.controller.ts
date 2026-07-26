import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { ApiErrorResponse } from '../../common/swagger/api-response.swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Download transactions as CSV',
    description: 'Generates and streams a CSV file of all transactions in the date range. ' +
      'Rate limited to 10 downloads per hour. ' +
      "The response is a file download, not a JSON response — use Postman's " +
      '"Save Response → Save to a file" option to download it.',
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-01-31' })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 200, description: 'CSV file download', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 400, description: 'Missing startDate or endDate', type: ApiErrorResponse })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded — 10 downloads per hour', type: ApiErrorResponse })
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

  @ApiOperation({
    summary: 'Download financial report as PDF',
    description: 'Generates a formatted PDF financial report for the date range. ' +
      'Includes a summary section (income, expenses, savings) and a full transaction table. ' +
      'Rate limited to 5 downloads per hour. ' +
      "The response is a file download — use Postman's " +
      '"Save Response → Save to a file" option to download it.',
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-03-31' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF file download', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 400, description: 'Missing or invalid dates', type: ApiErrorResponse })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded — 5 downloads per hour', type: ApiErrorResponse })
  @Get('pdf')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  async downloadPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate query params are required',
      );
    }

    const buffer = await this.reportsService.generatePdf(
      user.id,
      user.name,
      user.email,
      startDate,
      endDate,
    );

    const filename = `report_${startDate}_to_${endDate}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
