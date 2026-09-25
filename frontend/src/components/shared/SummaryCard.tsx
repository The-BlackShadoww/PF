import { cn } from "@/lib/utils/cn";

type SummaryCardTone = "income" | "expense" | "savings";

type SummaryCardProps = {
  title: string;
  value: number;
  subtitle: string;
  tone: SummaryCardTone;
  isLoading?: boolean;
};

const toneAccent: Record<SummaryCardTone, { border: string; tint: string }> = {
  income: {
    border: "border-l-success-bright",
    tint: "hover:border-l-success",
  },
  expense: {
    border: "border-l-danger",
    tint: "hover:border-l-danger",
  },
  savings: {
    border: "border-l-primary",
    tint: "hover:border-l-primary-hover",
  },
};

export function SummaryCard({
  title,
  value,
  subtitle,
  tone,
  isLoading = false,
}: SummaryCardProps) {
  const currentTone = toneAccent[tone];

  return (
    <article
      className={cn(
        "surface-card rounded-card border-l-4 bg-surface p-5 transition-shadow hover:shadow-md",
        currentTone.border,
        currentTone.tint,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</p>
      {isLoading ? (
        <div className="mt-3 h-8 w-32 animate-pulse rounded-control bg-canvas" />
      ) : (
        <p className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {formatAmount(value)}
        </p>
      )}
      {isLoading ? (
        <div className="mt-2.5 h-4 w-24 animate-pulse rounded bg-canvas" />
      ) : (
        <p className="mt-2.5 text-xs text-muted">
          {subtitle}
        </p>
      )}
    </article>
  );
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
