"use client";

import {
  AlertCircle,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { PageHeader } from "@/components/layouts/PageHeader";
import { DownloadHistoryList } from "@/components/reports/DownloadHistoryList";
import { ReportPreviewCard } from "@/components/reports/ReportPreviewCard";
import { Button } from "@/components/ui/Button";
import { reportsApi } from "@/lib/api/reports";
import { type DownloadHistoryEntry, useDownloadHistory } from "@/lib/hooks/useDownloadHistory";
import { useReportPreview } from "@/lib/hooks/useReportPreview";
import { cn } from "@/lib/utils/cn";

type ReportFormat = "csv" | "pdf";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const FORMAT_OPTIONS: Array<{ value: ReportFormat; Icon: typeof FileText; label: string; description: string }> = [
  { value: "csv", Icon: FileSpreadsheet, label: "CSV", description: "Spreadsheet-ready data" },
  { value: "pdf", Icon: FileText, label: "PDF", description: "Formatted for sharing" },
];

export default function ReportsPage() {
  const today = new Date();
  const [startMonth, setStartMonth] = useState(today.getMonth() + 1);
  const [startYear, setStartYear] = useState(today.getFullYear());
  const [endMonth, setEndMonth] = useState(today.getMonth() + 1);
  const [endYear, setEndYear] = useState(today.getFullYear());
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const dateRangeError =
    endYear < startYear || (endYear === startYear && endMonth < startMonth)
      ? "End period cannot be before start period."
      : null;

  const { data: preview, isLoading: isPreviewLoading } = useReportPreview(
    dateRangeError ? null : startYear,
    dateRangeError ? null : startMonth,
    dateRangeError ? null : endYear,
    dateRangeError ? null : endMonth,
  );

  const { history, addEntry, clearHistory } = useDownloadHistory();

  const download = useCallback(
    async (
      params: { startYear: number; startMonth: number; endYear: number; endMonth: number },
      reportFormat: ReportFormat,
    ) => {
      setIsDownloading(true);
      setDownloadError(null);
      let objectUrl: string | null = null;
      try {
        const blob =
          reportFormat === "csv"
            ? await reportsApi.downloadCsv(params)
            : await reportsApi.downloadPdf(params);
        objectUrl = URL.createObjectURL(blob);
        const filename = `report_${params.startYear}-${String(params.startMonth).padStart(2, "0")}_to_${params.endYear}-${String(params.endMonth).padStart(2, "0")}.${reportFormat}`;
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        addEntry({
          id: crypto.randomUUID(),
          format: reportFormat,
          ...params,
          downloadedAt: new Date().toISOString(),
          filename,
        });
      } catch (error) {
        setDownloadError(
          error instanceof Error ? error.message : "Download failed. Please try again.",
        );
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        setIsDownloading(false);
      }
    },
    [addEntry],
  );

  const params = { startYear, startMonth, endYear, endMonth };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Reports"
        description="Export your financial data for any billing period."
      />

      {/* Main grid: config left, preview right */}
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

        {/* ── Left column: configuration ── */}
        <div className="space-y-4">

          {/* Billing period card */}
          <section className="rounded-card bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={15} className="text-muted" />
              <h2 className="text-sm font-semibold text-ink">Billing period</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["From", startMonth, setStartMonth, startYear, setStartYear],
                  ["To", endMonth, setEndMonth, endYear, setEndYear],
                ] as const
              ).map(([label, month, setMonth, year, setYear]) => (
                <div key={label} className="rounded-panel border border-line bg-canvas p-3">
                  <p className="mb-2 text-xs font-medium text-muted">{label}</p>
                  <div className="flex gap-2">
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="h-9 flex-1 rounded-[10px] border border-line bg-surface px-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={name} value={idx + 1}>{name}</option>
                      ))}
                    </select>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="h-9 w-[86px] rounded-[10px] border border-line bg-surface px-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {dateRangeError && (
              <p className="mt-3 flex items-center gap-1.5 rounded-panel bg-danger-surface/10 px-3 py-2 text-xs font-medium text-danger">
                <AlertCircle size={13} />
                {dateRangeError}
              </p>
            )}
          </section>

          {/* Format selector — pill tabs */}
          <section className="rounded-card bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Export format</h2>
            <div
              className="inline-flex w-full rounded-control border border-line bg-subtle p-1"
              role="tablist"
              aria-label="Report format"
            >
              {FORMAT_OPTIONS.map(({ value, Icon, label, description }) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={format === value}
                  onClick={() => setFormat(value)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2.5 rounded-[12px] px-4 py-2.5 text-sm font-medium transition-colors duration-150",
                    format === value ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {format === value && (
                    <motion.span
                      layoutId="report-format-indicator"
                      className="absolute inset-0 rounded-[12px] bg-surface shadow-sm"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 30 }
                      }
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon size={15} />
                    <span>{label}</span>
                    <span className={cn(
                      "hidden text-xs sm:inline-block",
                      format === value ? "text-muted" : "text-muted/50",
                    )}>
                      — {description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Download button */}
          <Button
            onClick={() => !dateRangeError && download(params, format)}
            disabled={Boolean(dateRangeError || isDownloading)}
            className="h-11 w-full px-6"
          >
            <Download size={15} />
            {isDownloading ? "Generating…" : `Download ${format.toUpperCase()} Report`}
          </Button>

          {/* Error banner */}
          <AnimatePresence>
            {downloadError && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex items-start justify-between gap-3 rounded-card bg-danger-surface p-4 text-sm text-white"
              >
                <p>{downloadError}</p>
                <button
                  onClick={() => setDownloadError(null)}
                  className="mt-0.5 shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right column: preview ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ReportPreviewCard
            preview={preview}
            isLoading={isPreviewLoading}
            {...params}
          />
        </div>
      </div>

      {/* Download history */}
      <section className="rounded-card bg-surface p-5">
        <DownloadHistoryList
          history={history}
          onRedownload={(entry: DownloadHistoryEntry) => download(entry, entry.format)}
          onClear={clearHistory}
          isDownloading={isDownloading}
        />
      </section>
    </div>
  );
}
