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
  // Empty state — no date range selected
  if (!startYear || !startMonth || !endYear || !endMonth) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-canvas px-8 py-12 text-center">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-surface shadow-sm">
          <FileText size={18} className="text-muted" />
        </div>
        <p className="text-sm font-semibold text-ink">Preview will appear here</p>
        <p className="mt-1 max-w-[200px] text-xs text-muted leading-relaxed">
          Pick a date range to see a summary before downloading.
        </p>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-card bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-canvas" />
            <div className="h-3 w-20 animate-pulse rounded bg-canvas" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-canvas" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-panel bg-canvas" />
          ))}
        </div>
        <div className="mt-4 h-3 w-3/4 animate-pulse rounded bg-canvas" />
      </div>
    );
  }

  // Populated preview
  if (preview) {
    const startLabel = format(new Date(startYear, startMonth - 1, 1), "MMM yyyy");
    const endLabel = format(new Date(endYear, endMonth - 1, 1), "MMM yyyy");
    const periodLabel =
      startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;

    const netPositive = preview.savings >= 0;

    return (
      <div className="rounded-card bg-surface p-5">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Report preview</p>
            <p className="mt-0.5 text-xs text-muted">{periodLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs font-medium text-muted">
            <Calendar size={12} />
            <span>
              {preview.monthsIncluded} mo{preview.monthsIncluded !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={TrendingUp}
            label="Income"
            value={formatDollar(preview.totalIncome)}
            colorClass="bg-accent text-success"
          />
          <MetricCard
            icon={TrendingDown}
            label="Expenses"
            value={formatDollar(preview.totalExpense)}
            colorClass="bg-canvas text-danger"
          />
          <MetricCard
            icon={Wallet}
            label="Net savings"
            value={`${preview.savings < 0 ? "−" : ""}${formatDollar(preview.savings)}`}
            colorClass={netPositive ? "bg-chart-peach/20 text-ink" : "bg-chart-yellow/30 text-warning-ink"}
          />
          <MetricCard
            icon={Hash}
            label="Transactions"
            value={preview.transactionCount.toLocaleString()}
            colorClass="bg-ink text-primary"
          />
        </div>

        {/* Footer note */}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Your download will include all{" "}
          {preview.transactionCount.toLocaleString()} transaction
          {preview.transactionCount !== 1 ? "s" : ""} from this period.
        </p>
      </div>
    );
  }

  // No data for period
  return (
    <div className="rounded-card bg-surface p-5 text-center">
      <p className="text-sm font-semibold text-muted">No data for this period.</p>
      <p className="mt-1 text-xs text-muted">Try widening your date range.</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className={`rounded-panel p-4 ${colorClass}`}>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={12} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-base font-black leading-none">{value}</p>
    </div>
  );
}
