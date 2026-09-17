"use client";

import { Landmark, Target } from "lucide-react";
import { ModernChart, chartBase } from "@/components/charts/ModernChart";
import { PageHeader } from "@/components/layouts/PageHeader";
import { useAccountSummary } from "@/lib/hooks/useAccount";
import { formatDollar } from "@/lib/utils/format";

export default function AccountPage() {
  const { data: summary, isLoading } = useAccountSummary();
  const allocations = summary ? [...summary.sectors, { ...summary.cash, id: "cash", targetAmountCents: null, progressPercent: null }] : [];
  const total = allocations.reduce((sum, item) => sum + item.allocatedCents, 0);
  const options = { ...chartBase(), labels: allocations.map((item) => item.name), colors: allocations.map((item) => item.color), stroke: { colors: ["var(--ds-surface)"], width: 5 }, plotOptions: { pie: { donut: { size: "73%", labels: { show: true, total: { show: true, label: "Allocated", formatter: () => formatDollar(total / 100) } } } } }, tooltip: { theme: "dark" as const, y: { formatter: (value: number) => formatDollar(value / 100) } } };
  return <div className="space-y-7"><PageHeader title="Your account" description="See how your available money is distributed across the places and goals you care about." />{isLoading ? <div className="h-96 animate-pulse rounded-panel bg-canvas" /> : !summary ? <div className="app-panel p-10 text-muted">Your account summary is not available yet.</div> : <><section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]"><article className="rounded-panel bg-ink p-7 text-white md:p-9"><p className="text-sm text-white/60">Available balance</p><p className="mt-3 text-5xl font-semibold tracking-[-.06em]">{formatDollar(summary.currentBalanceCents / 100)}</p><div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 text-sm"><div><p className="text-white/55">Money in</p><p className="mt-1 font-semibold text-[#82e0ac]">{formatDollar(summary.totalIncomeCents / 100)}</p></div><div><p className="text-white/55">Money out</p><p className="mt-1 font-semibold text-[#ffd09f]">{formatDollar(summary.totalExpenseCents / 100)}</p></div></div></article><article className="app-panel p-6"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-.03em]">Allocation</h2><p className="mt-1 text-sm text-muted">How your balance is organized</p></div><Target className="h-4 w-4 text-primary" /></div>{allocations.length ? <ModernChart type="donut" height={270} options={options} series={allocations.map((item) => item.allocatedCents)} /> : <div className="flex h-[270px] items-center justify-center text-sm text-muted">No allocations to show yet.</div>}</article></section><section className="app-panel overflow-hidden"><div className="border-b border-line px-6 py-5"><h2 className="font-semibold tracking-[-.02em]">Allocation details</h2></div><div className="divide-y divide-line">{allocations.map((item) => <div key={item.id} className="flex items-center gap-4 px-6 py-5"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate font-medium">{item.name}</p><p className="font-semibold">{formatDollar(item.allocatedCents / 100)}</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} /></div></div><span className="w-10 text-right text-sm text-muted">{item.percentage}%</span></div>)}</div></section></>}</div>;
}

/*
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PageHeader } from "@/components/layouts/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAccountSummary } from "@/lib/hooks/useAccount";
import { formatDollar } from "@/lib/utils/format";

export default function AccountPage() {
  const { data: summary, isLoading } = useAccountSummary();
  const sectors = summary?.sectors ?? [];
  const allocations = summary
    ? [
        {
          ...summary.cash,
          id: "cash",
          targetAmountCents: null,
          progressPercent: null,
        },
        ...sectors,
      ]
    : [];
  const balance = summary?.currentBalanceCents ?? 0;
  const signedBalance = `${balance < 0 ? "-" : ""}${formatDollar(
    Math.abs(balance) / 100,
  )}`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account"
        description="See your current balance and how it is allocated across savings sectors."
      />

      <section aria-labelledby="account-balance-heading" className="pt-1">
        <p className="text-sm font-semibold text-muted">Account balance</p>
        {isLoading ? (
          <div className="mt-2 h-16 w-72 animate-pulse bg-canvas" />
        ) : (
          <h2
            id="account-balance-heading"
            className="mt-1 text-display font-light leading-[1.2] tracking-normal text-ink md:text-hero"
          >
            {signedBalance}
          </h2>
        )}
      </section>

      <section aria-labelledby="savings-sectors-heading" className="space-y-4">
        <div>
          <h2
            id="savings-sectors-heading"
            className="text-xl font-semibold text-ink"
          >
            Savings sectors
          </h2>
          <p className="mt-1 text-sm text-muted">
            Your balance allocation by sector. Cash is calculated from the
            remaining balance.
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse bg-surface" />
        ) : allocations.length === 0 ? (
          <EmptyState message="Account allocation is not available yet." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Allocation</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Goal</TableHead>
                <TableHead className="text-right">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-semibold text-ink">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: sector.color }}
                      />
                      {sector.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {sector.percentage}%
                  </TableCell>
                  <TableCell className="text-right font-semibold text-ink">
                    {formatDollar(sector.allocatedCents / 100)}
                  </TableCell>
                  <TableCell className="text-right">
                    {sector.targetAmountCents === null
                      ? "—"
                      : formatDollar(sector.targetAmountCents / 100)}
                  </TableCell>
                  <TableCell className="text-right">
                    {sector.progressPercent === null
                      ? "—"
                      : `${sector.progressPercent.toFixed(0)}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section
        aria-labelledby="allocation-chart-heading"
        className="rounded-card bg-surface p-6"
      >
        <h2
          id="allocation-chart-heading"
          className="text-xl font-semibold text-ink"
        >
          Savings sector allocation
        </h2>
        <div className="mt-4 h-80">
          {isLoading ? (
            <div className="h-full animate-pulse bg-canvas" />
          ) : allocations.length === 0 ? (
            <EmptyState message="Account allocation is not available yet." />
          ) : (
            <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocations}
                    dataKey="allocatedCents"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="78%"
                    paddingAngle={2}
                  >
                    {allocations.map((sector) => (
                      <Cell key={sector.id} fill={sector.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatDollar(Number(value) / 100)}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center gap-3">
                {allocations.map((sector) => (
                  <div
                    key={sector.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: sector.color }}
                      />
                      <span className="truncate text-muted">
                        {sector.name}
                      </span>
                    </div>
                    <span className="font-semibold text-ink">
                      {formatDollar(sector.allocatedCents / 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center border border-dashed border-muted bg-canvas px-6 text-center text-sm font-semibold text-muted">
      {message}
    </div>
  );
}
*/
