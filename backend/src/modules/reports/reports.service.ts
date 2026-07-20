import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import { writeToStream } from 'fast-csv';
import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { format, parseISO } from 'date-fns';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { categories, transactions } from '../../db/schema';
import { TransactionsService } from '../transactions/transactions.service';
import FinancialReportDocument, {
  type ReportData,
} from './pdf/financial-report.document';

type CsvFilters = {
  startDate?: string;
  endDate?: string;
  year?: string | number;
  month?: string | number;
};

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly transactionsService: TransactionsService,
  ) {}

  async generateCsv(userId: string, filters: CsvFilters) {
    const rows = await this.findTransactions(userId, filters);
    const stream = new PassThrough();

    writeToStream(
      stream,
      rows.map((transaction) => ({
        Date: this.formatDate(transaction.date),
        Type: transaction.type,
        Category: transaction.category.name,
        Amount: this.formatAmount(transaction.amountCents),
        Note: transaction.note ?? '',
      })),
      { headers: true },
    ).on('error', (error) => stream.destroy(error));

    return stream;
  }

  async generatePdf(
    userId: string,
    userName: string,
    userEmail: string,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    // Step 1 — Parse and validate dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (end < start) {
      throw new BadRequestException('endDate must be after startDate');
    }

    // Step 2 — Fetch all transactions for the period
    const rawTransactions =
      await this.transactionsService.getRawTransactionsForReport(
        userId,
        start,
        end,
      );

    // Step 3 — Compute summary by aggregating rawTransactions in JavaScript
    const totalIncomeCents = rawTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const totalExpenseCents = rawTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const savingsCents = totalIncomeCents - totalExpenseCents;

    const savingsRate =
      totalIncomeCents > 0
        ? ((savingsCents / totalIncomeCents) * 100).toFixed(1)
        : '0.0';

    // Step 4 — Build the ReportData object
    const reportData: ReportData = {
      period: {
        startDate,
        endDate,
        label:
          start.getFullYear() === end.getFullYear() &&
          start.getMonth() === end.getMonth()
            ? format(start, 'MMMM yyyy')
            : `${format(start, 'MMMM yyyy')} – ${format(end, 'MMMM yyyy')}`,
      },
      user: { name: userName, email: userEmail },
      summary: {
        totalIncomeCents,
        totalExpenseCents,
        savingsCents,
        savingsRate,
        transactionCount: rawTransactions.length,
      },
      transactions: rawTransactions.map((t) => ({
        date: format(t.date, 'MMM dd, yyyy'),
        type: t.type,
        categoryName: t.categoryName,
        amountCents: t.amountCents,
        note: t.note,
      })),
      generatedAt: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
    };

    // Step 5 — Render to Buffer
    const element = createElement(FinancialReportDocument, {
      data: reportData,
    });
    const buffer = await renderToBuffer(element as any);
    return buffer as unknown as Buffer;
  }

  private findTransactions(userId: string, filters: CsvFilters) {
    return this.db
      .select({
        type: transactions.type,
        amountCents: transactions.amountCents,
        date: transactions.date,
        note: transactions.note,
        category: {
          name: categories.name,
        },
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(this.buildWhere(userId, filters))
      .orderBy(desc(transactions.date));
  }

  private buildWhere(userId: string, filters: CsvFilters) {
    const clauses = [
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt),
      isNull(categories.deletedAt),
    ];
    const { startDate, endDate } = this.resolveDateRange(filters);

    if (startDate) {
      clauses.push(gte(transactions.date, startDate));
    }

    if (endDate) {
      clauses.push(lte(transactions.date, endDate));
    }

    return and(...clauses);
  }

  private resolveDateRange(filters: CsvFilters) {
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;
    const year = filters.year ? Number(filters.year) : null;
    const month = filters.month ? Number(filters.month) : null;

    if (!startDate && !endDate && year && month) {
      return {
        startDate: new Date(Date.UTC(year, month - 1, 1)),
        endDate: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
      };
    }

    if (!startDate && !endDate && year) {
      return {
        startDate: new Date(Date.UTC(year, 0, 1)),
        endDate: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
      };
    }

    return { startDate, endDate };
  }

  private formatAmount(amountCents: number) {
    return `$${(amountCents / 100).toFixed(2)}`;
  }

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
