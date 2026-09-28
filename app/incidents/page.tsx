"use client";

import Link from "next/link";
import { SERVICES } from "../../lib/services";
import { useProbeState } from "../../lib/data";
import { allIncidents, formatDuration } from "../../lib/stats";

export default function IncidentsPage() {
  const { state } = useProbeState();
  const incidents = allIncidents(state);
  const nameOf = (slug: string) => SERVICES.find((s) => s.slug === slug)?.name ?? slug;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Incident log</h1>
      <p className="text-mist-300 mt-2 max-w-2xl">
        Every outage the prober has caught. When a service stops responding, the
        pipeline files a GitHub issue automatically and closes it on recovery —
        the same alert → resolve loop used in production on-call.
      </p>

      <div className="mt-8 space-y-3">
        {incidents.length === 0 && (
          <p className="text-mist-500 text-sm rounded-2xl border border-ink-600/70 bg-ink-900 p-6">
            No incidents recorded yet. The prober runs every 30 minutes — if anything
            I monitor goes down, it will show up here.
          </p>
        )}
        {incidents.map(({ slug, incident: inc }) => {
          const open = inc.endedAt === null;
          const dur = formatDuration(
            new Date(inc.endedAt ?? new Date().toISOString()).getTime() - new Date(inc.startedAt).getTime()
          );
          return (
            <div key={inc.id} className="rounded-2xl border border-ink-600/70 bg-ink-900 p-5 flex items-start gap-4">
              <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${open ? "bg-red-400 dot-pulse" : "bg-mist-600"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link href={`/services/${slug}`} className="font-semibold hover:underline underline-offset-4">
                    {nameOf(slug)}
                  </Link>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${open ? "text-red-300" : "text-mist-500"}`}>
                    {open ? "ongoing" : "resolved"}
                  </span>
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
                  {" · "}duration {dur} · {inc.failedChecks} failed check{inc.failedChecks === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
