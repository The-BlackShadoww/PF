'use client';
import Link from 'next/link';
import { AlertTriangle, ChevronDown, ChevronUp, Settings, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { SectorsBreakdown } from '@/components/dashboard/SectorsBreakdown';
import { useAccountSummary } from '@/lib/hooks/useAccount';
import { cn } from '@/lib/utils/cn';
import { formatDollar } from '@/lib/utils/format';

export function AccountBalanceWidget() {
  const { data: summary, isLoading } = useAccountSummary(); const [open, setOpen] = useState(false);
  if (isLoading) return <div className="h-44 animate-pulse rounded-3xl bg-white" />;
  if (!summary || summary.initialBalanceCents === 0) return <div className="rounded-3xl border border-dashed border-[#868685] bg-white p-6"><div className="flex items-center gap-3"><Wallet className="text-[#454745]" /><div><p className="font-semibold">Account not set up yet</p><p className="text-sm text-[#868685]">Set your initial balance in Settings → Account.</p></div></div></div>;
  const negative = summary.currentBalanceCents < 0; const warning = summary.isLowBalance && !negative; const dark = !summary.isLowBalance && !negative;
  return <section className={cn('rounded-3xl p-6', dark ? 'bg-[#0e0f0c] text-white' : negative ? 'border border-red-300 bg-red-50' : 'border border-amber-300 bg-amber-50')}>
    {(warning || negative) && <div className={cn('mb-4 flex gap-2 rounded-2xl p-3 text-sm', negative ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}><AlertTriangle size={16} /><span>{negative ? 'Your account balance is negative.' : `Your balance is below ${formatDollar(summary.lowBalanceThresholdCents / 100)}.`}</span></div>}
    <div className="flex items-start justify-between"><div><p className={cn('text-xs font-semibold uppercase tracking-wide', dark ? 'text-[#868685]' : 'text-[#454745]')}>Account balance</p><p className={cn('mt-1 text-4xl font-black', negative ? 'text-red-700' : warning ? 'text-amber-800' : 'text-white')}>{negative ? '-' : ''}{formatDollar(Math.abs(summary.currentBalanceCents) / 100)}</p></div><Link href="/settings?tab=account" aria-label="Account settings" className="rounded-full p-2"><Settings size={18} /></Link></div>
    <div className={cn('mt-4 flex gap-5 text-xs', dark ? 'text-[#e8ebe6]' : 'text-[#454745]')}><span className="flex items-center gap-1"><TrendingUp size={14} className="text-green-500" />Total in: {formatDollar(summary.totalIncomeCents / 100)}</span><span className="flex items-center gap-1"><TrendingDown size={14} className="text-red-500" />Total out: {formatDollar(summary.totalExpenseCents / 100)}</span></div>
    <button type="button" onClick={() => setOpen(!open)} className={cn('mt-5 flex items-center gap-2 text-sm font-semibold', dark ? 'text-[#9fe870]' : 'text-[#0e0f0c]')}>Savings sectors {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
    {open && <div className="mt-4 border-t border-current/10 pt-4"><SectorsBreakdown summary={summary} dark={dark} /></div>}
  </section>;
}
