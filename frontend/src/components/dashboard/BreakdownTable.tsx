"use client";

import type { MonthlyBreakdownItem } from "@/lib/api/calculations";
import { cn } from "@/lib/utils/cn";
import { formatDollar, monthName, savingsColorClass } from "@/lib/utils/format";

interface BreakdownTableProps {
  rows: MonthlyBreakdownItem[];
  year: number;
  comparisonRows?: MonthlyBreakdownItem[];
  comparisonYear?: number;
  isLoading: boolean;
}

function SkeletonRow({ cells }: { cells: number }) {
  return (
    <tr>
      {Array.from({ length: cells }, (_value, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}

export function BreakdownTable({
  rows,
  comparisonRows,
  comparisonYear,
  isLoading,
}: BreakdownTableProps) {
  const hasComparison = Boolean(comparisonRows && comparisonRows.length > 0);
  const totalSavings = rows.reduce((sum, row) => sum + row.savings, 0);

  function getComparisonRow(month: number): MonthlyBreakdownItem | undefined {
    return comparisonRows?.find((row) => row.month === month);
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Month
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Income
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Expenses
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Savings
              </th>
              {hasComparison && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  vs {comparisonYear}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 3 }, (_value, index) => (
                  <SkeletonRow key={index} cells={hasComparison ? 5 : 4} />
                ))
              : rows.map((row, index) => {
                  const comparison = getComparisonRow(row.month);
                  const savingsDiff =
                    comparison !== undefined
                      ? row.savings - comparison.savings
                      : null;
                  const hasActivity =
                    row.totalIncome !== 0 || row.totalExpense !== 0;

                  return (
                    <tr
                      key={row.month}
                      className={cn(
                        "transition-colors hover:bg-slate-50",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-slate-950">
                        {monthName(row.month)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-700">
                        {row.totalIncome > 0 ? (
                          formatDollar(row.totalIncome)
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {row.totalExpense > 0 ? (
                          formatDollar(row.totalExpense)
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-medium",
                          savingsColorClass(row.savings),
                        )}
                      >
                        {hasActivity ? (
                          <>
                            {row.savings < 0 ? "-" : ""}
                            {formatDollar(row.savings)}
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      {hasComparison && (
                        <td
                          className={cn(
                            "px-4 py-3 text-right text-xs font-medium",
                            savingsDiff === null
                              ? "text-slate-300"
                              : savingsDiff > 0
                                ? "text-green-600"
                                : savingsDiff < 0
                                  ? "text-red-500"
                                  : "text-slate-400",
                          )}
                        >
                          {savingsDiff === null ? (
                            "—"
                          ) : savingsDiff === 0 ? (
                            "No change"
                          ) : (
                            <>
                              {savingsDiff > 0 ? "Up " : "Down "}
                              {formatDollar(Math.abs(savingsDiff))}
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
          </tbody>
          {!isLoading && rows.length > 1 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-700">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-700">
                  {formatDollar(
                    rows.reduce((sum, row) => sum + row.totalIncome, 0),
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-600">
                  {formatDollar(
                    rows.reduce((sum, row) => sum + row.totalExpense, 0),
                  )}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-bold",
                    savingsColorClass(totalSavings),
                  )}
                >
                  {totalSavings < 0 ? "-" : ""}
                  {formatDollar(totalSavings)}
                </td>
                {hasComparison && <td className="px-4 py-3" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
