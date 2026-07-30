'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Download, FileText, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import { ReportPreviewCard } from '../../../components/reports/ReportPreviewCard';
import { DownloadHistoryList } from '../../../components/reports/DownloadHistoryList';
import { useReportPreview } from '../../../lib/hooks/useReportPreview';
import { useDownloadHistory, DownloadHistoryEntry } from '../../../lib/hooks/useDownloadHistory';
import { reportsApi } from '../../../lib/api/reports';
import { cn } from '../../../lib/utils/cn';

type ReportFormat = 'csv' | 'pdf';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function ReportsPage() {

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [format_, setFormat] = useState<ReportFormat>('csv');

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const validStartDate = startDate || null;
  const validEndDate = endDate || null;

  const dateRangeError = (validStartDate && validEndDate && endDate < startDate)
    ? 'End date must be on or after the start date'
    : null;

  const canDownload = Boolean(validStartDate && validEndDate && !dateRangeError && !isDownloading);

  const { data: preview, isLoading: isPreviewLoading } = useReportPreview(
    dateRangeError ? null : validStartDate,
    dateRangeError ? null : validEndDate,
  );

  const { history, addEntry, clearHistory } = useDownloadHistory();

  const triggerDownload = useCallback(async (
    dlStartDate: string,
    dlEndDate: string,
    dlFormat: ReportFormat,
  ) => {
    setIsDownloading(true);
    setDownloadError(null);

    let objectUrl: string | null = null;

    try {
      const blob = dlFormat === 'csv'
        ? await reportsApi.downloadCsv({ startDate: dlStartDate, endDate: dlEndDate })
        : await reportsApi.downloadPdf({ startDate: dlStartDate, endDate: dlEndDate });

      objectUrl = URL.createObjectURL(blob);

      const filename = `report_${dlStartDate}_to_${dlEndDate}.${dlFormat}`;
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      const entry: DownloadHistoryEntry = {
        id: crypto.randomUUID(),
        format: dlFormat,
        startDate: dlStartDate,
        endDate: dlEndDate,
        downloadedAt: new Date().toISOString(),
        filename,
      };
      addEntry(entry);

    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : 'Download failed. Please try again.';
      setDownloadError(message);
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setIsDownloading(false);
    }
  }, [addEntry]);

  function handleDownloadClick() {
    if (!canDownload) return;
    triggerDownload(startDate, endDate, format_);
  }

  function handleRedownload(entry: DownloadHistoryEntry) {
    triggerDownload(entry.startDate, entry.endDate, entry.format);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Download your financial data for any date range
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Configure Report</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                max={TODAY}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDownloadError(null);
                }}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-gray-900',
                  dateRangeError ? 'border-red-400' : 'border-gray-300',
                )}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                max={TODAY}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDownloadError(null);
                }}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-gray-900',
                  dateRangeError ? 'border-red-400' : 'border-gray-300',
                )}
              />
            </div>
          </div>
          {dateRangeError && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              {dateRangeError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={cn(
                'flex flex-col items-start gap-1 p-4 border-2 rounded-xl transition-all text-left',
                format_ === 'csv'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
              )}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet
                  size={18}
                  className={format_ === 'csv' ? 'text-gray-900' : 'text-gray-400'}
                />
                <span className={cn(
                  'text-sm font-semibold',
                  format_ === 'csv' ? 'text-gray-900' : 'text-gray-600',
                )}>
                  CSV
                </span>
                {format_ === 'csv' && (
                  <span className="ml-auto text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Opens in Excel, Google Sheets, or any spreadsheet app
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={cn(
                'flex flex-col items-start gap-1 p-4 border-2 rounded-xl transition-all text-left',
                format_ === 'pdf'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
              )}
            >
              <div className="flex items-center gap-2">
                <FileText
                  size={18}
                  className={format_ === 'pdf' ? 'text-gray-900' : 'text-gray-400'}
                />
                <span className={cn(
                  'text-sm font-semibold',
                  format_ === 'pdf' ? 'text-gray-900' : 'text-gray-600',
                )}>
                  PDF
                </span>
                {format_ === 'pdf' && (
                  <span className="ml-auto text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Formatted report for printing or sharing
              </p>
            </button>

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
            'w-full flex items-center justify-center gap-2',
            'py-3 px-6 rounded-xl text-sm font-semibold transition-all',
            canDownload
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating {format_.toUpperCase()}...
            </>
          ) : (
            <>
              <Download size={16} />
              Download {format_.toUpperCase()} Report
            </>
          )}
        </button>

        {downloadError && (
          <div className="flex items-start justify-between gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{downloadError}</p>
            </div>
            <button
              onClick={() => setDownloadError(null)}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {!canDownload && !isDownloading && (
          <p className="text-xs text-center text-gray-400">
            {!validStartDate || !validEndDate
              ? 'Select a start and end date to download'
              : dateRangeError
                ? dateRangeError
                : ''}
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
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
