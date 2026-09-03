'use client';
import type { AccountSummary } from '@/lib/api/account';
import { cn } from '@/lib/utils/cn';
import { formatDollar } from '@/lib/utils/format';

export function SectorsBreakdown({ summary, dark = false }: { summary: AccountSummary; dark?: boolean }) {
  const segments = [...summary.sectors, { ...summary.cash, id: 'cash', targetAmountCents: null, progressPercent: null }];
  const text = dark ? 'text-white' : 'text-ink';
  return <div className="space-y-3"><div className="flex h-3 overflow-hidden rounded-full">{segments.map((s) => <div key={s.id} style={{ width: `${Math.max(0, s.percentage)}%`, backgroundColor: s.color }} title={`${s.name}: ${s.percentage}%`} />)}</div>
    <div className="space-y-2">{segments.map((s) => <div key={s.id}><div className="flex items-center justify-between gap-3 text-xs"><span className={cn('flex items-center gap-2', text)}><i className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />{s.name} ({s.percentage}%)</span><span className={cn('font-semibold', text)}>{formatDollar(s.allocatedCents / 100)}</span></div>{s.targetAmountCents !== null && <div className="mt-1 ml-4 h-1 overflow-hidden rounded bg-black/10"><div className="h-full" style={{ width: `${s.progressPercent ?? 0}%`, backgroundColor: s.color }} /></div>}</div>)}</div></div>;
}
