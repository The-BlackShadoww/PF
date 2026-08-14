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
  income: "bg-[#edf5ff] text-[#161616]",
  expense: "bg-[#f4f4f4] text-[#161616]",
  savings: "bg-[#f4f4f4] text-[#161616]",
};

export function SummaryCard({
  title,
  value,
  subtitle,
  tone,
  isLoading = false,
}: SummaryCardProps) {
  return (
    <article className="border border-[#e0e0e0] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#454745]">{title}</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded-lg bg-[#e8ebe6]" />
          ) : (
            <p className="mt-2 text-[32px] font-normal leading-tight tracking-normal text-[#161616]">
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
        <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#e8ebe6]" />
      ) : (
        <p
          className={cn(
            "mt-4 inline-flex border-l-2 border-[#0f62fe] px-3 py-1 text-sm font-medium",
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
