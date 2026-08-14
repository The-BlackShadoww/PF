"use client";

import { AlertCircle, Download, FileSpreadsheet, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/layouts/PageHeader";
import { DownloadHistoryList } from "@/components/reports/DownloadHistoryList";
import { ReportPreviewCard } from "@/components/reports/ReportPreviewCard";
import { reportsApi } from "@/lib/api/reports";
import { type DownloadHistoryEntry, useDownloadHistory } from "@/lib/hooks/useDownloadHistory";
import { useReportPreview } from "@/lib/hooks/useReportPreview";
import { cn } from "@/lib/utils/cn";

type ReportFormat = "csv" | "pdf";
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);

export default function ReportsPage() {
  const today = new Date();
  const [startMonth, setStartMonth] = useState(today.getMonth() + 1); const [startYear, setStartYear] = useState(today.getFullYear());
  const [endMonth, setEndMonth] = useState(today.getMonth() + 1); const [endYear, setEndYear] = useState(today.getFullYear());
  const [format, setFormat] = useState<ReportFormat>("csv"); const [isDownloading, setIsDownloading] = useState(false); const [downloadError, setDownloadError] = useState<string | null>(null);
  const dateRangeError = endYear < startYear || (endYear === startYear && endMonth < startMonth) ? "End period cannot be before start period." : null;
  const { data: preview, isLoading: isPreviewLoading } = useReportPreview(dateRangeError ? null : startYear, dateRangeError ? null : startMonth, dateRangeError ? null : endYear, dateRangeError ? null : endMonth);
  const { history, addEntry, clearHistory } = useDownloadHistory();
  const download = useCallback(async (params: { startYear: number; startMonth: number; endYear: number; endMonth: number }, reportFormat: ReportFormat) => {
    setIsDownloading(true); setDownloadError(null); let objectUrl: string | null = null;
    try {
      const blob = reportFormat === "csv" ? await reportsApi.downloadCsv(params) : await reportsApi.downloadPdf(params);
      objectUrl = URL.createObjectURL(blob); const filename = `report_${params.startYear}-${String(params.startMonth).padStart(2, "0")}_to_${params.endYear}-${String(params.endMonth).padStart(2, "0")}.${reportFormat}`;
      const anchor = document.createElement("a"); anchor.href = objectUrl; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      addEntry({ id: crypto.randomUUID(), format: reportFormat, ...params, downloadedAt: new Date().toISOString(), filename });
    } catch (error) { setDownloadError(error instanceof Error ? error.message : "Download failed. Please try again."); } finally { if (objectUrl) URL.revokeObjectURL(objectUrl); setIsDownloading(false); }
  }, [addEntry]);
  const params = { startYear, startMonth, endYear, endMonth };
  return <div className="mx-auto max-w-4xl space-y-6"><PageHeader title="Reports" description="Download your financial data for any billing period." />
    <div className="rounded-3xl bg-white p-6"><h2 className="text-base font-black text-[#0e0f0c]">Configure report</h2><div className="mt-6"><label className="mb-2 block text-sm font-semibold text-[#454745]">Billing period</label><div className="grid gap-3 sm:grid-cols-2">{([['From', startMonth, setStartMonth, startYear, setStartYear], ['To', endMonth, setEndMonth, endYear, setEndYear]] as const).map(([label, month, setMonth, year, setYear]) => <div key={label}><span className="mb-1 block text-xs text-[#868685]">{label}</span><div className="flex gap-2"><select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-11 flex-1 rounded-xl border border-[#0e0f0c] px-3 text-sm">{MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select><select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-11 w-24 rounded-xl border border-[#0e0f0c] px-2 text-sm">{YEAR_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></div></div>)}</div>{dateRangeError && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#a7000d]"><AlertCircle size={12} />{dateRangeError}</p>}</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{([['csv', FileSpreadsheet, 'CSV'], ['pdf', FileText, 'PDF']] as const).map(([value, Icon, label]) => <button key={value} onClick={() => setFormat(value)} className={cn('rounded-3xl p-5 text-left', format === value ? 'bg-[#e2f6d5]' : 'bg-[#e8ebe6]')}><Icon size={18}/><p className="mt-2 font-black">{label}</p></button>)}</div></div>
    <ReportPreviewCard preview={preview} isLoading={isPreviewLoading} {...params} />
    <button onClick={() => !dateRangeError && download(params, format)} disabled={Boolean(dateRangeError || isDownloading)} className="flex w-full items-center justify-center gap-2 rounded-3xl bg-[#9fe870] px-6 py-3 text-sm font-semibold disabled:opacity-50"><Download size={16}/>{isDownloading ? 'Generating...' : `Download ${format.toUpperCase()} Report`}</button>
    {downloadError && <div className="flex justify-between rounded-3xl bg-[#320707] p-4 text-white"><p>{downloadError}</p><button onClick={() => setDownloadError(null)}><X size={15}/></button></div>}
    <div className="rounded-3xl bg-white p-6"><DownloadHistoryList history={history} onRedownload={(entry: DownloadHistoryEntry) => download(entry, entry.format)} onClear={clearHistory} isDownloading={isDownloading}/></div></div>;
}
