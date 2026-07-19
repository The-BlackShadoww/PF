"use client";

import { useEffect, useState } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { clsx } from "clsx";

export type DownloadHistoryEntry = {
  id: string;
  format: "csv" | "pdf";
  startDate: string;
  endDate: string;
  downloadedAt: string;
  filename: string;
};

const HISTORY_KEY = "report_download_history";

export function addToHistory(entry: DownloadHistoryEntry) {
  if (typeof window === "undefined") return;

  try {
    const existing = localStorage.getItem(HISTORY_KEY);
    const history: DownloadHistoryEntry[] = existing ? JSON.parse(existing) : [];

    history.unshift(entry);
    const trimmed = history.slice(0, 10);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));

    window.dispatchEvent(new Event("report_download_history_updated"));
  } catch (error) {
    console.error("Failed to update download history", error);
  }
}

export function DownloadHistory({
  onRedownload,
}: {
  onRedownload: (entry: DownloadHistoryEntry) => void;
}) {
  const [history, setHistory] = useState<DownloadHistoryEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const loadHistory = () => {
      try {
        const existing = localStorage.getItem(HISTORY_KEY);
        if (existing) {
          setHistory(JSON.parse(existing));
        }
      } catch (error) {
        console.error("Failed to load download history", error);
      }
    };

    loadHistory();

    window.addEventListener("report_download_history_updated", loadHistory);
    return () => {
      window.removeEventListener("report_download_history_updated", loadHistory);
    };
  }, []);

  if (!isClient) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Download History
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500">No reports downloaded yet</p>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center space-x-4">
                <span
                  className={clsx(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium uppercase",
                    entry.format === "csv"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800",
                  )}
                >
                  {entry.format}
                </span>

                <span className="text-sm font-medium text-gray-900">
                  {format(parseISO(entry.startDate), "MMM yyyy")} –{" "}
                  {format(parseISO(entry.endDate), "MMM yyyy")}
                </span>

                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(parseISO(entry.downloadedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <button
                onClick={() => onRedownload(entry)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                title="Redownload"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
