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
    <div className="space-y-3 rounded-md border border-slate-200 bg-white p-5">
      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="h-2 w-1/3 animate-pulse rounded bg-slate-200" />
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
      iconColor: "text-green-500",
      valueColor: "text-green-700",
      bg: "bg-green-50 border-green-100",
    },
    {
      label: "Total Expenses",
      value: formatDollar(totalExpense),
      icon: TrendingDown,
      iconColor: "text-red-500",
      valueColor: "text-red-700",
      bg: "bg-red-50 border-red-100",
    },
    {
      label: "Net Savings",
      value: (savings < 0 ? "-" : "") + formatDollar(savings),
      icon: Wallet,
      iconColor: savings >= 0 ? "text-blue-500" : "text-orange-500",
      valueColor: savings >= 0 ? "text-blue-700" : "text-orange-700",
      bg:
        savings >= 0
          ? "bg-blue-50 border-blue-100"
          : "bg-orange-50 border-orange-100",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      icon: Percent,
      iconColor: "text-purple-500",
      valueColor: "text-purple-700",
      bg: "bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={cn("space-y-2 rounded-md border p-5", card.bg)}
          >
            <div className="flex items-center gap-2">
              <Icon aria-hidden="true" className={card.iconColor} size={15} />
              <span className="text-xs font-medium text-slate-500">
                {card.label}
              </span>
            </div>
            <p className={cn("text-xl font-bold", card.valueColor)}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
