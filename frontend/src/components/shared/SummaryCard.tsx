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
  income: "bg-[#e2f6d5] text-[#054d28]",
  expense: "bg-[#320707] text-white",
  savings: "bg-[#ffc091] text-[#0e0f0c]",
};

export function SummaryCard({
  title,
  value,
  subtitle,
  tone,
  isLoading = false,
}: SummaryCardProps) {
  return (
    <article className="rounded-3xl bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#454745]">{title}</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded-lg bg-[#e8ebe6]" />
          ) : (
            <p className="mt-2 text-3xl font-black leading-none tracking-normal text-[#0e0f0c]">
              {formatAmount(value)}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className={cn("h-3 w-3 rounded-full", toneStyles[tone])}
        />
      </div>
      {isLoading ? (
        <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#e8ebe6]" />
      ) : (
        <p
          className={cn(
            "mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold",
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
