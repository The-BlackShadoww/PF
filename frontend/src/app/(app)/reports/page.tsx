"use client";

import { format } from "date-fns";
import { AlertCircle, Download, FileSpreadsheet, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";

import { PageHeader } from "@/components/layouts/PageHeader";
import { DownloadHistoryList } from "@/components/reports/DownloadHistoryList";
import { ReportPreviewCard } from "@/components/reports/ReportPreviewCard";
import { reportsApi } from "@/lib/api/reports";
import {
  type DownloadHistoryEntry,
  useDownloadHistory,
} from "@/lib/hooks/useDownloadHistory";
import { useReportPreview } from "@/lib/hooks/useReportPreview";
import { cn } from "@/lib/utils/cn";

type ReportFormat = "csv" | "pdf";

const TODAY = format(new Date(), "yyyy-MM-dd");

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [format_, setFormat] = useState<ReportFormat>("csv");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const validStartDate = startDate || null;
  const validEndDate = endDate || null;
  const dateRangeError =
    validStartDate && validEndDate && endDate < startDate
      ? "End date must be on or after the start date"
      : null;
  const canDownload = Boolean(
    validStartDate && validEndDate && !dateRangeError && !isDownloading,
  );

  const { data: preview, isLoading: isPreviewLoading } = useReportPreview(
    dateRangeError ? null : validStartDate,
    dateRangeError ? null : validEndDate,
  );
  const { history, addEntry, clearHistory } = useDownloadHistory();

  const triggerDownload = useCallback(
    async (
      dlStartDate: string,
      dlEndDate: string,
      dlFormat: ReportFormat,
    ) => {
      setIsDownloading(true);
      setDownloadError(null);

      let objectUrl: string | null = null;

      try {
        const blob =
          dlFormat === "csv"
            ? await reportsApi.downloadCsv({
                startDate: dlStartDate,
                endDate: dlEndDate,
              })
            : await reportsApi.downloadPdf({
                startDate: dlStartDate,
                endDate: dlEndDate,
              });

        objectUrl = URL.createObjectURL(blob);

        const filename = `report_${dlStartDate}_to_${dlEndDate}.${dlFormat}`;
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        addEntry({
          id: crypto.randomUUID(),
          format: dlFormat,
          startDate: dlStartDate,
          endDate: dlEndDate,
          downloadedAt: new Date().toISOString(),
          filename,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Download failed. Please try again.";
        setDownloadError(message);
      } finally {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        setIsDownloading(false);
      }
    },
    [addEntry],
  );

  function handleDownloadClick() {
    if (!canDownload) return;
    triggerDownload(startDate, endDate, format_);
  }

  function handleRedownload(entry: DownloadHistoryEntry) {
    triggerDownload(entry.startDate, entry.endDate, entry.format);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Reports"
        description="Download your financial data for any date range."
      />

      <div className="rounded-3xl bg-white p-6">
        <h2 className="text-base font-black text-[#0e0f0c]">
          Configure report
        </h2>

        <div className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#454745]">
              Date range
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs text-[#868685]">From</span>
                <input
                  type="date"
                  value={startDate}
                  max={TODAY}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setDownloadError(null);
                  }}
                  className={cn(
                    "h-11 w-full rounded-xl border px-4 text-sm text-[#0e0f0c] outline-none transition focus:ring-2 focus:ring-[#9fe870]",
                    dateRangeError ? "border-[#d03238]" : "border-[#0e0f0c]",
                  )}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs text-[#868685]">To</span>
                <input
                  type="date"
                  value={endDate}
                  max={TODAY}
                  min={startDate || undefined}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setDownloadError(null);
                  }}
                  className={cn(
                    "h-11 w-full rounded-xl border px-4 text-sm text-[#0e0f0c] outline-none transition focus:ring-2 focus:ring-[#9fe870]",
                    dateRangeError ? "border-[#d03238]" : "border-[#0e0f0c]",
                  )}
                />
              </label>
            </div>
            {dateRangeError ? (
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#a7000d]">
                <AlertCircle size={12} />
                {dateRangeError}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#454745]">
              Format
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormatButton
                active={format_ === "csv"}
                icon={FileSpreadsheet}
                title="CSV"
                description="Opens in Excel, Google Sheets, or any spreadsheet app"
                onClick={() => setFormat("csv")}
              />
              <FormatButton
                active={format_ === "pdf"}
                icon={FileText}
                title="PDF"
                description="Formatted report for printing or sharing"
                onClick={() => setFormat("pdf")}
              />
            </div>
          </div>
        </div>
      </div>

      <ReportPreviewCard
        preview={preview}
        isLoading={isPreviewLoading}
        startDate={dateRangeError ? null : validStartDate}
        endDate={dateRangeError ? null : validEndDate}
      />

      <div className="space-y-3">
        <button
          onClick={handleDownloadClick}
          disabled={!canDownload}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-3xl px-6 py-3 text-sm font-semibold transition",
            canDownload
              ? "bg-[#9fe870] text-[#0e0f0c] hover:bg-[#cdffad]"
              : "cursor-not-allowed bg-white text-[#868685]",
          )}
        >
          {isDownloading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0e0f0c]/30 border-t-[#0e0f0c]" />
              Generating {format_.toUpperCase()}...
            </>
          ) : (
            <>
              <Download size={16} />
              Download {format_.toUpperCase()} Report
            </>
          )}
        </button>

        {downloadError ? (
          <div className="flex items-start justify-between gap-3 rounded-3xl bg-[#320707] p-4 text-white">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold">{downloadError}</p>
            </div>
            <button
              onClick={() => setDownloadError(null)}
              className="flex-shrink-0 text-white/70 transition hover:text-white"
              aria-label="Dismiss download error"
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        {!canDownload && !isDownloading ? (
          <p className="text-center text-xs text-[#868685]">
            {!validStartDate || !validEndDate
              ? "Select a start and end date to download"
              : dateRangeError || ""}
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl bg-white p-6">
        <DownloadHistoryList
          history={history}
          onRedownload={handleRedownload}
          onClear={clearHistory}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
}

function FormatButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: typeof FileText;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-28 flex-col items-start gap-2 rounded-3xl p-5 text-left transition",
        active ? "bg-[#e2f6d5]" : "bg-[#e8ebe6] hover:bg-[#e2f6d5]",
      )}
    >
      <div className="flex w-full items-center gap-2">
        <Icon size={18} className="text-[#0e0f0c]" />
        <span className="text-sm font-black text-[#0e0f0c]">{title}</span>
        {active ? (
          <span className="ml-auto rounded-full bg-[#9fe870] px-2 py-0.5 text-xs font-semibold text-[#0e0f0c]">
            Selected
          </span>
        ) : null}
      </div>
      <p className="text-xs leading-5 text-[#454745]">{description}</p>
    </button>
  );
}
