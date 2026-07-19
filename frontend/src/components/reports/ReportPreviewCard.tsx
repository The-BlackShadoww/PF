import { formatCurrency } from "@/lib/utils/currency";
import { clsx } from "clsx";

type PreviewData = {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  transactionCount: number;
  monthsIncluded: number;
};

type ReportPreviewCardProps = {
  preview: PreviewData | null;
  isLoading: boolean;
  startDate: string | null;
  endDate: string | null;
};

export function ReportPreviewCard({
  preview,
  isLoading,
  startDate,
  endDate,
}: ReportPreviewCardProps) {
  if (!startDate || !endDate) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-gray-500">
          Select a date range to see a preview of your report
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm text-gray-500">Your report will include:</h3>
      <ul className="space-y-2">
        <li className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Months of data</span>
          <span className="font-semibold text-gray-900">
            {preview.monthsIncluded}{" "}
            {preview.monthsIncluded === 1 ? "month" : "months"} of data
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Transactions</span>
          <span className="font-semibold text-gray-900">
            {preview.transactionCount} transactions
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Total income</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(preview.totalIncome)}
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Total expenses</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(preview.totalExpense)}
          </span>
        </li>
        <li className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="text-sm text-gray-500">Net savings</span>
          <span
            className={clsx(
              "font-semibold",
              preview.savings >= 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {formatCurrency(preview.savings)}
          </span>
        </li>
      </ul>
    </div>
  );
}
