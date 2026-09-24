"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Clock, Download, FileSpreadsheet, FileText, Trash2 } from "lucide-react";

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
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted" />
          <h2 className="text-sm font-semibold text-ink">Download history</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-muted transition hover:text-danger"
            title="Clear download history"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex items-center gap-2 rounded-panel bg-canvas px-4 py-3 text-xs text-muted">
          <Clock size={13} />
          <span>No reports downloaded yet. Your history will appear here.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => {
            const startLabel = format(
              new Date(entry.startYear, entry.startMonth - 1, 1),
              "MMM yyyy",
            );
            const endLabel = format(
              new Date(entry.endYear, entry.endMonth - 1, 1),
              "MMM yyyy",
            );
            const rangeLabel =
              entry.startYear === entry.endYear && entry.startMonth === entry.endMonth
                ? startLabel
                : `${startLabel} – ${endLabel}`;
            const timeAgo = formatDistanceToNow(parseISO(entry.downloadedAt), {
              addSuffix: true,
            });
            const FormatIcon = entry.format === "csv" ? FileSpreadsheet : FileText;

            return (
              <div
                key={entry.id}
                className="group flex items-center gap-3 rounded-panel bg-canvas px-3 py-2.5 transition hover:bg-accent"
              >
                {/* Format badge */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]",
                    entry.format === "csv"
                      ? "bg-accent text-success"
                      : "bg-danger-surface/15 text-danger",
                  )}
                >
                  <FormatIcon size={13} />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{rangeLabel}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    <span className="uppercase">{entry.format}</span>
                    <span className="mx-1.5 text-line">·</span>
                    {timeAgo}
                  </p>
                </div>

                {/* Re-download */}
                <button
                  onClick={() => onRedownload(entry)}
                  disabled={isDownloading}
                  className={cn(
                    "hidden shrink-0 items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted transition hover:text-ink sm:flex",
                    "opacity-0 group-hover:opacity-100",
                    isDownloading && "cursor-not-allowed opacity-30",
                  )}
                  title={`Re-download ${entry.filename}`}
                >
                  <Download size={11} />
                  Again
                </button>
              </div>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {history.length} download{history.length !== 1 ? "s" : ""} · Stored on this
          device only.
        </p>
      )}
    </div>
  );
}
