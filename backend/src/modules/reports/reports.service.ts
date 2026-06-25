import { Inject, Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import { writeToStream } from 'fast-csv';
import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { categories, transactions } from '../../db/schema';

type CsvFilters = {
  startDate?: string;
  endDate?: string;
  year?: string | number;
  month?: string | number;
};

@Injectable()
export class ReportsService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

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
