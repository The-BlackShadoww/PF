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
  income: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
  expense: "border-red-200 bg-red-50/70 text-red-700",
  savings: "border-sky-200 bg-sky-50/70 text-sky-700",
};

export function SummaryCard({
  title,
  value,
  subtitle,
  tone,
  isLoading = false,
}: SummaryCardProps) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              {formatAmount(value)}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className={cn("h-3 w-3 rounded-full border", toneStyles[tone])}
        />
      </div>
      {isLoading ? (
        <div className="mt-4 h-4 w-24 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className={cn("mt-3 text-sm font-medium", toneStyles[tone])}>
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
