'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'report_download_history';
const MAX_HISTORY_ITEMS = 10;

export interface DownloadHistoryEntry {
  id: string;
  format: 'csv' | 'pdf';
  startDate: string;
  endDate: string;
  downloadedAt: string;
  filename: string;
}

function readHistory(): DownloadHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: DownloadHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
  }
}

export function useDownloadHistory() {
  const [history, setHistory] = useState<DownloadHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const addEntry = useCallback((entry: DownloadHistoryEntry) => {
    setHistory((current) => {
      const updated = [entry, ...current].slice(0, MAX_HISTORY_ITEMS);
      writeHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
