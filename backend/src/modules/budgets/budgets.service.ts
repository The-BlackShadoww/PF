import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { budgets, categories, transactions, users } from '../../db/schema';
import { CalculationsService } from '../calculations/calculations.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

type CategoryExpenseRow = {
  category_id: string;
  total_cents: number | string | null;
};

@Injectable()
export class BudgetsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly calculationsService: CalculationsService,
  ) {}

  async upsert(userId: string, dto: UpsertBudgetDto) {
    const categoryId = dto.categoryId ?? null;

    if (categoryId) {
      await this.assertOwnedCategory(userId, categoryId);
    }

    const [budget] = await this.db
      .insert(budgets)
      .values({
        userId,
        categoryId,
        year: dto.year,
        month: dto.month,
        amountCents: Math.round(dto.amount * 100),
      })
      .onConflictDoUpdate({
        target: [
          budgets.userId,
          budgets.year,
          budgets.month,
          budgets.categoryId,
        ],
        set: {
          amountCents: Math.round(dto.amount * 100),
          updatedAt: new Date(),
        },
      })
      .returning();

    return budget;
  }

  async getMonthlyBudgetStatus(userId: string, year: number, month: number) {
    const userBudgets = await this.db
      .select({
        id: budgets.id,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        amountCents: budgets.amountCents,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.year, year),
          eq(budgets.month, month),
        ),
      );

    const monthlySummary = await this.calculationsService.getMonthlySummary(
      userId,
      year,
      month,
    );
    const categoryExpenses = await this.getCategoryExpenseTotals(
      userId,
      year,
      month,
    );

    return userBudgets.map((budget) => {
      const spentCents = budget.categoryId
        ? (categoryExpenses.get(budget.categoryId) ?? 0)
        : Math.round(monthlySummary.totalExpense * 100);
      const remainingCents = budget.amountCents - spentCents;
      const percentUsed =
        budget.amountCents > 0 ? (spentCents / budget.amountCents) * 100 : 0;

      return {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.categoryName,
        budgetAmountCents: budget.amountCents,
        spentCents,
        remainingCents,
        percentUsed,
        isOverBudget: spentCents > budget.amountCents,
      };
    });
  }

  private async assertOwnedCategory(userId: string, categoryId: string) {
    const [category] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.userId, userId),
          isNull(categories.deletedAt),
        ),
      )
      .limit(1);

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private async getCategoryExpenseTotals(
    userId: string,
    year: number,
    month: number,
  ) {
    const [user] = await this.db
      .select({ timezone: users.timezone })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rows = await this.db.execute<CategoryExpenseRow>(sql`
      SELECT category_id, SUM(amount_cents) as total_cents
      FROM ${transactions}
      WHERE user_id = ${userId}
        AND type = 'expense'
        AND EXTRACT(YEAR FROM date AT TIME ZONE ${user.timezone}) = ${year}
        AND EXTRACT(MONTH FROM date AT TIME ZONE ${user.timezone}) = ${month}
        AND deleted_at IS NULL
      GROUP BY category_id
    `);

    return new Map(
      rows.map((row) => [row.category_id, this.toNumber(row.total_cents)]),
    );
  }

  private toNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  }
}
