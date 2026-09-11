import { cn } from "@/lib/utils/cn";

type SummaryCardTone = "income" | "expense" | "savings";

type SummaryCardProps = {
  title: string;
  value: number;
  subtitle: string;
  tone: SummaryCardTone;
  isLoading?: boolean;
};

const toneAccent: Record<SummaryCardTone, string> = {
  income: "border-l-success-bright",
  expense: "border-l-danger",
  savings: "border-l-primary",
};

export function SummaryCard({
  title,
  value,
  subtitle,
  tone,
  isLoading = false,
}: SummaryCardProps) {
  return (
    <article
      className={cn(
        "surface-card rounded-card border-l-[3px] bg-surface p-5",
        toneAccent[tone],
      )}
    >
      <p className="text-xs font-medium text-muted">{title}</p>
      {isLoading ? (
        <div className="mt-3 h-8 w-32 animate-pulse rounded-control bg-canvas" />
      ) : (
        <p className="mt-2 text-metric font-semibold leading-tight tracking-tight text-ink">
          {formatAmount(value)}
        </p>
      )}
      {isLoading ? (
        <div className="mt-3 h-4 w-24 animate-pulse rounded bg-canvas" />
      ) : (
        <p className="mt-3 text-xs text-muted">
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
