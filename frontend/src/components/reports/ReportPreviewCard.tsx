'use client';

import { FileText, TrendingUp, TrendingDown, Wallet, Hash, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ReportPreviewData } from '../../../lib/hooks/useReportPreview';

function formatDollar(amount: number): string {
  const abs = Math.abs(amount);
  return `$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface ReportPreviewCardProps {
  preview: ReportPreviewData | undefined;
  isLoading: boolean;
  startDate: string | null;
  endDate: string | null;
}

export function ReportPreviewCard({
  preview,
  isLoading,
  startDate,
  endDate,
}: ReportPreviewCardProps) {

  if (!startDate || !endDate) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center">
        <FileText size={32} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">
          Select a date range to preview your report
        </p>
        <p className="text-xs text-gray-400 mt-1">
          You'll see a summary of what the report will include before downloading
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
      </div>
    );
  }

  if (preview) {
    const startLabel = format(parseISO(startDate), 'MMM yyyy');
    const endLabel = format(parseISO(endDate), 'MMM yyyy');
    const periodLabel = startLabel === endLabel
      ? startLabel
      : `${startLabel} – ${endLabel}`;

    return (
      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Report Preview</p>
            <p className="text-xs text-gray-500 mt-0.5">{periodLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} />
            <span>{preview.monthsIncluded} month{preview.monthsIncluded !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={13} className="text-green-600" />
              <span className="text-xs text-green-700 font-medium">Total Income</span>
            </div>
            <p className="text-base font-bold text-green-700">
              {formatDollar(preview.totalIncome)}
            </p>
          </div>

          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={13} className="text-red-600" />
              <span className="text-xs text-red-700 font-medium">Total Expenses</span>
            </div>
            <p className="text-base font-bold text-red-700">
              {formatDollar(preview.totalExpense)}
            </p>
          </div>

          <div className={`p-3 border rounded-lg ${
            preview.savings >= 0
              ? 'bg-blue-50 border-blue-100'
              : 'bg-orange-50 border-orange-100'
          }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet size={13} className={preview.savings >= 0 ? 'text-blue-600' : 'text-orange-600'} />
              <span className={`text-xs font-medium ${preview.savings >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                Net Savings
              </span>
            </div>
            <p className={`text-base font-bold ${preview.savings >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {preview.savings < 0 ? '-' : ''}{formatDollar(preview.savings)}
            </p>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Hash size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">Transactions</span>
            </div>
            <p className="text-base font-bold text-gray-800">
              {preview.transactionCount.toLocaleString()}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Your downloaded report will contain all {preview.transactionCount} transaction{preview.transactionCount !== 1 ? 's' : ''} from this period.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl text-center">
      <p className="text-sm text-gray-500">No data found for the selected period.</p>
      <p className="text-xs text-gray-400 mt-1">Try a wider date range.</p>
    </div>
  );
}
