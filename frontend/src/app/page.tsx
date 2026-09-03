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
    surface: "bg-canvas",
  },
  {
    title: "Read your cash flow",
    description:
      "Monthly, quarterly, and yearly summaries show income, expense, savings, and category trends in one place.",
    icon: BarChart3,
    surface: "bg-accent",
  },
  {
    title: "Export reports",
    description:
      "Generate CSV or PDF reports for any date range when you need records for planning, sharing, or tax season.",
    icon: FileDown,
    surface: "bg-ink text-primary",
  },
];

const workflowItems = [
  "Add income and expense entries with categories",
  "Review savings rate and spending breakdowns",
  "Download date-range reports when you need them",
];

const stats = [
  { label: "Monthly income", value: "$8,420", tone: "text-success" },
  { label: "Expenses", value: "$4,180", tone: "text-danger" },
  { label: "Savings rate", value: "50.4%", tone: "text-ink" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-black text-ink"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-ink">
              <WalletCards aria-hidden="true" className="h-5 w-5" />
            </span>
            Personal Finance
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-ink md:flex">
            <a href="#features" className="transition hover:text-success">
              Features
            </a>
            <a href="#security" className="transition hover:text-success">
              Security
            </a>
            <a href="#reports" className="transition hover:text-success">
              Reports
            </a>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-card bg-primary px-5 text-sm font-semibold text-ink transition hover:bg-primary-hover"
          >
            Open app
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="bg-canvas px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-success">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Private planning for everyday money decisions
            </p>
            <h1 className="mt-6 max-w-4xl text-6xl font-black leading-[0.9] tracking-normal text-ink sm:text-7xl lg:text-8xl">
              Personal Finance
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Turn transactions into a clear money picture with dashboards,
              category breakdowns, budgets, and exportable reports that are
              ready when you are.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-card bg-primary px-6 text-sm font-semibold text-ink transition hover:bg-primary-hover"
              >
                Go to dashboard
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-card border border-ink bg-surface px-6 text-sm font-semibold text-ink transition hover:bg-accent"
              >
                Create account
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-medium text-muted">
              {workflowItems.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-success-bright"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-ink bg-surface p-5">
            <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-ink">
                  August overview
                </p>
                <p className="text-xs text-muted">
                  Income, expenses, and savings
                </p>
              </div>
              <div className="inline-flex w-fit rounded-full bg-canvas p-1 text-xs font-semibold text-muted">
                <span className="rounded-full bg-surface px-3 py-1 text-ink">
                  Monthly
                </span>
                <span className="px-3 py-1">Yearly</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-card bg-canvas p-4">
                  <p className="text-xs font-semibold text-muted">
                    {stat.label}
                  </p>
                  <p className={`mt-2 text-3xl font-black ${stat.tone}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-card bg-accent p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-ink">
                    Cash flow
                  </p>
                  <BarChart3
                    aria-hidden="true"
                    className="h-4 w-4 text-muted"
                  />
                </div>
                <div className="mt-6 flex h-52 items-end gap-3">
                  {[48, 64, 42, 72, 56, 86].map((height, index) => (
                    <div
                      key={height}
                      className="flex flex-1 items-end gap-1 rounded-t-lg"
                    >
                      <span
                        className="w-full rounded-t-lg bg-success-bright"
                        style={{ height: `${height}%` }}
                      />
                      <span
                        className="w-full rounded-t-lg bg-danger"
                        style={{ height: `${Math.max(24, height - 18)}%` }}
                      />
                      <span className="sr-only">Month {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-card bg-ink p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-primary">
                    Categories
                  </p>
                  <PieChart
                    aria-hidden="true"
                    className="h-4 w-4 text-primary"
                  />
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <div className="h-36 w-36 rounded-full chart-distribution p-5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-ink text-center text-xs font-semibold text-white">
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
                      <span className="text-canvas">{item}</span>
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

      <section id="features" className="bg-surface px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-success">
              Built around your workflow
            </p>
            <h2 className="mt-3 text-4xl font-black leading-[0.95] text-ink sm:text-5xl">
              From raw entries to decisions you can act on.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className={`rounded-card p-6 ${feature.surface}`}
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

      <section className="bg-canvas px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div id="security" className="rounded-card bg-surface p-8">
            <LockKeyhole
              aria-hidden="true"
              className="h-7 w-7 text-ink"
            />
            <h2 className="mt-5 text-3xl font-black leading-tight text-ink">
              Secure session handling without friction.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              The app uses protected routes and refresh-token based navigation,
              so the dashboard link takes signed-in users straight to their
              workspace and routes new visitors to login.
            </p>
          </div>

          <div id="reports" className="rounded-card bg-accent p-8">
            <CalendarRange
              aria-hidden="true"
              className="h-7 w-7 text-ink"
            />
            <h2 className="mt-5 text-3xl font-black leading-tight text-ink">
              Reports for the exact period you care about.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              Pick a start date, end date, and output format to create a
              downloadable record from the same data you use in the dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
