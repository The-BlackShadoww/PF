'use client';

import { Download, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { DownloadHistoryEntry } from '../../../lib/hooks/useDownloadHistory';
import { cn } from '../../../lib/utils/cn';

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
      <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
        <Clock size={13} />
        <span>No reports downloaded yet — your history will appear here</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Download History
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          title="Clear download history"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const startLabel = format(parseISO(entry.startDate), 'MMM d, yyyy');
          const endLabel = format(parseISO(entry.endDate), 'MMM d, yyyy');
          const rangeLabel = entry.startDate === entry.endDate
            ? startLabel
            : `${startLabel} – ${endLabel}`;

          const timeAgo = formatDistanceToNow(parseISO(entry.downloadedAt), {
            addSuffix: true,
          });

          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
            >
              <span className={cn(
                'flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wide',
                entry.format === 'csv'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700',
              )}>
                {entry.format}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{rangeLabel}</p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
              </div>

              <button
                onClick={() => onRedownload(entry)}
                disabled={isDownloading}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5',
                  'text-xs text-gray-500 border border-gray-200 rounded-md',
                  'hover:border-gray-400 hover:text-gray-700 transition-colors',
                  'opacity-0 group-hover:opacity-100',
                  isDownloading && 'cursor-not-allowed opacity-30',
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

      <p className="text-xs text-gray-400 mt-3">
        Showing last {history.length} download{history.length !== 1 ? 's' : ''}.
        History is stored on this device only.
      </p>
    </div>
  );
}
