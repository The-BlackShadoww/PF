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
          <div className="h-4 animate-pulse rounded bg-[#e8ebe6]" />
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
    <div className="overflow-hidden rounded-3xl bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8ebe6] bg-[#e8ebe6]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-normal text-[#454745]">
                Month
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-normal text-[#454745]">
                Income
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-normal text-[#454745]">
                Expenses
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-normal text-[#454745]">
                Savings
              </th>
              {hasComparison && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-normal text-[#454745]">
                  vs {comparisonYear}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8ebe6]">
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
                        "",
                        index % 2 === 0 ? "bg-white" : "bg-[#e8ebe6]/35",
                      )}
                    >
                      <td className="px-4 py-3 font-semibold text-[#0e0f0c]">
                        {monthName(row.month)}
                      </td>
                      <td className="px-4 py-3 text-right text-[#054d28]">
                        {row.totalIncome > 0 ? (
                          formatDollar(row.totalIncome)
                        ) : (
                          <span className="text-[#868685]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-[#a7000d]">
                        {row.totalExpense > 0 ? (
                          formatDollar(row.totalExpense)
                        ) : (
                          <span className="text-[#868685]">-</span>
                        )}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-semibold",
                          savingsColorClass(row.savings),
                        )}
                      >
                        {hasActivity ? (
                          <>
                            {row.savings < 0 ? "-" : ""}
                            {formatDollar(row.savings)}
                          </>
                        ) : (
                          <span className="text-[#868685]">-</span>
                        )}
                      </td>
                      {hasComparison && (
                        <td
                          className={cn(
                            "px-4 py-3 text-right text-xs font-semibold",
                            savingsDiff === null
                              ? "text-[#868685]"
                              : savingsDiff > 0
                                ? "text-[#054d28]"
                                : savingsDiff < 0
                                  ? "text-[#a7000d]"
                                  : "text-[#868685]",
                          )}
                        >
                          {savingsDiff === null ? (
                            "-"
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
              <tr className="border-t-2 border-[#e8ebe6] bg-[#e8ebe6]">
                <td className="px-4 py-3 text-xs font-bold uppercase tracking-normal text-[#454745]">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#054d28]">
                  {formatDollar(
                    rows.reduce((sum, row) => sum + row.totalIncome, 0),
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#a7000d]">
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
