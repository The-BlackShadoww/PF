import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import { writeToStream } from 'fast-csv';
import { and, asc, eq, gt, gte, isNull, lt, lte, or } from 'drizzle-orm';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { format } from 'date-fns';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { categories, transactions } from '../../db/schema';
import { TransactionsService } from '../transactions/transactions.service';
import FinancialReportDocument, { type ReportData } from './pdf/financial-report.document';

export type PeriodFilters = {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
};

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly transactionsService: TransactionsService,
  ) {}

  async generateCsv(userId: string, filters: PeriodFilters) {
    this.assertPeriodRange(filters);
    const rows = await this.findTransactions(userId, filters);
    const stream = new PassThrough();

    writeToStream(
      stream,
      rows.map((transaction) => ({
        Period: format(new Date(transaction.transactionYear, transaction.transactionMonth - 1, 1), 'MMMM yyyy'),
        'Handover Date': format(transaction.date, 'MMM d, yyyy'),
        Type: transaction.type,
        Category: transaction.category.name,
        Amount: this.formatAmount(transaction.amountCents),
        Note: transaction.note ?? '',
      })),
      { headers: true },
    ).on('error', (error) => stream.destroy(error));

    return stream;
  }

  async generatePdf(userId: string, userName: string, userEmail: string, filters: PeriodFilters): Promise<Buffer> {
    this.assertPeriodRange(filters);
    const rawTransactions = await this.transactionsService.getRawTransactionsForReport(
      userId, filters.startYear, filters.startMonth, filters.endYear, filters.endMonth,
    );
    const totalIncomeCents = rawTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amountCents, 0);
    const totalExpenseCents = rawTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amountCents, 0);
    const savingsCents = totalIncomeCents - totalExpenseCents;

    const reportData: ReportData = {
      period: {
        startDate: `${filters.startYear}-${String(filters.startMonth).padStart(2, '0')}-01`,
        endDate: `${filters.endYear}-${String(filters.endMonth).padStart(2, '0')}-01`,
        label: this.buildPeriodLabel(filters),
      },
      user: { name: userName, email: userEmail },
      summary: {
        totalIncomeCents, totalExpenseCents, savingsCents,
        savingsRate: totalIncomeCents > 0 ? ((savingsCents / totalIncomeCents) * 100).toFixed(1) : '0.0',
        transactionCount: rawTransactions.length,
      },
      transactions: rawTransactions.map((t) => ({
        period: format(new Date(t.transactionYear, t.transactionMonth - 1, 1), 'MMM yyyy'),
        handoverDate: format(t.date, 'MMM d'),
        type: t.type, categoryName: t.categoryName, amountCents: t.amountCents, note: t.note,
      })),
      generatedAt: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
    };

    return (await renderToBuffer(createElement(FinancialReportDocument, { data: reportData }) as any)) as unknown as Buffer;
  }

  private findTransactions(userId: string, filters: PeriodFilters) {
    return this.db.select({
      type: transactions.type, amountCents: transactions.amountCents, date: transactions.date,
      transactionMonth: transactions.transactionMonth, transactionYear: transactions.transactionYear,
      note: transactions.note, category: { name: categories.name },
    }).from(transactions).innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(this.buildWhere(userId, filters))
      .orderBy(asc(transactions.transactionYear), asc(transactions.transactionMonth), asc(transactions.date));
  }

  private buildWhere(userId: string, filters: PeriodFilters) {
    return and(
      eq(transactions.userId, userId), isNull(transactions.deletedAt), isNull(categories.deletedAt),
      or(gt(transactions.transactionYear, filters.startYear), and(eq(transactions.transactionYear, filters.startYear), gte(transactions.transactionMonth, filters.startMonth))),
      or(lt(transactions.transactionYear, filters.endYear), and(eq(transactions.transactionYear, filters.endYear), lte(transactions.transactionMonth, filters.endMonth))),
    );
  }

  private assertPeriodRange({ startYear, startMonth, endYear, endMonth }: PeriodFilters) {
    if (![startYear, startMonth, endYear, endMonth].every(Number.isInteger)) throw new BadRequestException('Period values must be integers');
    if (startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12) throw new BadRequestException('Month values must be between 1 and 12');
    if (endYear < startYear || (endYear === startYear && endMonth < startMonth)) throw new BadRequestException('End period cannot be before start period');
  }

  private buildPeriodLabel({ startYear, startMonth, endYear, endMonth }: PeriodFilters) {
    const start = new Date(startYear, startMonth - 1, 1);
    const end = new Date(endYear, endMonth - 1, 1);
    if (startYear === endYear && startMonth === endMonth) return format(start, 'MMMM yyyy');
    if (startYear === endYear) return `${format(start, 'MMMM')} – ${format(end, 'MMMM yyyy')}`;
    return `${format(start, 'MMMM yyyy')} – ${format(end, 'MMMM yyyy')}`;
  }

  private formatAmount(amountCents: number) { return `$${(amountCents / 100).toFixed(2)}`; }
}
