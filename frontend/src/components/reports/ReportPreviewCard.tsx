"use client";

import { format } from "date-fns";
import {
  Calendar,
  FileText,
  Hash,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import type { ReportPreviewData } from "@/lib/hooks/useReportPreview";

function formatDollar(amount: number): string {
  const abs = Math.abs(amount);
  return `$${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface ReportPreviewCardProps {
  preview: ReportPreviewData | undefined;
  isLoading: boolean;
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
}

export function ReportPreviewCard({
  preview,
  isLoading,
  startYear,
  startMonth,
  endYear,
  endMonth,
}: ReportPreviewCardProps) {
  if (!startYear || !startMonth || !endYear || !endMonth) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#868685] bg-[#e8ebe6] p-8 text-center">
        <FileText size={32} className="mb-3 text-[#868685]" />
        <p className="text-sm font-semibold text-[#454745]">
          Select a date range to preview your report
        </p>
        <p className="mt-1 text-xs text-[#868685]">
          You will see a summary of what the report includes before downloading.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-3xl bg-white p-5">
        <div className="h-4 w-1/3 animate-pulse rounded bg-[#e8ebe6]" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-[#e8ebe6]"
            />
          ))}
        </div>
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#e8ebe6]" />
      </div>
    );
  }

  if (preview) {
    const startLabel = format(new Date(startYear, startMonth - 1, 1), "MMM yyyy");
    const endLabel = format(new Date(endYear, endMonth - 1, 1), "MMM yyyy");
    const periodLabel =
      startLabel === endLabel ? startLabel : `${startLabel} to ${endLabel}`;

    return (
      <div className="rounded-3xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-base font-black text-[#0e0f0c]">
              Report preview
            </p>
            <p className="mt-0.5 text-xs text-[#868685]">{periodLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#e8ebe6] px-3 py-1 text-xs font-semibold text-[#454745]">
            <Calendar size={13} />
            <span>
              {preview.monthsIncluded} month
              {preview.monthsIncluded !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <MetricCard
            icon={TrendingUp}
            label="Total Income"
            value={formatDollar(preview.totalIncome)}
            className="bg-[#e2f6d5] text-[#054d28]"
          />
          <MetricCard
            icon={TrendingDown}
            label="Total Expenses"
            value={formatDollar(preview.totalExpense)}
            className="bg-[#e8ebe6] text-[#a7000d]"
          />
          <MetricCard
            icon={Wallet}
            label="Net Savings"
            value={`${preview.savings < 0 ? "-" : ""}${formatDollar(
              preview.savings,
            )}`}
            className={
              preview.savings >= 0
                ? "bg-[#ffc091] text-[#0e0f0c]"
                : "bg-[#ffd11a] text-[#4a3b1c]"
            }
          />
          <MetricCard
            icon={Hash}
            label="Transactions"
            value={preview.transactionCount.toLocaleString()}
            className="bg-[#0e0f0c] text-[#9fe870]"
          />
        </div>

        <p className="text-xs text-[#868685]">
          Your downloaded report will contain all{" "}
          {preview.transactionCount.toLocaleString()} transaction
          {preview.transactionCount !== 1 ? "s" : ""} from this period.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 text-center">
      <p className="text-sm font-semibold text-[#454745]">
        No data found for the selected period.
      </p>
      <p className="mt-1 text-xs text-[#868685]">Try a wider date range.</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${className}`}>
      <div className="mb-1 flex items-center gap-1.5">
        <Icon size={13} />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
