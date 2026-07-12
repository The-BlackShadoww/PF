"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layouts/PageHeader";
import { SummaryCard } from "@/components/shared/SummaryCard";
import type { YearlySummary } from "@/lib/api/calculations";
import { useCategoryBreakdown } from "@/lib/hooks/useCategoryBreakdown";
import { useMonthlySummary } from "@/lib/hooks/useMonthlySummary";
import { useYearlySummary } from "@/lib/hooks/useYearlySummary";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DEFAULT_CATEGORY_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#14b8a6",
  "#6366f1",
  "#a855f7",
];

type MonthPoint = {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
  savingsRate: number;
};

export default function DashboardPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const needsPreviousYear = month < 6;

  const monthlySummary = useMonthlySummary(year, month);
  const yearlySummary = useYearlySummary(year);
  const previousYearSummary = useYearlySummary(year - 1, {
    enabled: needsPreviousYear,
  });
  const categoryBreakdown = useCategoryBreakdown(year, month);

  const sixMonthData = useMemo(
    () =>
      buildSixMonthData(
        selectedDate,
        yearlySummary.data,
        previousYearSummary.data,
      ),
    [previousYearSummary.data, selectedDate, yearlySummary.data],
  );

  const expenseCategories = useMemo(
    () =>
      (categoryBreakdown.data ?? [])
        .filter((item) => item.type === "expense" && item.total > 0)
        .map((item, index) => ({
          ...item,
          color:
            item.color ??
            DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length],
        })),
    [categoryBreakdown.data],
  );

  const isYearlyLoading =
    yearlySummary.isLoading ||
    yearlySummary.isFetching ||
    (needsPreviousYear &&
      (previousYearSummary.isLoading || previousYearSummary.isFetching));
  const isMonthlyLoading =
    monthlySummary.isLoading || monthlySummary.isFetching;
  const isCategoryLoading =
    categoryBreakdown.isLoading || categoryBreakdown.isFetching;
  const savingsRate = toNumber(monthlySummary.data?.savingsRate);

  function goToPreviousMonth() {
    setSelectedDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() - 1, 1);
    });
  }

  function goToNextMonth() {
    setSelectedDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() + 1, 1);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Dashboard"
          description="Track income, expenses, and savings momentum."
        />

        <div className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white">
          <button
            type="button"
            aria-label="Previous month"
            className="inline-flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <div className="min-w-36 px-4 text-center text-sm font-semibold text-slate-950">
            {formatMonthYear(selectedDate)}
          </div>
          <button
            type="button"
            aria-label="Next month"
            className="inline-flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            onClick={goToNextMonth}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total Income"
          value={monthlySummary.data?.totalIncome ?? 0}
          subtitle="This month"
          tone="income"
          isLoading={isMonthlyLoading}
        />
        <SummaryCard
          title="Total Expenses"
          value={monthlySummary.data?.totalExpense ?? 0}
          subtitle="This month"
          tone="expense"
          isLoading={isMonthlyLoading}
        />
        <SummaryCard
          title="Net Savings"
          value={monthlySummary.data?.savings ?? 0}
          subtitle={`${formatPercent(savingsRate)} savings rate`}
          tone="savings"
          isLoading={isMonthlyLoading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Monthly Income vs Expense"
          isLoading={isYearlyLoading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sixMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompactAmount(Number(value))}
              />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#16a34a" radius={4} />
              <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Expense Category Breakdown"
          isLoading={isCategoryLoading}
        >
          {expenseCategories.length === 0 ? (
            <EmptyChartState message="No expenses this month" />
          ) : (
            <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    dataKey="total"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="78%"
                    paddingAngle={2}
                  >
                    {expenseCategories.map((category) => (
                      <Cell key={category.name} fill={category.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center gap-3">
                {expenseCategories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate text-slate-700">
                        {category.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-950">
                      {formatAmount(category.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartPanel>

        <ChartPanel title="Savings Rate Trend" isLoading={isYearlyLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sixMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => formatPercent(Number(value))}
              />
              <ReferenceLine
                y={20}
                stroke="#0ea5e9"
                strokeDasharray="4 4"
                label={{
                  value: "20%",
                  position: "insideTopRight",
                  fill: "#0369a1",
                }}
              />
              <Line
                type="monotone"
                dataKey="savingsRate"
                name="Savings rate"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>
    </div>
  );
}

function ChartPanel({
  title,
  isLoading,
  children,
}: {
  title: string;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 h-80">
        {isLoading ? <ChartSkeleton /> : children}
      </div>
    </article>
  );
}

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-md bg-slate-200" />;
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm font-medium text-slate-500">
      {message}
    </div>
  );
}

function buildSixMonthData(
  selectedDate: Date,
  currentYear?: YearlySummary,
  previousYear?: YearlySummary,
): MonthPoint[] {
  return Array.from({ length: 6 }, (_value, index) => {
    const offset = index - 5;
    const date = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + offset,
      1,
    );
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const summary = year === currentYear?.year ? currentYear : previousYear;
    const monthData = summary?.monthlyBreakdown.find(
      (item) => item.month === month,
    );
    const income = monthData?.totalIncome ?? 0;
    const expense = monthData?.totalExpense ?? 0;

    return {
      year,
      month,
      label: MONTH_LABELS[month - 1],
      income,
      expense,
      savingsRate: income > 0 ? Number((((income - expense) / income) * 100).toFixed(1)) : 0,
    };
  });
}

function formatMonthYear(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatCompactAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function toNumber(value: number | string | undefined) {
  return Number(value ?? 0);
}
