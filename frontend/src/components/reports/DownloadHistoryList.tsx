"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Clock, Download, Trash2 } from "lucide-react";

import type { DownloadHistoryEntry } from "@/lib/hooks/useDownloadHistory";
import { cn } from "@/lib/utils/cn";

interface DownloadHistoryListProps {
  history: DownloadHistoryEntry[];
  onRedownload: (entry: DownloadHistoryEntry) => void;
  onClear: () => void;
  isDownloading: boolean;
}

export function DownloadHistoryList({
  history,
  onRedownload,
  onClear,
  isDownloading,
}: DownloadHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-[#868685]">
        <Clock size={13} />
        <span>No reports downloaded yet. Your history will appear here.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#454745]" />
          <span className="text-xs font-semibold uppercase tracking-normal text-[#454745]">
            Download history
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-semibold text-[#868685] transition hover:text-[#a7000d]"
          title="Clear download history"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const startLabel = format(parseISO(entry.startDate), "MMM d, yyyy");
          const endLabel = format(parseISO(entry.endDate), "MMM d, yyyy");
          const rangeLabel =
            entry.startDate === entry.endDate
              ? startLabel
              : `${startLabel} to ${endLabel}`;
          const timeAgo = formatDistanceToNow(parseISO(entry.downloadedAt), {
            addSuffix: true,
          });

          return (
            <div
              key={entry.id}
              className="group flex items-center gap-3 rounded-2xl bg-[#e8ebe6] p-3 transition hover:bg-[#e2f6d5]"
            >
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-normal",
                  entry.format === "csv"
                    ? "bg-[#e2f6d5] text-[#054d28]"
                    : "bg-[#320707] text-white",
                )}
              >
                {entry.format}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0e0f0c]">
                  {rangeLabel}
                </p>
                <p className="mt-0.5 text-xs text-[#868685]">{timeAgo}</p>
              </div>

              <button
                onClick={() => onRedownload(entry)}
                disabled={isDownloading}
                className={cn(
                  "flex-shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#454745] transition hover:text-[#0e0f0c]",
                  "hidden sm:flex sm:opacity-0 sm:group-hover:opacity-100",
                  isDownloading && "cursor-not-allowed opacity-30",
                )}
                title={`Re-download ${entry.filename}`}
              >
                <Download size={12} />
                Download
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-[#868685]">
        Showing last {history.length} download{history.length !== 1 ? "s" : ""}.
        History is stored on this device only.
      </p>
    </div>
  );
}
