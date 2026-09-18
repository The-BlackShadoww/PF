"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SectorsBreakdown } from "@/components/dashboard/SectorsBreakdown";
import { useAccountSummary } from "@/lib/hooks/useAccount";
import { cn } from "@/lib/utils/cn";
import { formatDollar } from "@/lib/utils/format";

export function AccountBalanceWidget() {
  const { data: summary, isLoading } = useAccountSummary();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  if (isLoading) {
    return <div className="h-52 animate-pulse rounded-card bg-canvas" />;
  }

  if (!summary || summary.initialBalanceCents === 0) {
    return (
      <div className="app-panel border-dashed p-6">
        <div className="flex items-center gap-3">
          <Wallet className="text-muted" />
          <div>
            <p className="font-semibold">Account not set up yet</p>
            <p className="text-sm text-muted">
              Set your initial balance in Settings → Account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const negative = summary.currentBalanceCents < 0;
  const warning = summary.isLowBalance && !negative;
  return (
    <motion.section
      layout
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 28 }
      }
      className="glass-panel glass-panel--strong relative overflow-hidden p-6 md:p-7"
    >
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-14 h-44 w-44 rounded-full bg-primary/35 blur-3xl"
      />
      {(warning || negative) && (
        <div
          className={cn(
            "relative mb-5 flex gap-2 rounded-control border p-3 text-sm",
            negative
              ? "border-danger/40 bg-danger/15 text-white"
              : "border-warning/40 bg-warning/15 text-white",
          )}
        >
          <AlertTriangle size={16} />
          <span>
            {negative
              ? "Your account balance is negative."
              : `Your balance is below ${formatDollar(summary.lowBalanceThresholdCents / 100)}.`}
          </span>
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/65">Account balance</p>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.055em] text-white">
            {negative ? "-" : ""}
            {formatDollar(Math.abs(summary.currentBalanceCents) / 100)}
          </p>
        </div>
        <Link
          href="/settings?tab=account"
          aria-label="Account settings"
          className="rounded-control border border-white/15 bg-white/10 p-2 text-white/80 hover:bg-white/15 hover:text-white"
        >
          <Settings size={18} />
        </Link>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
        <span className="flex items-center gap-1">
          <TrendingUp size={14} className="text-success-bright" />
          Total in: {formatDollar(summary.totalIncomeCents / 100)}
        </span>
        <span className="flex items-center gap-1">
          <TrendingDown size={14} className="text-chart-peach" />
          Total out: {formatDollar(summary.totalExpenseCents / 100)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="relative mt-6 flex items-center gap-2 rounded-control px-1 py-1 text-sm font-semibold text-white transition hover:text-white/70"
      >
        Savings sectors{" "}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden"
          >
            <div className="mt-4 border-t border-white/15 pt-4">
              <SectorsBreakdown summary={summary} dark />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
