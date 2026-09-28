"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES } from "../../../lib/services";
import { useProbeState } from "../../../lib/data";
import { dailyBars, formatDuration, latencyStats, timeAgo, uptimePct } from "../../../lib/stats";
import { StatusDot, statusColor, statusLabel } from "../../../components/StatusDot";
import { UptimeBars } from "../../../components/UptimeBars";
import { LatencySpark } from "../../../components/LatencySpark";

export default function ServiceDetail({ slug }: { slug: string }) {
  const def = SERVICES.find((s) => s.slug === slug);
  const { state, live } = useProbeState();
  if (!def) notFound();

  const svc = state.services[slug];
  const up24 = uptimePct(state, slug, 1);
  const up7 = uptimePct(state, slug, 7);
  const up30 = uptimePct(state, slug, 30);
  const lat = latencyStats(state, slug, 500);
  const incidents = [...(svc?.incidents ?? [])].reverse();
  const bars = dailyBars(state, slug, 90);

  const stat = (label: string, value: string) => (
    <div className="rounded-xl border border-ink-600/70 bg-ink-900 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-mist-500">{label}</p>
      <p className="text-xl font-semibold mt-1 font-mono">{value}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Link href="/" className="text-sm text-mist-500 hover:text-mist-100">← All services</Link>

      <div className="flex items-center gap-3 mt-4">
        <StatusDot state={state} slug={slug} size="lg" />
        <h1 className="text-3xl font-bold tracking-tight">{def.name}</h1>
      </div>
      <p className="text-mist-500 mt-1 font-mono text-sm">{def.url}</p>
      <p className="text-mist-300 mt-2">{def.description}</p>
      <p className={`mt-2 text-sm font-medium ${statusColor(state, slug)}`}>
        {statusLabel(state, slug)} · {live ? "live" : "snapshot"} · updated {timeAgo(state.updatedAt)}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
        {stat("Uptime · 24h", up24 === null ? "—" : `${up24.toFixed(2)}%`)}
        {stat("Uptime · 7d", up7 === null ? "—" : `${up7.toFixed(2)}%`)}
        {stat("Uptime · 30d", up30 === null ? "—" : `${up30.toFixed(2)}%`)}
        {stat("Latency · p95", lat === null ? "—" : `${lat.p95} ms`)}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-1">Response time</h2>
        <p className="text-sm text-mist-500 mb-4">Recent successful checks{lat ? ` · avg ${lat.avg} ms over ${lat.count} checks` : ""}.</p>
        <div className="rounded-2xl border border-ink-600/70 bg-ink-900 p-5">
          <LatencySpark samples={svc?.samples ?? []} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-1">90-day history</h2>
        <p className="text-sm text-mist-500 mb-4">Daily uptime bars — hover any bar for that day&rsquo;s numbers.</p>
        <div className="rounded-2xl border border-ink-600/70 bg-ink-900 p-5">
          <UptimeBars state={state} slug={slug} days={90} />
          <div className="flex justify-between text-xs text-mist-500 mt-2 font-mono">
            <span>{bars[0] ? new Date(bars[0].d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
            <span>today</span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Incidents</h2>
        {incidents.length === 0 ? (
          <p className="text-mist-500 text-sm rounded-2xl border border-ink-600/70 bg-ink-900 p-5">
            No incidents recorded for this service yet.
          </p>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => {
              const open = inc.endedAt === null;
              const dur = formatDuration(
                new Date(inc.endedAt ?? new Date().toISOString()).getTime() - new Date(inc.startedAt).getTime()
              );
              return (
                <div key={inc.id} className="rounded-2xl border border-ink-600/70 bg-ink-900 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${open ? "text-red-300" : "text-mist-100"}`}>
                      {open ? "Ongoing outage" : "Resolved"} · {dur}
                    </p>
                    {inc.issue && (
                      <a
                        href={`https://github.com/Faizan00parvez/pulsedeck/issues/${inc.issue}`}
                        className="text-xs text-mist-500 hover:text-mist-100 underline underline-offset-4 font-mono"
                      >
                        #{inc.issue}
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-mist-500 mt-1 font-mono">
                    {new Date(inc.startedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    {inc.endedAt ? ` → ${new Date(inc.endedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : " → now"}
                    {" · "}{inc.failedChecks} failed check{inc.failedChecks === 1 ? "" : "s"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
