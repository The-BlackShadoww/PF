"use client";

import { Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatDollar } from "@/lib/utils/format";

interface PeriodSummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  savingsRate: string;
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-card bg-surface p-5">
      <div className="h-3 w-1/2 animate-pulse rounded bg-canvas" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-canvas" />
      <div className="h-2 w-1/3 animate-pulse rounded bg-canvas" />
    </div>
  );
}

export function PeriodSummaryCards({
  totalIncome,
  totalExpense,
  savings,
  savingsRate,
  isLoading,
}: PeriodSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_value, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Income",
      value: formatDollar(totalIncome),
      icon: TrendingUp,
      iconColor: "text-success-bright",
      valueColor: "text-success",
      bg: "bg-accent",
    },
    {
      label: "Total Expenses",
      value: formatDollar(totalExpense),
      icon: TrendingDown,
      iconColor: "text-danger",
      valueColor: "text-danger",
      bg: "bg-surface",
    },
    {
      label: "Net Savings",
      value: (savings < 0 ? "-" : "") + formatDollar(savings),
      icon: Wallet,
      iconColor: savings >= 0 ? "text-success" : "text-warning",
      valueColor: savings >= 0 ? "text-success" : "text-warning-ink",
      bg: savings >= 0 ? "bg-chart-peach" : "bg-chart-yellow",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      icon: Percent,
      iconColor: "text-ink",
      valueColor: "text-ink",
      bg: "bg-surface",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={cn("space-y-2 rounded-card p-5", card.bg)}
          >
            <div className="flex items-center gap-2">
              <Icon aria-hidden="true" className={card.iconColor} size={15} />
              <span className="text-xs font-semibold text-muted">
                {card.label}
              </span>
            </div>
            <p className={cn("text-2xl font-black", card.valueColor)}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
