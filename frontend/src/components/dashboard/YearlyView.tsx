"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";

import { useYearlySummary } from "@/lib/hooks/useYearlySummary";
import { cn } from "@/lib/utils/cn";
import { formatDollar, monthNameShort } from "@/lib/utils/format";

import { BreakdownTable } from "./BreakdownTable";
import { PeriodSummaryCards } from "./PeriodSummaryCards";

function YearlyChartTooltip({
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
            {formatDollar(Number(entry.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}

export function YearlyView() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const {
    data: summary,
    isLoading: isCurrentLoading,
    isFetching: isCurrentFetching,
    error,
  } = useYearlySummary(selectedYear);
  const {
    data: priorSummary,
    isLoading: isPriorLoading,
    isFetching: isPriorFetching,
  } = useYearlySummary(selectedYear - 1);

  const isLoading = isCurrentLoading || isCurrentFetching;
  const isPriorPending = isPriorLoading || isPriorFetching;
  const hasPriorYear = Boolean(priorSummary?.monthlyBreakdown.length);
  const chartData = (summary?.monthlyBreakdown ?? []).map((row) => ({
    month: monthNameShort(row.month),
    Income: row.totalIncome,
    Expenses: row.totalExpense,
  }));

  function goToPreviousYear() {
    setSelectedYear((year) => year - 1);
  }

  function goToNextYear() {
    if (selectedYear >= currentYear) return;
    setSelectedYear((year) => year + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">
          {selectedYear} overview
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousYear}
            className="rounded-full p-1.5 text-muted hover:text-ink"
            title="Previous year"
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>

          <span className="min-w-10 text-center text-sm font-medium text-ink">
            {selectedYear}
          </span>

          <button
            type="button"
            onClick={goToNextYear}
            disabled={selectedYear >= currentYear}
            className={cn(
              "rounded-full p-1.5",
              selectedYear >= currentYear
                ? "cursor-not-allowed text-muted opacity-40"
                : "text-muted hover:text-ink",
            )}
            title={
              selectedYear >= currentYear
                ? "Cannot navigate to a future year"
                : "Next year"
            }
          >
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-card bg-danger-surface p-4 text-sm font-medium text-white">
          Failed to load yearly data. Please try again.
        </div>
      )}

      <PeriodSummaryCards
        totalIncome={summary?.totalIncome ?? 0}
        totalExpense={summary?.totalExpense ?? 0}
        savings={summary?.savings ?? 0}
        savingsRate={String(summary?.savingsRate ?? "0.0")}
        isLoading={isLoading}
      />

      {!isLoading &&
        !isPriorPending &&
        hasPriorYear &&
        priorSummary &&
        summary && (
          <div className="flex flex-wrap gap-4 surface-card rounded-card bg-surface p-4 text-sm">
            <span className="w-full text-xs font-medium text-muted">
              Compared to {selectedYear - 1}
            </span>
            <ComparisonPill
              label="Income"
              diff={summary.totalIncome - priorSummary.totalIncome}
              positiveIsGood
            />
            <ComparisonPill
              label="Expenses"
              diff={summary.totalExpense - priorSummary.totalExpense}
              positiveIsGood={false}
            />
            <ComparisonPill
              label="Savings"
              diff={summary.savings - priorSummary.savings}
              positiveIsGood
            />
          </div>
        )}

      {!isLoading && chartData.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted">
            Income vs expenses – {selectedYear}
          </h4>
          <div className="surface-card rounded-card bg-surface p-5">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                Income
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-danger" />
                Expenses
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                barGap={3}
                barSize={16}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--ds-chart-tick)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--ds-chart-tick)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    `$${(Number(value) / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  content={<YearlyChartTooltip />}
                  cursor={{ fill: "var(--ds-canvas)", opacity: 0.5 }}
                />
                <Bar
                  dataKey="Income"
                  fill="var(--ds-primary)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Expenses"
                  fill="var(--ds-danger)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h4 className="text-sm font-medium text-muted">
            Monthly breakdown
          </h4>
          {hasPriorYear && (
            <span className="text-xs text-muted">
              Savings vs {selectedYear - 1} shown in last column
            </span>
          )}
        </div>
        <BreakdownTable
          rows={summary?.monthlyBreakdown ?? []}
          year={selectedYear}
          comparisonRows={
            hasPriorYear ? priorSummary?.monthlyBreakdown : undefined
          }
          comparisonYear={selectedYear - 1}
          isLoading={isLoading}
        />
      </div>

      {!isLoading && summary && (
        <p className="text-right text-xs text-muted">
          {summary.transactionCount?.toLocaleString() ?? 0} transactions in{" "}
          {selectedYear}
        </p>
      )}
    </div>
  );
}

function ComparisonPill({
  label,
  diff,
  positiveIsGood,
}: {
  label: string;
  diff: number;
  positiveIsGood: boolean;
}) {
  const isBetter = positiveIsGood ? diff >= 0 : diff <= 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">{label}</span>
      <span
        className={cn(
          "text-xs font-medium",
          isBetter ? "text-success" : "text-danger",
        )}
      >
        {diff >= 0 ? "Up" : "Down"} {formatDollar(Math.abs(diff))}
      </span>
    </div>
  );
}
