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
      <div className="flex items-center gap-2 py-2 text-xs text-muted">
        <Clock size={13} />
        <span>No reports downloaded yet. Your history will appear here.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted" />
          <span className="text-xs font-semibold uppercase tracking-normal text-muted">
            Download history
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-danger"
          title="Clear download history"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const startLabel = format(new Date(entry.startYear, entry.startMonth - 1, 1), "MMMM yyyy");
          const endLabel = format(new Date(entry.endYear, entry.endMonth - 1, 1), "MMMM yyyy");
          const rangeLabel =
            entry.startYear === entry.endYear && entry.startMonth === entry.endMonth
              ? startLabel
              : `${startLabel} to ${endLabel}`;
          const timeAgo = formatDistanceToNow(parseISO(entry.downloadedAt), {
            addSuffix: true,
          });

          return (
            <div
              key={entry.id}
              className="group flex items-center gap-3 rounded-panel bg-canvas p-3 transition hover:bg-accent"
            >
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-normal",
                  entry.format === "csv"
                    ? "bg-accent text-success"
                    : "bg-danger-surface text-white",
                )}
              >
                {entry.format}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {rangeLabel}
                </p>
                <p className="mt-0.5 text-xs text-muted">{timeAgo}</p>
              </div>

              <button
                onClick={() => onRedownload(entry)}
                disabled={isDownloading}
                className={cn(
                  "flex-shrink-0 items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-ink",
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

      <p className="mt-3 text-xs text-muted">
        Showing last {history.length} download{history.length !== 1 ? "s" : ""}.
        History is stored on this device only.
      </p>
    </div>
  );
}
