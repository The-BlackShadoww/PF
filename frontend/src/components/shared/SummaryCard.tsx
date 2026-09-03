import { cn } from "@/lib/utils/cn";

type SummaryCardTone = "income" | "expense" | "savings";

type SummaryCardProps = {
  title: string;
  value: number;
  subtitle: string;
  tone: SummaryCardTone;
  isLoading?: boolean;
};

const toneStyles: Record<SummaryCardTone, string> = {
  income: "bg-info text-ink",
  expense: "bg-canvas text-ink",
  savings: "bg-canvas text-ink",
};

export function SummaryCard({
  title,
  value,
  subtitle,
  tone,
  isLoading = false,
}: SummaryCardProps) {
  return (
    <article className="border border-line bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">{title}</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded-control bg-canvas" />
          ) : (
            <p className="mt-2 text-metric font-normal leading-tight tracking-normal text-ink">
              {formatAmount(value)}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className={cn("h-3 w-3", toneStyles[tone])}
        />
      </div>
      {isLoading ? (
        <div className="mt-4 h-4 w-24 animate-pulse rounded bg-canvas" />
      ) : (
        <p
          className={cn(
            "mt-4 inline-flex border-l-2 border-primary px-3 py-1 text-sm font-medium",
            toneStyles[tone],
          )}
        >
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
