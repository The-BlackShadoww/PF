import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { users } from '../../db/schema';

type AggregationRow = {
  total_income_cents: number | string | null;
  total_expense_cents: number | string | null;
  transaction_count: number | string;
};

type CategoryBreakdownRow = {
  name: string;
  color: string | null;
  icon: string | null;
  type: 'income' | 'expense';
  total_cents: number | string | null;
  count: number | string;
};

@Injectable()
export class CalculationsService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async getMonthlySummary(userId: string, year: number, month: number) {
    this.assertMonth(month);
    const { timezone } = await this.getUserTimezone(userId);

    const rows = await this.db.execute<AggregationRow>(sql`
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END) as total_income_cents,
        SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END) as total_expense_cents,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE user_id = ${userId}
        AND EXTRACT(YEAR FROM date AT TIME ZONE ${timezone}) = ${year}
        AND EXTRACT(MONTH FROM date AT TIME ZONE ${timezone}) = ${month}
        AND deleted_at IS NULL
    `);

    return this.toSummary(year, month, rows[0]);
  }

  async getQuarterlySummary(userId: string, year: number, quarter: number) {
    this.assertQuarter(quarter);
    const { timezone } = await this.getUserTimezone(userId);
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;

    const rows = await this.db.execute<AggregationRow>(sql`
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END) as total_income_cents,
        SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END) as total_expense_cents,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE user_id = ${userId}
        AND EXTRACT(YEAR FROM date AT TIME ZONE ${timezone}) = ${year}
        AND EXTRACT(MONTH FROM date AT TIME ZONE ${timezone}) BETWEEN ${startMonth} AND ${endMonth}
        AND deleted_at IS NULL
    `);

    const summary = this.toPeriodSummary(rows[0]);
    const monthlyBreakdown = await this.getMonthlyBreakdown(
      userId,
      year,
      startMonth,
      endMonth,
    );

    return {
      year,
      quarter,
      startMonth,
      endMonth,
      ...summary,
      monthlyBreakdown,
    };
  }

  async getYearlySummary(userId: string, year: number) {
    const { timezone } = await this.getUserTimezone(userId);

    const rows = await this.db.execute<AggregationRow>(sql`
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END) as total_income_cents,
        SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END) as total_expense_cents,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE user_id = ${userId}
        AND EXTRACT(YEAR FROM date AT TIME ZONE ${timezone}) = ${year}
        AND deleted_at IS NULL
    `);

    const summary = this.toPeriodSummary(rows[0]);
    const monthlyBreakdown = await this.getMonthlyBreakdown(
      userId,
      year,
      1,
      12,
    );

    return {
      year,
      ...summary,
      monthlyBreakdown,
    };
  }

  async getCategoryBreakdown(userId: string, year: number, month: number) {
    this.assertMonth(month);
    const { timezone } = await this.getUserTimezone(userId);

    const rows = await this.db.execute<CategoryBreakdownRow>(sql`
      SELECT c.name, c.color, c.icon, t.type,
        SUM(t.amount_cents) as total_cents,
        COUNT(*) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ${userId}
        AND EXTRACT(YEAR FROM t.date AT TIME ZONE ${timezone}) = ${year}
        AND EXTRACT(MONTH FROM t.date AT TIME ZONE ${timezone}) = ${month}
        AND t.deleted_at IS NULL
      GROUP BY c.id, c.name, c.color, c.icon, t.type
      ORDER BY total_cents DESC
    `);

    return rows.map((row) => ({
      name: row.name,
      color: row.color,
      icon: row.icon,
      type: row.type,
      total: this.centsToAmount(row.total_cents),
      count: this.toNumber(row.count),
    }));
  }

  private async getMonthlyBreakdown(
    userId: string,
    year: number,
    startMonth: number,
    endMonth: number,
  ) {
    const summaries = await Promise.all(
      Array.from(
        { length: endMonth - startMonth + 1 },
        (_value, index) => startMonth + index,
      ).map((month) => this.getMonthlySummary(userId, year, month)),
    );

    return summaries.map(({ month, totalIncome, totalExpense, savings }) => ({
      month,
      totalIncome,
      totalExpense,
      savings,
    }));
  }

  private async getUserTimezone(userId: string) {
    const [user] = await this.db
      .select({ timezone: users.timezone })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private toSummary(year: number, month: number, row?: AggregationRow) {
    return {
      year,
      month,
      ...this.toPeriodSummary(row),
    };
  }

  private toPeriodSummary(row?: AggregationRow) {
    const totalIncomeCents = this.toNumber(row?.total_income_cents);
    const totalExpenseCents = this.toNumber(row?.total_expense_cents);
    const savingsCents = totalIncomeCents - totalExpenseCents;

    return {
      totalIncome: this.centsToAmount(totalIncomeCents),
      totalExpense: this.centsToAmount(totalExpenseCents),
      savings: this.centsToAmount(savingsCents),
      savingsRate:
        totalIncomeCents > 0
          ? ((savingsCents / totalIncomeCents) * 100).toFixed(1)
          : 0,
      transactionCount: this.toNumber(row?.transaction_count),
    };
  }

  private centsToAmount(value: number | string | null | undefined) {
    return this.toNumber(value) / 100;
  }

  private toNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  }

  private assertMonth(month: number) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }
  }

  private assertQuarter(quarter: number) {
    if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
      throw new BadRequestException('quarter must be between 1 and 4');
    }
  }
}
