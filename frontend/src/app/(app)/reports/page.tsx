"use client";

import { useState } from "react";
import { format } from "date-fns";
import { clsx } from "clsx";
import { reportsApi } from "@/lib/api/reports";
import { useReportPreview } from "@/lib/hooks/useReportPreview";
import { ReportPreviewCard } from "@/components/reports/ReportPreviewCard";
import {
  DownloadHistory,
  addToHistory,
  type DownloadHistoryEntry,
} from "@/components/reports/DownloadHistory";
import { Spinner } from "@/components/ui/Spinner";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [reportFormat, setReportFormat] = useState<"csv" | "pdf">("csv");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: preview, isLoading } = useReportPreview(startDate, endDate);

  const isDateInvalid = Boolean(startDate && endDate && endDate < startDate);
  const today = format(new Date(), "yyyy-MM-dd");

  const triggerDownload = async (
    overrideStartDate?: string,
    overrideEndDate?: string,
    overrideFormat?: "csv" | "pdf",
  ) => {
    const finalStart = overrideStartDate || startDate;
    const finalEnd = overrideEndDate || endDate;
    const finalFormat = overrideFormat || reportFormat;

    if (!finalStart || !finalEnd) return;

    setIsDownloading(true);
    setError(null);

    try {
      // 1. Fetch the blob from the API
      const blob =
        finalFormat === "csv"
          ? await reportsApi.downloadCsv({
              startDate: finalStart,
              endDate: finalEnd,
            })
          : await reportsApi.downloadPdf({
              startDate: finalStart,
              endDate: finalEnd,
            });

      if (typeof window === "undefined") return;

      // 2. Create a temporary object URL
      const url = URL.createObjectURL(blob);

      // 3. Create a hidden anchor element, set the download attribute, click it
      const filename = `report_${finalStart}_to_${finalEnd}.${finalFormat}`;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();

      // 4. Clean up
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      // 5. Add to download history
      addToHistory({
        id: crypto.randomUUID(),
        format: finalFormat,
        startDate: finalStart,
        endDate: finalEnd,
        downloadedAt: new Date().toISOString(),
        filename,
      });
    } catch (err) {
      setError("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRedownload = (entry: DownloadHistoryEntry) => {
    setStartDate(entry.startDate);
    setEndDate(entry.endDate);
    setReportFormat(entry.format);
    triggerDownload(entry.startDate, entry.endDate, entry.format);
  };

  const isButtonDisabled =
    !startDate || !endDate || isDateInvalid || isDownloading;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-500">Download your financial data</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Configure your report
            </h2>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">
                    From
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    max={today}
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">To</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    max={today}
                    value={endDate || ""}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {isDateInvalid && (
                <p className="mt-2 text-sm text-red-600">
                  End date cannot be before start date.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Format
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setReportFormat("csv")}
                  className={clsx(
                    "flex flex-1 flex-col items-center justify-center rounded-lg border p-4 transition-colors",
                    reportFormat === "csv"
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <span className="font-semibold uppercase tracking-wider">
                    CSV
                  </span>
                  <span
                    className={clsx(
                      "mt-1 text-center text-xs",
                      reportFormat === "csv"
                        ? "text-gray-300"
                        : "text-gray-500",
                    )}
                  >
                    Spreadsheet-compatible, opens in Excel or Google Sheets
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportFormat("pdf")}
                  className={clsx(
                    "flex flex-1 flex-col items-center justify-center rounded-lg border p-4 transition-colors",
                    reportFormat === "pdf"
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <span className="font-semibold uppercase tracking-wider">
                    PDF
                  </span>
                  <span
                    className={clsx(
                      "mt-1 text-center text-xs",
                      reportFormat === "pdf"
                        ? "text-gray-300"
                        : "text-gray-500",
                    )}
                  >
                    Formatted report, ideal for printing or sharing
                  </span>
                </button>
              </div>
            </div>
          </section>

          <div>
            <button
              onClick={() => triggerDownload()}
              disabled={isButtonDisabled}
              className="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isDownloading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Downloading...
                </>
              ) : (
                `Download ${reportFormat.toUpperCase()} Report`
              )}
            </button>

            {error && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ReportPreviewCard
            preview={preview ?? null}
            isLoading={isLoading}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

      <DownloadHistory onRedownload={handleRedownload} />
    </div>
  );
}
