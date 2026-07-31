"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-slate-700">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="mb-1 flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-medium text-slate-950">
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
        <h3 className="text-base font-semibold text-slate-950">
          {selectedYear} Overview
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousYear}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            title="Previous year"
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>

          <span className="min-w-10 text-center text-sm font-semibold text-slate-950">
            {selectedYear}
          </span>

          <button
            type="button"
            onClick={goToNextYear}
            disabled={selectedYear >= currentYear}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              selectedYear >= currentYear
                ? "cursor-not-allowed text-slate-200"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
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
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
          <div className="flex flex-wrap gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
            <span className="w-full text-xs font-semibold uppercase tracking-wide text-slate-500">
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
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            Income vs Expenses - {selectedYear}
          </h4>
          <div className="rounded-md border border-slate-200 bg-white p-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                barGap={2}
                barSize={16}
              >
                <CartesianGrid
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    `$${(Number(value) / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip content={<YearlyChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                />
                <Bar dataKey="Income" fill="#16a34a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expenses" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h4 className="text-sm font-semibold text-slate-700">
            Monthly Breakdown
          </h4>
          {hasPriorYear && (
            <span className="text-xs text-slate-400">
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
        <p className="text-right text-xs text-slate-400">
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
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={cn(
          "text-xs font-semibold",
          isBetter ? "text-green-600" : "text-red-500",
        )}
      >
        {diff >= 0 ? "Up" : "Down"} {formatDollar(Math.abs(diff))}
      </span>
    </div>
  );
}
