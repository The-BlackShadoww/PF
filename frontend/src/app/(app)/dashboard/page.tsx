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

import { QuarterlyView } from "@/components/dashboard/QuarterlyView";
import { YearlyView } from "@/components/dashboard/YearlyView";
import { PageHeader } from "@/components/layouts/PageHeader";
import { SummaryCard } from "@/components/shared/SummaryCard";
import type { YearlySummary } from "@/lib/api/calculations";
import { useCategoryBreakdown } from "@/lib/hooks/useCategoryBreakdown";
import { useMonthlySummary } from "@/lib/hooks/useMonthlySummary";
import { useYearlySummary } from "@/lib/hooks/useYearlySummary";
import { cn } from "@/lib/utils/cn";

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
  "#0f62fe",
  "#525252",
  "#8d8d8d",
  "#a6a6a6",
  "#c6c6c6",
  "#e0e0e0",
];

type MonthPoint = {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
  savingsRate: number;
};

type DashboardTab = "monthly" | "quarterly" | "yearly";

const DASHBOARD_TABS: Array<{ id: DashboardTab; label: string }> = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];

export default function DashboardPage() {
  const today = new Date();
  const [activeTab, setActiveTab] = useState<DashboardTab>("monthly");
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
    <div className="dashboard-page space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Dashboard"
          description="Track income, expenses, and savings momentum."
        />

        {activeTab === "monthly" && (
          <div className="inline-flex h-11 items-center rounded-full bg-surface">
            <button
              type="button"
              aria-label="Previous month"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <div className="min-w-36 px-4 text-center text-sm font-semibold text-ink">
              {formatMonthYear(selectedDate)}
            </div>
            <button
              type="button"
              aria-label="Next month"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted"
              onClick={goToNextMonth}
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        className="dashboard-tabs mb-6 flex gap-1 overflow-x-auto rounded-full bg-surface p-1"
        role="tablist"
        aria-label="Dashboard period"
      >
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(
              "dashboard-tab rounded-full px-4 py-2.5 text-sm font-semibold focus:outline-none",
              activeTab === tab.id
                ? "dashboard-tab-active bg-primary text-ink"
                : "dashboard-tab-inactive text-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "monthly" && (
        <>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      formatCompactAmount(Number(value))
                    }
                  />
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#0f62fe"
                    radius={0}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#da1e28"
                    radius={0}
                  />
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
                      <Tooltip
                        formatter={(value) => formatAmount(Number(value))}
                      />
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
                          <span className="truncate text-muted">
                            {category.name}
                          </span>
                        </div>
                        <span className="font-semibold text-ink">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
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
                    stroke="#0f62fe"
                    strokeDasharray="4 4"
                    label={{
                      value: "20%",
                      position: "insideTopRight",
                      fill: "#161616",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="savingsRate"
                    name="Savings rate"
                    stroke="#0f62fe"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>
          </section>
        </>
      )}

      {activeTab === "quarterly" && <QuarterlyView />}

      {activeTab === "yearly" && <YearlyView />}
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
    <article className="rounded-card bg-surface p-6">
      <h2 className="text-base font-black text-ink">{title}</h2>
      <div className="mt-4 h-80">
        {isLoading ? <ChartSkeleton /> : children}
      </div>
    </article>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-full w-full animate-pulse rounded-card bg-canvas" />
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-card border border-dashed border-muted bg-canvas px-6 text-center text-sm font-semibold text-muted">
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
      savingsRate:
        income > 0
          ? Number((((income - expense) / income) * 100).toFixed(1))
          : 0,
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
