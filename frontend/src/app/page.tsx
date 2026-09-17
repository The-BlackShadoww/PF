import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  FileDown,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import {
  acebuilderButtonClass,
  acebuilderActiveClasses,
} from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-surface text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10" aria-label="Primary navigation">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-[-0.03em]">
            <span className="grid h-9 w-9 place-items-center rounded-control bg-primary text-white shadow-[0_8px_20px_rgb(33_66_231_/_25%)]"><WalletCards className="h-4 w-4" /></span>
            Personal Finance
          </Link>
          <div className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#overview" className="hover:text-ink">Overview</a><a href="#built-for-life" className="hover:text-ink">How it works</a><a href="#security" className="hover:text-ink">Security</a>
          </div>
          <Link href="/dashboard" data-slot="button" className={acebuilderButtonClass}>Open your dashboard <ArrowRight className="h-4 w-4" /></Link>
        </nav>
      </header>

      <section className="marketing-grid relative border-b border-line px-5 py-16 md:px-10 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_10%,rgb(33_66_231_/_13%),transparent_26rem)]" />
        <div className="relative mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="max-w-xl">
            <p className="mb-5 text-sm font-medium text-primary">A clearer relationship with money.</p>
            <h1 className="text-[clamp(3.5rem,7vw,6.7rem)] font-semibold leading-[.91] tracking-[-.075em] text-ink">Make room for what matters.</h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">Personal Finance brings every expense, goal, and decision into one quiet, useful view—so your money can support your life instead of competing for your attention.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" data-slot="button" className={acebuilderButtonClass}>Start with your dashboard <ArrowRight className="h-4 w-4" /></Link><a href="#overview" className="inline-flex h-8 items-center rounded-full px-3.5 text-sm font-medium text-muted hover:bg-canvas hover:text-ink">See how it works</a></div>
            <p className="mt-8 text-xs text-muted">Private by default. Built for everyday decisions.</p>
          </div>
          <div className="app-panel relative overflow-hidden bg-ink p-3 shadow-[0_30px_80px_rgb(17_24_39_/_20%)] md:p-5">
            <div className="rounded-[12px] bg-white p-5 md:p-7">
              <div className="flex items-center justify-between"><div><p className="text-xs text-muted">This month</p><p className="mt-1 text-2xl font-semibold tracking-[-.05em]">September 2026</p></div><span className="rounded-full bg-[#eef1ff] px-3 py-1 text-xs font-medium text-primary">On track</span></div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3"><Metric label="Income" value="$8,420" tone="text-success" /><Metric label="Spent" value="$4,180" tone="text-ink" /><Metric label="Saved" value="$4,240" tone="text-primary" /></div>
              <div className="mt-7 rounded-card bg-[#f8f9fb] p-5"><div className="flex items-end justify-between"><div><p className="text-sm font-medium">Cash flow</p><p className="mt-1 text-xs text-muted">Income and spending, six months</p></div><p className="text-xs font-medium text-success">+12.4%</p></div><div className="mt-5 flex h-28 items-end gap-2">{[38,52,46,70,55,82,68,94,58,72,65,88].map((h,i)=><span key={i} className={cn("flex-1 rounded-t-full", i % 2 === 0 ? "bg-primary" : "bg-[#cbd5ff]")} style={{height:`${h}%`}} />)}</div></div>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-5 text-sm"><span className="text-muted">Savings rate</span><span className="font-semibold">50.4%</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="mx-auto max-w-[1280px] px-5 py-20 md:px-10 md:py-28"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><h2 className="max-w-sm text-4xl font-semibold leading-[.98] tracking-[-.055em] md:text-5xl">A home base for your financial life.</h2></div><div className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">{features.map(({title,description,icon:Icon})=><article key={title} className="bg-surface p-7"><Icon className="h-5 w-5 text-primary"/><h3 className="mt-8 text-xl font-semibold tracking-[-.035em]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{description}</p></article>)}<article className="bg-ink p-7 text-white"><ShieldCheck className="h-5 w-5 text-[#aab8ff]"/><h3 className="mt-8 text-xl font-semibold tracking-[-.035em]">A private place to plan</h3><p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">Your financial picture stays focused, secure, and understandable.</p></article></div></div></section>

      <section id="built-for-life" className="border-y border-line bg-subtle"><div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-2"><div className="rounded-panel bg-primary p-8 text-white md:p-11"><p className="text-sm text-white/65">From first entry to future plans</p><h2 className="mt-6 max-w-md text-4xl font-semibold leading-[.98] tracking-[-.055em]">See the choices behind every number.</h2><div className="mt-12 space-y-5">{workflowItems.map((item,index)=><div className="flex gap-4" key={item}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/30 text-xs">{index+1}</span><p className="pt-1 text-sm text-white/80">{item}</p></div>)}</div></div><div className="flex flex-col justify-center"><p className="text-sm font-medium text-primary">Designed for the rhythm of real life</p><h2 className="mt-5 max-w-md text-4xl font-semibold leading-[.98] tracking-[-.055em]">Spend less time sorting. Keep more context.</h2><p className="mt-6 max-w-md text-base leading-relaxed text-muted">Know exactly where your money went, how your choices are adding up, and what you can do next—all without turning personal finance into a full-time job.</p><a href="#security" className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink hover:text-primary">Explore the details <ArrowRight className="h-4 w-4" /></a></div></div></section>

      <section id="security" className="mx-auto max-w-[1280px] px-5 py-20 md:px-10 md:py-28"><div className="app-panel grid overflow-hidden lg:grid-cols-[1.1fr_.9fr]"><div className="p-8 md:p-12"><LockKeyhole className="h-5 w-5 text-primary"/><h2 className="mt-8 max-w-lg text-4xl font-semibold leading-[.98] tracking-[-.055em]">Your financial details deserve a calm, secure home.</h2><p className="mt-6 max-w-md text-base leading-relaxed text-muted">The interface is intentionally quiet. Important information is obvious, actions are clear, and your privacy is never treated as an afterthought.</p></div><div className="border-t border-line bg-subtle p-8 lg:border-l lg:border-t-0 md:p-12"><p className="text-sm font-medium">Built in safeguards</p><div className="mt-7 space-y-6">{["Clear, explainable financial summaries", "Accessible controls and keyboard support", "Thoughtful warnings before important actions"].map(item=><div key={item} className="flex gap-3 text-sm text-muted"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />{item}</div>)}</div></div></div></section>
      <footer className="border-t border-line px-5 py-7 md:px-10"><div className="mx-auto flex max-w-[1280px] flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between"><span>Personal Finance</span><span>Make room for what matters.</span></div></footer>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="rounded-control border border-line p-3"><p className="text-xs text-muted">{label}</p><p className={cn("mt-1 text-lg font-semibold tracking-[-.04em]", tone)}>{value}</p></div>; }

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
  { label: "Monthly income", value: "$8,420", tone: "text-success" },
  { label: "Expenses", value: "$4,180", tone: "text-danger" },
  { label: "Savings rate", value: "50.4%", tone: "text-primary" },
];

