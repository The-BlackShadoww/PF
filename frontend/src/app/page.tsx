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
    surface: "bg-[#e8ebe6]",
  },
  {
    title: "Read your cash flow",
    description:
      "Monthly, quarterly, and yearly summaries show income, expense, savings, and category trends in one place.",
    icon: BarChart3,
    surface: "bg-[#e2f6d5]",
  },
  {
    title: "Export reports",
    description:
      "Generate CSV or PDF reports for any date range when you need records for planning, sharing, or tax season.",
    icon: FileDown,
    surface: "bg-[#0e0f0c] text-[#9fe870]",
  },
];

const workflowItems = [
  "Add income and expense entries with categories",
  "Review savings rate and spending breakdowns",
  "Download date-range reports when you need them",
];

const stats = [
  { label: "Monthly income", value: "$8,420", tone: "text-[#054d28]" },
  { label: "Expenses", value: "$4,180", tone: "text-[#a7000d]" },
  { label: "Savings rate", value: "50.4%", tone: "text-[#0e0f0c]" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#0e0f0c]">
      <header className="sticky top-0 z-30 border-b border-[#e8ebe6] bg-white/95 backdrop-blur">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-black text-[#0e0f0c]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#9fe870] text-[#0e0f0c]">
              <WalletCards aria-hidden="true" className="h-5 w-5" />
            </span>
            Personal Finance
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-[#0e0f0c] md:flex">
            <a href="#features" className="transition hover:text-[#054d28]">
              Features
            </a>
            <a href="#security" className="transition hover:text-[#054d28]">
              Security
            </a>
            <a href="#reports" className="transition hover:text-[#054d28]">
              Reports
            </a>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl bg-[#9fe870] px-5 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#cdffad]"
          >
            Open app
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="bg-[#e8ebe6] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#054d28]">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Private planning for everyday money decisions
            </p>
            <h1 className="mt-6 max-w-4xl text-6xl font-black leading-[0.9] tracking-normal text-[#0e0f0c] sm:text-7xl lg:text-8xl">
              Personal Finance
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#454745]">
              Turn transactions into a clear money picture with dashboards,
              category breakdowns, budgets, and exportable reports that are
              ready when you are.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl bg-[#9fe870] px-6 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#cdffad]"
              >
                Go to dashboard
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-3xl border border-[#0e0f0c] bg-white px-6 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#e2f6d5]"
              >
                Create account
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-medium text-[#454745]">
              {workflowItems.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-[#2ead4b]"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#0e0f0c] bg-white p-5">
            <div className="flex flex-col gap-3 border-b border-[#e8ebe6] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-[#0e0f0c]">
                  August overview
                </p>
                <p className="text-xs text-[#868685]">
                  Income, expenses, and savings
                </p>
              </div>
              <div className="inline-flex w-fit rounded-full bg-[#e8ebe6] p-1 text-xs font-semibold text-[#454745]">
                <span className="rounded-full bg-white px-3 py-1 text-[#0e0f0c]">
                  Monthly
                </span>
                <span className="px-3 py-1">Yearly</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl bg-[#e8ebe6] p-4">
                  <p className="text-xs font-semibold text-[#454745]">
                    {stat.label}
                  </p>
                  <p className={`mt-2 text-3xl font-black ${stat.tone}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl bg-[#e2f6d5] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-[#0e0f0c]">
                    Cash flow
                  </p>
                  <BarChart3
                    aria-hidden="true"
                    className="h-4 w-4 text-[#454745]"
                  />
                </div>
                <div className="mt-6 flex h-52 items-end gap-3">
                  {[48, 64, 42, 72, 56, 86].map((height, index) => (
                    <div
                      key={height}
                      className="flex flex-1 items-end gap-1 rounded-t-lg"
                    >
                      <span
                        className="w-full rounded-t-lg bg-[#2ead4b]"
                        style={{ height: `${height}%` }}
                      />
                      <span
                        className="w-full rounded-t-lg bg-[#d03238]"
                        style={{ height: `${Math.max(24, height - 18)}%` }}
                      />
                      <span className="sr-only">Month {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#0e0f0c] p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-[#9fe870]">
                    Categories
                  </p>
                  <PieChart
                    aria-hidden="true"
                    className="h-4 w-4 text-[#9fe870]"
                  />
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <div className="h-36 w-36 rounded-full bg-[conic-gradient(#9fe870_0_31%,#38c8ff_31%_58%,#ffc091_58%_78%,#d03238_78%_100%)] p-5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0e0f0c] text-center text-xs font-semibold text-white">
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
                      <span className="text-[#e8ebe6]">{item}</span>
                      <span className="font-semibold text-white">
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

      <section id="features" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-[#054d28]">
              Built around your workflow
            </p>
            <h2 className="mt-3 text-4xl font-black leading-[0.95] text-[#0e0f0c] sm:text-5xl">
              From raw entries to decisions you can act on.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className={`rounded-3xl p-6 ${feature.surface}`}
                >
                  <Icon aria-hidden="true" className="h-6 w-6" />
                  <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-inherit opacity-80">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#e8ebe6] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div id="security" className="rounded-3xl bg-white p-8">
            <LockKeyhole
              aria-hidden="true"
              className="h-7 w-7 text-[#0e0f0c]"
            />
            <h2 className="mt-5 text-3xl font-black leading-tight text-[#0e0f0c]">
              Secure session handling without friction.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#454745]">
              The app uses protected routes and refresh-token based navigation,
              so the dashboard link takes signed-in users straight to their
              workspace and routes new visitors to login.
            </p>
          </div>

          <div id="reports" className="rounded-3xl bg-[#e2f6d5] p-8">
            <CalendarRange
              aria-hidden="true"
              className="h-7 w-7 text-[#0e0f0c]"
            />
            <h2 className="mt-5 text-3xl font-black leading-tight text-[#0e0f0c]">
              Reports for the exact period you care about.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#454745]">
              Pick a start date, end date, and output format to create a
              downloadable record from the same data you use in the dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
