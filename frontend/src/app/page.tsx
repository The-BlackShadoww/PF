import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  FileDown,
  LockKeyhole,
  PieChart,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Track every transaction",
    description:
      "Filter income and expenses by date, type, and category with a clean table built for day-to-day review.",
    icon: ReceiptText,
  },
  {
    title: "Read your cash flow",
    description:
      "Monthly, quarterly, and yearly summaries show income, expense, savings, and category trends in one place.",
    icon: BarChart3,
  },
  {
    title: "Export reports",
    description:
      "Generate CSV or PDF reports for any date range when you need records for planning, sharing, or tax season.",
    icon: FileDown,
  },
];

const workflowItems = [
  "Add income and expense entries with categories",
  "Review savings rate and spending breakdowns",
  "Download date-range reports when you need them",
];

const stats = [
  { label: "Monthly income", value: "$8,420", tone: "text-emerald-700" },
  { label: "Expenses", value: "$4,180", tone: "text-rose-700" },
  { label: "Savings rate", value: "50.4%", tone: "text-sky-700" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f8f4]/90 backdrop-blur">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold text-slate-950"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <WalletCards aria-hidden="true" className="h-5 w-5" />
            </span>
            Personal Finance
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-950">
              Features
            </a>
            <a href="#security" className="transition hover:text-slate-950">
              Security
            </a>
            <a href="#reports" className="transition hover:text-slate-950">
              Reports
            </a>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open app
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Private planning for everyday money decisions
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
            Personal Finance
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
            Turn transactions into a clear money picture with dashboards,
            category breakdowns, budgets, and exportable reports that are ready
            when you are.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to dashboard
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Create account
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-slate-700">
            {workflowItems.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-emerald-600"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative pb-8">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  August overview
                </p>
                <p className="text-xs text-slate-500">
                  Income, expenses, and savings
                </p>
              </div>
              <div className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-medium text-slate-600">
                <span className="rounded bg-white px-3 py-1 text-slate-950 shadow-sm">
                  Monthly
                </span>
                <span className="px-3 py-1">Yearly</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className={`mt-2 text-2xl font-bold ${stat.tone}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">
                    Cash flow
                  </p>
                  <BarChart3
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400"
                  />
                </div>
                <div className="mt-6 flex h-52 items-end gap-3">
                  {[48, 64, 42, 72, 56, 86].map((height, index) => (
                    <div
                      key={height}
                      className="flex flex-1 items-end gap-1 rounded-t-md"
                    >
                      <span
                        className="w-full rounded-t bg-emerald-500"
                        style={{ height: `${height}%` }}
                      />
                      <span
                        className="w-full rounded-t bg-rose-500"
                        style={{ height: `${Math.max(24, height - 18)}%` }}
                      />
                      <span className="sr-only">Month {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">
                    Categories
                  </p>
                  <PieChart
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400"
                  />
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <div className="h-36 w-36 rounded-full bg-[conic-gradient(#14b8a6_0_31%,#6366f1_31%_58%,#f97316_58%_78%,#e11d48_78%_100%)] p-5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center text-xs font-semibold text-slate-600">
                      Expense
                      <br />
                      mix
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {["Housing", "Groceries", "Transport"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-600">{item}</span>
                      <span className="font-semibold text-slate-950">
                        {item === "Housing"
                          ? "$1,420"
                          : item === "Groceries"
                            ? "$640"
                            : "$310"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-y border-slate-200 bg-white px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-sky-700">
              Built around your workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              From raw entries to decisions you can act on.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-md border border-slate-200 bg-slate-50 p-6"
                >
                  <Icon aria-hidden="true" className="h-6 w-6 text-slate-950" />
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div
            id="security"
            className="rounded-md border border-slate-200 bg-white p-8"
          >
            <LockKeyhole
              aria-hidden="true"
              className="h-7 w-7 text-slate-950"
            />
            <h2 className="mt-5 text-2xl font-bold text-slate-950">
              Secure session handling without friction.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The app uses protected routes and refresh-token based navigation,
              so the dashboard link takes signed-in users straight to their
              workspace and routes new visitors to login.
            </p>
          </div>

          <div
            id="reports"
            className="rounded-md border border-slate-200 bg-white p-8"
          >
            <CalendarRange
              aria-hidden="true"
              className="h-7 w-7 text-slate-950"
            />
            <h2 className="mt-5 text-2xl font-bold text-slate-950">
              Reports for the exact period you care about.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Pick a start date, end date, and output format to create a
              downloadable record from the same data you use in the dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
