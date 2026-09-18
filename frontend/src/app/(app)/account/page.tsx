"use client";

import { Target } from "lucide-react";
import { ModernChart, chartBase } from "@/components/charts/ModernChart";
import { PageHeader } from "@/components/layouts/PageHeader";
import { useAccountSummary } from "@/lib/hooks/useAccount";
import { formatDollar } from "@/lib/utils/format";

export default function AccountPage() {
  const { data: summary, isLoading } = useAccountSummary();
  const allocations = summary
    ? [
        ...summary.sectors,
        {
          ...summary.cash,
          id: "cash",
          targetAmountCents: null,
          progressPercent: null,
        },
      ]
    : [];
  const total = allocations.reduce((sum, item) => sum + item.allocatedCents, 0);
  const options = {
    ...chartBase(),
    labels: allocations.map((item) => item.name),
    colors: allocations.map((item) => item.color),
    stroke: { colors: ["var(--ds-surface)"], width: 5 },
    plotOptions: {
      pie: {
        donut: {
          size: "73%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Allocated",
              formatter: () => formatDollar(total / 100),
            },
          },
        },
      },
    },
    tooltip: {
      theme: "dark" as const,
      y: { formatter: (value: number) => formatDollar(value / 100) },
    },
  };
  return (
    <div className="space-y-7">
      <PageHeader
        title="Your account"
        description="See how your available money is distributed across the places and goals you care about."
      />
      {isLoading ? (
        <div className="h-96 animate-pulse rounded-panel bg-canvas" />
      ) : !summary ? (
        <div className="app-panel p-10 text-muted">
          Your account summary is not available yet.
        </div>
      ) : (
        <>
          <section className="glass-panel glass-panel--strong relative overflow-hidden p-7 md:p-9">
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
            />
            <p className="relative text-sm text-white/65">Available balance</p>
            <p className="relative mt-3 text-5xl font-semibold tracking-[-.06em] text-white">
              {formatDollar(summary.currentBalanceCents / 100)}
            </p>
            <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 text-sm">
              <div>
                <p className="text-white/55">Money in</p>
                <p className="mt-1 font-semibold text-[#82e0ac]">
                  {formatDollar(summary.totalIncomeCents / 100)}
                </p>
              </div>
              <div>
                <p className="text-white/55">Money out</p>
                <p className="mt-1 font-semibold text-[#ffd09f]">
                  {formatDollar(summary.totalExpenseCents / 100)}
                </p>
              </div>
            </div>
          </section>
          <section className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
            <article className="app-panel overflow-hidden">
              <div className="border-b border-line px-6 py-5">
                <h2 className="font-semibold tracking-[-.02em]">
                  Allocation details
                </h2>
              </div>
              <div className="divide-y divide-line">
                {allocations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-6 py-5"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="font-semibold">
                          {formatDollar(item.allocatedCents / 100)}
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-10 text-right text-sm text-muted">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </article>
            <article className="app-panel p-6 overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-.03em]">
                    Allocation
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    How your balance is organized
                  </p>
                </div>
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center justify-center h-full">
                {allocations.length ? (
                  <ModernChart
                    type="donut"
                    height={270}
                    options={options}
                    series={allocations.map((item) => item.allocatedCents)}
                  />
                ) : (
                  <div className="flex h-[270px] items-center justify-center text-sm text-muted">
                    No allocations to show yet.
                  </div>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

// "use client";

// import { Target } from "lucide-react";
// import { ModernChart, chartBase } from "@/components/charts/ModernChart";
// import { PageHeader } from "@/components/layouts/PageHeader";
// import { useAccountSummary } from "@/lib/hooks/useAccount";
// import { formatDollar } from "@/lib/utils/format";

// export default function AccountPage() {
//   const { data: summary, isLoading } = useAccountSummary();
//   const allocations = summary
//     ? [
//         ...summary.sectors,
//         {
//           ...summary.cash,
//           id: "cash",
//           targetAmountCents: null,
//           progressPercent: null,
//         },
//       ]
//     : [];
//   const total = allocations.reduce((sum, item) => sum + item.allocatedCents, 0);
//   const options = {
//     ...chartBase(),
//     labels: allocations.map((item) => item.name),
//     colors: allocations.map((item) => item.color),
//     stroke: { colors: ["var(--ds-surface)"], width: 5 },
//     plotOptions: {
//       pie: {
//         donut: {
//           size: "73%",
//           labels: {
//             show: true,
//             total: {
//               show: true,
//               label: "Allocated",
//               formatter: () => formatDollar(total / 100),
//             },
//           },
//         },
//       },
//     },
//     tooltip: {
//       theme: "dark" as const,
//       y: { formatter: (value: number) => formatDollar(value / 100) },
//     },
//   };
//   return (
//     <div className="space-y-7">
//       <PageHeader
//         title="Your account"
//         description="See how your available money is distributed across the places and goals you care about."
//       />
//       {isLoading ? (
//         <div className="h-96 animate-pulse rounded-panel bg-canvas" />
//       ) : !summary ? (
//         <div className="app-panel p-10 text-muted">
//           Your account summary is not available yet.
//         </div>
//       ) : (
//         <>
//           <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
//             <article className="glass-panel glass-panel--strong relative overflow-hidden p-7 md:p-9">
//               <div aria-hidden="true" className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-primary/35 blur-3xl" />
//               <p className="relative text-sm text-white/65">Available balance</p>
//               <p className="relative mt-3 text-5xl font-semibold tracking-[-.06em] text-white">
//                 {formatDollar(summary.currentBalanceCents / 100)}
//               </p>
//               <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 text-sm">
//                 <div>
//                   <p className="text-white/55">Money in</p>
//                   <p className="mt-1 font-semibold text-[#82e0ac]">
//                     {formatDollar(summary.totalIncomeCents / 100)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-white/55">Money out</p>
//                   <p className="mt-1 font-semibold text-[#ffd09f]">
//                     {formatDollar(summary.totalExpenseCents / 100)}
//                   </p>
//                 </div>
//               </div>
//             </article>
//             <article className="app-panel p-6">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h2 className="text-lg font-semibold tracking-[-.03em]">
//                     Allocation
//                   </h2>
//                   <p className="mt-1 text-sm text-muted">
//                     How your balance is organized
//                   </p>
//                 </div>
//                 <Target className="h-4 w-4 text-primary" />
//               </div>
//               {allocations.length ? (
//                 <ModernChart
//                   type="donut"
//                   height={270}
//                   options={options}
//                   series={allocations.map((item) => item.allocatedCents)}
//                 />
//               ) : (
//                 <div className="flex h-[270px] items-center justify-center text-sm text-muted">
//                   No allocations to show yet.
//                 </div>
//               )}
//             </article>
//           </section>
//           <section className="app-panel overflow-hidden">
//             <div className="border-b border-line px-6 py-5">
//               <h2 className="font-semibold tracking-[-.02em]">
//                 Allocation details
//               </h2>
//             </div>
//             <div className="divide-y divide-line">
//               {allocations.map((item) => (
//                 <div
//                   key={item.id}
//                   className="flex items-center gap-4 px-6 py-5"
//                 >
//                   <span
//                     className="h-3 w-3 rounded-full"
//                     style={{ backgroundColor: item.color }}
//                   />
//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-center justify-between gap-3">
//                       <p className="truncate font-medium">{item.name}</p>
//                       <p className="font-semibold">
//                         {formatDollar(item.allocatedCents / 100)}
//                       </p>
//                     </div>
//                     <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
//                       <div
//                         className="h-full rounded-full"
//                         style={{
//                           width: `${item.percentage}%`,
//                           backgroundColor: item.color,
//                         }}
//                       />
//                     </div>
//                   </div>
//                   <span className="w-10 text-right text-sm text-muted">
//                     {item.percentage}%
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </>
//       )}
//     </div>
//   );
// }
