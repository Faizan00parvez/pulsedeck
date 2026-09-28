import Link from "next/link";

const STEPS = [
  {
    title: "Probe",
    file: "scripts/probe.mjs",
    desc: "Node script (zero dependencies) hits each service with a 10s timeout, recording reachability, latency and HTTP status.",
  },
  {
    title: "Schedule",
    file: ".github/workflows/probe.yml",
    desc: "GitHub Actions runs the prober every 30 minutes. Concurrency is locked so two runs never overlap and corrupt state.",
  },
  {
    title: "Store",
    file: "data branch → state.json",
    desc: "Results land in git itself: rolling samples, daily aggregates and incidents on an orphan data branch. Git is the database — every datapoint is versioned and auditable.",
  },
  {
    title: "Alert",
    file: "scripts/sync-issues.mjs",
    desc: "An up→down transition opens a GitHub issue; recovery closes it. The full alert → resolve loop, no pager service needed.",
  },
  {
    title: "Serve",
    file: "app/ + raw.githubusercontent",
    desc: "The Next.js site ships with a bundled snapshot, then swaps in live state from the data branch at runtime — fresh data with zero rebuilds per probe.",
  },
];

const DECISIONS = [
  {
    q: "Why store monitoring data in git?",
    a: "It keeps the whole system on free tiers with zero moving parts: no database to host, back up or pay for. Every state change is a commit — the monitoring history is automatically auditable, diffable and restorable.",
  },
  {
    q: "Why a separate data branch instead of redeploying?",
    a: "Probing every 30 minutes means 48 deploys a day. Fetching state.json at runtime from the data branch keeps the dashboard live while the site itself deploys only when code changes. Hot data plane, cold deploy plane.",
  },
  {
    q: "Why GitHub Issues for incidents?",
    a: "It's the alerting primitive that's already there: timestamped, assignable, commentable, and closable by automation. It mirrors how real on-call rotations track incidents without adding PagerDuty-style cost.",
  },
  {
    q: "Why 30-minute cadence, not 1-minute?",
    a: "A deliberate cost/precision trade-off. These are brochure sites, not payment gateways — 30 minutes catches real outages while staying far inside free-tier limits for Actions minutes and git history size.",
  },
];

const SKILLS = [
  ["Scheduled automation", "cron-driven GitHub Actions with concurrency guards"],
  ["Observability", "reachability + latency + status codes, p95 aggregates, 90-day history"],
  ["Incident management", "automatic detection, issue filing, auto-resolution, public log"],
  ["GitOps thinking", "git as the source of truth for both code and operational data"],
  ["CI/CD", "lint + typecheck + build on every push; Vercel deploys on merge"],
  ["Cost-aware engineering", "entire pipeline runs on free tiers by design, not accident"],
];

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <p className="text-sm font-mono text-emerald-300/90 mb-2">for the curious (and hiring managers)</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">How PulseDeck works</h1>
      <p className="text-mist-300 mt-3 max-w-2xl text-lg">
        Five stages, no servers, no database, no bill. The whole thing is visible
        in <a href="https://github.com/Faizan00parvez/pulsedeck" className="text-emerald-300 underline underline-offset-4">the repo</a> —
        including the probe history itself.
      </p>

      {/* Pipeline diagram */}
      <div className="mt-10 rounded-2xl border border-ink-600/70 bg-ink-900 p-6 overflow-x-auto">
        <div className="flex items-stretch gap-0 min-w-[760px]">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-stretch flex-1">
              <div className="flex-1 rounded-xl border border-ink-600 bg-ink-800/70 p-4">
                <p className="text-xs font-mono text-emerald-300">0{i + 1}</p>
                <p className="font-semibold mt-1">{s.title}</p>
                <p className="text-xs font-mono text-mist-500 mt-1 break-all">{s.file}</p>
                <p className="text-sm text-mist-300 mt-2 leading-relaxed">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex items-center px-2 text-mist-600 text-xl" aria-hidden>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decisions */}
      <h2 className="text-2xl font-bold tracking-tight mt-14 mb-6">Design decisions</h2>
      <div className="space-y-4">
        {DECISIONS.map((d) => (
          <div key={d.q} className="rounded-2xl border border-ink-600/70 bg-ink-900 p-6">
            <h3 className="font-semibold text-mist-100">{d.q}</h3>
            <p className="text-mist-300 mt-2 leading-relaxed text-[15px]">{d.a}</p>
          </div>
        ))}
      </div>

      {/* Skills mapping */}
      <h2 className="text-2xl font-bold tracking-tight mt-14 mb-6">What this demonstrates</h2>
      <div className="rounded-2xl border border-ink-600/70 overflow-hidden">
        {SKILLS.map(([skill, how], i) => (
          <div key={skill} className={`grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-4 px-6 py-4 ${i % 2 ? "bg-ink-900" : "bg-ink-800/40"}`}>
            <p className="font-semibold text-sm">{skill}</p>
            <p className="text-sm text-mist-300">{how}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-emerald-300">
          Back to live status
        </Link>
        <a
          href="https://github.com/Faizan00parvez/pulsedeck/actions"
          className="rounded-lg border border-ink-600 px-4 py-2 text-sm font-semibold text-mist-100 hover:bg-ink-800"
        >
          Watch the prober run
        </a>
      </div>
    </div>
  );
}
