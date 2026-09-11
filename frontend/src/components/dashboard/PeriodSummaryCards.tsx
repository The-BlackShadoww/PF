"use client";

import { TrendingDown, TrendingUp, Wallet, Percent } from "lucide-react";

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
    <div className="surface-card space-y-3 rounded-card bg-surface p-5">
      <div className="h-3 w-1/2 animate-pulse rounded bg-canvas" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-canvas" />
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_value, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total income",
      value: formatDollar(totalIncome),
      icon: TrendingUp,
      iconColor: "text-success-bright",
      valueColor: "text-ink",
      accent: "border-l-success-bright",
    },
    {
      label: "Total expenses",
      value: formatDollar(totalExpense),
      icon: TrendingDown,
      iconColor: "text-danger",
      valueColor: "text-ink",
      accent: "border-l-danger",
    },
    {
      label: "Net savings",
      value: (savings < 0 ? "-" : "") + formatDollar(Math.abs(savings)),
      icon: Wallet,
      iconColor: savings >= 0 ? "text-success" : "text-warning",
      valueColor: savings >= 0 ? "text-ink" : "text-warning-ink",
      accent: savings >= 0 ? "border-l-success" : "border-l-warning",
    },
    {
      label: "Savings rate",
      value: `${savingsRate}%`,
      icon: Percent,
      iconColor: "text-primary",
      valueColor: "text-ink",
      accent: "border-l-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={cn(
              "surface-card rounded-card border-l-[3px] bg-surface p-5",
              card.accent,
            )}
          >
            <div className="flex items-center gap-2">
              <Icon aria-hidden="true" className={cn("shrink-0", card.iconColor)} size={14} />
              <span className="text-xs font-medium text-muted">
                {card.label}
              </span>
            </div>
            <p className={cn("mt-2 text-2xl font-semibold tracking-tight", card.valueColor)}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