function LegacyHomePage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      {/* ─── Navigation ─── */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold text-ink"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
              <WalletCards aria-hidden="true" className="h-4 w-4" />
            </span>
            Personal Finance
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
            <a href="#features" className="transition hover:text-ink">
              Features
            </a>
            <a href="#security" className="transition hover:text-ink">
              Security
            </a>
            <a href="#reports" className="transition hover:text-ink">
              Reports
            </a>
          </div>

          <Link
            href="/dashboard"
            data-slot="button"
            className={acebuilderButtonClass}
          >
            Open app
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* ─── Hero ─── */}
      <section className="bg-canvas px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-success">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              Private financial planning
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Your money,
              <br />
              clearly organized
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Turn transactions into a clear financial picture with dashboards,
              category breakdowns, budgets, and exportable reports.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                data-slot="button"
                className={cn(acebuilderButtonClass, "h-11 px-6")}
              >
                Go to dashboard
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-6 text-sm font-medium text-ink transition hover:bg-canvas"
              >
                Create account
              </Link>
            </div>

            <div className="mt-8 grid gap-2.5 text-sm text-muted">
              {workflowItems.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-bright/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-bright" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Hero preview card ─── */}
          <div className="surface-card rounded-card bg-surface p-5">
            <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">
                  August overview
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Income, expenses, and savings
                </p>
              </div>
              <div className="inline-flex w-fit rounded-full bg-canvas p-1 text-xs font-medium text-muted border border-line">
                <span className={cn("rounded-full px-3 py-1 font-display", acebuilderActiveClasses)}>
                  Monthly
                </span>
                <span className="px-3 py-1 font-display">Yearly</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-card border border-line bg-canvas/50 p-4">
                  <p className="text-xs font-medium text-muted">
                    {stat.label}
                  </p>
                  <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${stat.tone}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Bento chart area: bar chart left, categories right */}
            <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Bar chart */}
              <div className="rounded-card bg-canvas/50 border border-line p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    Cash flow
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-success-bright" />
                      Income
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-danger" />
                      Expense
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex h-44 items-end gap-2.5">
                  {[48, 64, 42, 72, 56, 86].map((height, index) => (
                    <div
                      key={`bar-${index}`}
                      className="flex flex-1 items-end gap-1"
                    >
                      <span
                        className="w-full rounded-t-md bg-success-bright"
                        style={{ height: `${height}%` }}
                      />
                      <span
                        className="w-full rounded-t-md bg-danger"
                        style={{ height: `${Math.max(24, height - 18)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-muted">
                  {["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Category donut */}
              <div className="rounded-card bg-ink p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/90">
                    Categories
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full chart-distribution p-4">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-ink text-center text-[10px] font-medium text-white/70">
                      Expense
                      <br />
                      mix
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  {[
                    { name: "Housing", amount: "$1,420", color: "bg-primary" },
                    { name: "Groceries", amount: "$640", color: "bg-chart-blue" },
                    { name: "Transport", amount: "$310", color: "bg-chart-peach" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-white/70">
                        <span className={cn("h-2 w-2 rounded-full", item.color)} />
                        {item.name}
                      </span>
                      <span className="font-medium text-white">
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features — bento layout ─── */}
      <section id="features" className="bg-surface px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-lg">
            <p className="text-sm font-medium text-success">
              Built around your workflow
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              From raw entries to decisions you can act on.
            </h2>
          </div>

          {/* Asymmetric bento: large card left, two smaller right */}
          {(() => {
            const Icon0 = features[0].icon;
            const Icon1 = features[1].icon;
            const Icon2 = features[2].icon;

            return (
              <div className="mt-10 grid gap-3 md:grid-cols-[1.2fr_0.8fr] md:grid-rows-2">
                {/* Large feature card — spans 2 rows */}
                <article className="surface-card row-span-2 flex flex-col justify-end rounded-card bg-canvas p-8">
                  <Icon0 aria-hidden="true" className="h-6 w-6 text-ink" />
                  <h3 className="mt-5 text-xl font-semibold text-ink">
                    {features[0].title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                    {features[0].description}
                  </p>
                </article>

                {/* Top right */}
                <article className="surface-card flex flex-col justify-end rounded-card bg-accent p-6">
                  <Icon1 aria-hidden="true" className="h-5 w-5 text-ink" />
                  <h3 className="mt-4 text-lg font-semibold text-ink">
                    {features[1].title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {features[1].description}
                  </p>
                </article>

                {/* Bottom right */}
                <article className="surface-card flex flex-col justify-end rounded-card bg-ink p-6 text-white">
                  <Icon2 aria-hidden="true" className="h-5 w-5 text-white" />
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {features[2].title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {features[2].description}
                  </p>
                </article>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─── Security + Reports ─── */}
      <section className="bg-canvas px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-2">
          <div id="security" className="surface-card rounded-card bg-surface p-8">
            <LockKeyhole
              aria-hidden="true"
              className="h-6 w-6 text-ink"
            />
            <h2 className="mt-5 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Secure session handling without friction.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              The app uses protected routes and refresh-token based navigation,
              so the dashboard link takes signed-in users straight to their
              workspace and routes new visitors to login.
            </p>
          </div>

          <div id="reports" className="surface-card rounded-card bg-surface p-8">
            <CalendarRange
              aria-hidden="true"
              className="h-6 w-6 text-ink"
            />
            <h2 className="mt-5 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Reports for the exact period you care about.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Pick a start date, end date, and output format to create a
              downloadable record from the same data you use in the dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
