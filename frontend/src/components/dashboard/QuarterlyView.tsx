"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { useQuarterlySummary } from "@/lib/hooks/useQuarterlySummary";
import { cn } from "@/lib/utils/cn";

import { BreakdownTable } from "./BreakdownTable";
import { PeriodSummaryCards } from "./PeriodSummaryCards";

const QUARTERS = [
  { q: 1, label: "Q1", months: "Jan - Mar" },
  { q: 2, label: "Q2", months: "Apr - Jun" },
  { q: 3, label: "Q3", months: "Jul - Sep" },
  { q: 4, label: "Q4", months: "Oct - Dec" },
] as const;

function getCurrentQuarter() {
  return Math.floor(new Date().getMonth() / 3) + 1;
}

export function QuarterlyView() {
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);

  const {
    data: summary,
    isLoading,
    isFetching,
    error,
  } = useQuarterlySummary(selectedYear, selectedQuarter);
  const selectedQuarterMeta =
    QUARTERS.find((quarter) => quarter.q === selectedQuarter) ?? QUARTERS[0];
  const isCurrentQuarter =
    selectedYear === currentYear && selectedQuarter === currentQuarter;

  function goToPreviousQuarter() {
    setSelectedQuarter((quarter) => {
      if (quarter > 1) return (quarter - 1) as typeof selectedQuarter;
      setSelectedYear((year) => year - 1);
      return 4;
    });
  }

  function goToNextQuarter() {
    if (isCurrentQuarter) return;

    setSelectedQuarter((quarter) => {
      if (quarter < 4) return (quarter + 1) as typeof selectedQuarter;
      setSelectedYear((year) => year + 1);
      return 1;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full bg-[#e8ebe6] p-1">
          {QUARTERS.map(({ q, label, months }) => {
            const isFutureQuarter =
              selectedYear === currentYear && q > currentQuarter;

            return (
              <button
                key={q}
                type="button"
                onClick={() => setSelectedQuarter(q)}
                disabled={isFutureQuarter}
                className={cn(
                  "flex min-w-16 flex-col items-center rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  selectedQuarter === q
                    ? "bg-[#9fe870] text-[#0e0f0c]"
                    : "text-[#454745] hover:text-[#0e0f0c]",
                  isFutureQuarter &&
                    "cursor-not-allowed text-[#868685] opacity-50 hover:text-[#868685]",
                )}
                title={
                  isFutureQuarter
                    ? "Cannot navigate to a future quarter"
                    : months
                }
              >
                {label}
                <span
                  className={cn(
                    "mt-0.5 text-[10px] font-normal",
                    selectedQuarter === q ? "text-[#454745]" : "text-[#868685]",
                    isFutureQuarter && "text-[#868685]",
                  )}
                >
                  {months.replace(" - ", "-")}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousQuarter}
            className="rounded-full p-1.5 text-[#454745] transition-colors hover:bg-[#e8ebe6] hover:text-[#0e0f0c]"
            title="Previous quarter"
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>

          <div className="min-w-16 text-center text-sm font-semibold text-[#0e0f0c]">
            {selectedYear}
          </div>

          <button
            type="button"
            onClick={goToNextQuarter}
            disabled={isCurrentQuarter}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              isCurrentQuarter
                ? "cursor-not-allowed text-[#868685] opacity-40"
                : "text-[#454745] hover:bg-[#e8ebe6] hover:text-[#0e0f0c]",
            )}
            title={
              isCurrentQuarter
                ? "Cannot navigate to a future quarter"
                : "Next quarter"
            }
          >
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-black text-[#0e0f0c]">
          {selectedQuarterMeta.label} {selectedYear}
        </h3>
        <p className="mt-0.5 text-xs text-[#868685]">
          {selectedQuarterMeta.months} {selectedYear}
        </p>
      </div>

      {error && (
        <div className="rounded-3xl bg-[#320707] p-4 text-sm font-semibold text-white">
          Failed to load quarterly data. Please try again.
        </div>
      )}

      <PeriodSummaryCards
        totalIncome={summary?.totalIncome ?? 0}
        totalExpense={summary?.totalExpense ?? 0}
        savings={summary?.savings ?? 0}
        savingsRate={summary?.savingsRate ?? "0.0"}
        isLoading={isLoading || isFetching}
      />

      <div>
        <h4 className="mb-3 text-sm font-semibold text-[#454745]">
          Monthly Breakdown
        </h4>
        <BreakdownTable
          rows={summary?.monthlyBreakdown ?? []}
          year={selectedYear}
          isLoading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}
