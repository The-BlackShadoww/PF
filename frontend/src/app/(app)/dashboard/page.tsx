"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";

import { QuarterlyView } from "@/components/dashboard/QuarterlyView";
import { YearlyView } from "@/components/dashboard/YearlyView";
import { PageHeader } from "@/components/layouts/PageHeader";
import { SummaryCard } from "@/components/shared/SummaryCard";
import type { YearlySummary } from "@/lib/api/calculations";
import { useCategoryBreakdown } from "@/lib/hooks/useCategoryBreakdown";
import { useMonthlySummary } from "@/lib/hooks/useMonthlySummary";
import { useYearlySummary } from "@/lib/hooks/useYearlySummary";
import { acebuilderActiveClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DEFAULT_CATEGORY_COLORS = [
  "#2667ff", "#38c8ff", "#ffc091", "#2ead4b", "#a78bfa", "#f472b6",
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

/* ─── Custom tooltip ─── */
function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="recharts-custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="tooltip-row">
          <span
            className="tooltip-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span className="tooltip-name">{entry.name}</span>
          <span className="tooltip-value">
            {formatAmount(Number(entry.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}

function SavingsTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="recharts-custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload
        .filter((entry) => entry.dataKey === "savingsRate")
        .map((entry) => (
          <div key={entry.dataKey} className="tooltip-row">
            <span
              className="tooltip-dot"
              style={{ backgroundColor: entry.color }}
            />
            <span className="tooltip-name">{entry.name}</span>
            <span className="tooltip-value">
              {formatPercent(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];

  return (
    <div className="recharts-custom-tooltip">
      <div className="tooltip-row">
        <span
          className="tooltip-dot"
          style={{ backgroundColor: entry.payload?.color }}
        />
        <span className="tooltip-name">{entry.name}</span>
        <span className="tooltip-value">
          {formatAmount(Number(entry.value ?? 0))}
        </span>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
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

  const totalExpenseForPie = useMemo(
    () => expenseCategories.reduce((sum, c) => sum + c.total, 0),
    [expenseCategories],
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
          <div className="inline-flex h-10 items-center rounded-full border border-line bg-surface">
            <button
              type="button"
              aria-label="Previous month"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-ink"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <div className="min-w-36 px-4 text-center text-sm font-medium text-ink">
              {formatMonthYear(selectedDate)}
            </div>
            <button
              type="button"
              aria-label="Next month"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-ink"
              onClick={goToNextMonth}
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        className="dashboard-tabs mb-4 inline-flex gap-1 overflow-x-auto rounded-full p-1 border border-line backdrop-blur-2xl"
        role="tablist"
        aria-label="Dashboard period"
      >
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-slot="button"
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(
              "dashboard-tab inline-flex cursor-pointer font-display items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] outline-none",
              activeTab === tab.id
                ? `dashboard-tab-active ${acebuilderActiveClasses}`
                : "dashboard-tab-inactive text-muted hover:text-ink hover:bg-canvas/60",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "monthly" && (
        <>
          {/* Summary cards */}
          <section className="grid gap-3 md:grid-cols-3">
            <SummaryCard
              title="Total income"
              value={monthlySummary.data?.totalIncome ?? 0}
              subtitle="This month"
              tone="income"
              isLoading={isMonthlyLoading}
            />
            <SummaryCard
              title="Total expenses"
              value={monthlySummary.data?.totalExpense ?? 0}
              subtitle="This month"
              tone="expense"
              isLoading={isMonthlyLoading}
            />
            <SummaryCard
              title="Net savings"
              value={monthlySummary.data?.savings ?? 0}
              subtitle={`${formatPercent(savingsRate)} savings rate`}
              tone="savings"
              isLoading={isMonthlyLoading}
            />
          </section>

          {/* Charts — bento layout: bar+pie row, then savings full-width */}
          <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            {/* Bar chart — income vs expense */}
            <ChartPanel
              title="Income vs expense"
              legend={[
                { color: "var(--ds-primary)", label: "Income" },
                { color: "var(--ds-danger)", label: "Expense" },
              ]}
              isLoading={isYearlyLoading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonthData} barGap={3} barSize={20}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--ds-chart-tick)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--ds-chart-tick)" }}
                    tickFormatter={(value) =>
                      formatCompactAmount(Number(value))
                    }
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--ds-canvas)", opacity: 0.5 }} />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="var(--ds-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="var(--ds-danger)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            {/* Pie chart — expense categories */}
            <ChartPanel
              title="Expense breakdown"
              isLoading={isCategoryLoading}
            >
              {expenseCategories.length === 0 ? (
                <EmptyChartState message="No expenses this month" />
              ) : (
                <div className="flex h-full flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          dataKey="total"
                          nameKey="name"
                          innerRadius="58%"
                          outerRadius="82%"
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {expenseCategories.map((category) => (
                            <Cell key={category.name} fill={category.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CategoryTooltip />} />
                        {/* Center label */}
                        <text
                          x="50%"
                          y="46%"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="fill-muted text-[10px]"
                        >
                          Total
                        </text>
                        <text
                          x="50%"
                          y="56%"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="fill-ink text-xs font-semibold"
                        >
                          {formatAmount(totalExpenseForPie)}
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-auto space-y-2 border-t border-line pt-3">
                    {expenseCategories.slice(0, 5).map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="truncate text-muted">
                            {category.name}
                          </span>
                        </div>
                        <span className="font-medium text-ink">
                          {formatAmount(category.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartPanel>
          </section>

          {/* Savings rate trend — full width */}
          <section>
            <ChartPanel
              title="Savings rate trend"
              legend={[{ color: "var(--ds-primary)", label: "Savings rate" }]}
              isLoading={isYearlyLoading}
              height="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sixMonthData}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ds-primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--ds-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--ds-chart-tick)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--ds-chart-tick)" }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<SavingsTooltip />} cursor={{ stroke: "var(--ds-line)" }} />
                  <Area
                    type="monotone"
                    dataKey="savingsRate"
                    fill="url(#savingsGradient)"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="savingsRate"
                    name="Savings rate"
                    stroke="var(--ds-primary)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--ds-surface)", stroke: "var(--ds-primary)", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "var(--ds-primary)", stroke: "var(--ds-surface)", strokeWidth: 2 }}
                  />
                </ComposedChart>
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

/* ─── Chart panel ─── */
function ChartPanel({
  title,
  legend,
  isLoading,
  children,
  height = "h-72",
}: {
  title: string;
  legend?: Array<{ color: string; label: string }>;
  isLoading: boolean;
  children: React.ReactNode;
  height?: string;
}) {
  return (
    <article className="surface-card rounded-card bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {legend && (
          <div className="flex items-center gap-4">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={cn("mt-4", height)}>
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
    <div className="flex h-full items-center justify-center rounded-card border border-dashed border-line bg-canvas px-6 text-center text-sm text-muted">
      {message}
    </div>
  );
}

/* ─── Helpers ─── */
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
