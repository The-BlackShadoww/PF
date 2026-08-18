"use client";

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
        <p className="text-sm font-semibold text-[#525252]">Account balance</p>
        {isLoading ? (
          <div className="mt-2 h-16 w-72 animate-pulse bg-[#e8ebe6]" />
        ) : (
          <h2
            id="account-balance-heading"
            className="mt-1 text-[42px] font-light leading-[1.2] tracking-normal text-[#161616] md:text-[60px]"
          >
            {signedBalance}
          </h2>
        )}
      </section>

      <section aria-labelledby="savings-sectors-heading" className="space-y-4">
        <div>
          <h2
            id="savings-sectors-heading"
            className="text-xl font-semibold text-[#161616]"
          >
            Savings sectors
          </h2>
          <p className="mt-1 text-sm text-[#525252]">
            Your balance allocation by sector. Cash is calculated from the
            remaining balance.
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse bg-white" />
        ) : sectors.length === 0 ? (
          <EmptyState message="No savings sectors have been set up yet." />
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
              {sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-semibold text-[#161616]">
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
                  <TableCell className="text-right font-semibold text-[#161616]">
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
        className="rounded-3xl bg-white p-6"
      >
        <h2
          id="allocation-chart-heading"
          className="text-xl font-semibold text-[#161616]"
        >
          Savings sector allocation
        </h2>
        <div className="mt-4 h-80">
          {isLoading ? (
            <div className="h-full animate-pulse bg-[#e8ebe6]" />
          ) : sectors.length === 0 ? (
            <EmptyState message="Add savings sectors in Settings to view your allocation." />
          ) : (
            <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectors}
                    dataKey="allocatedCents"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="78%"
                    paddingAngle={2}
                  >
                    {sectors.map((sector) => (
                      <Cell key={sector.id} fill={sector.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatDollar(Number(value) / 100)}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center gap-3">
                {sectors.map((sector) => (
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
                      <span className="truncate text-[#525252]">
                        {sector.name}
                      </span>
                    </div>
                    <span className="font-semibold text-[#161616]">
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
    <div className="flex h-full min-h-40 items-center justify-center border border-dashed border-[#8c8c8c] bg-[#f4f4f4] px-6 text-center text-sm font-semibold text-[#525252]">
      {message}
    </div>
  );
}
