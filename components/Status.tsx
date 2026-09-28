import Link from "next/link";
import { SERVICES } from "../lib/services";
import { isUp, latencyStats, openIncidents, timeAgo, uptimePct } from "../lib/stats";
import type { ProbeState } from "../lib/types";
import { StatusDot, statusColor, statusLabel } from "./StatusDot";
import { UptimeBars } from "./UptimeBars";

export function StatusBanner({ state, live }: { state: ProbeState; live: boolean }) {
  const open = openIncidents(state);
  const allUp = open.length === 0;
  return (
    <div
      className={`rounded-2xl border px-6 py-5 flex items-center gap-4 ${
        allUp ? "border-emerald-500/30 bg-emerald-500/[0.07]" : "border-red-500/30 bg-red-500/[0.07]"
      }`}
    >
      <span className="relative flex h-4 w-4 shrink-0">
        <span className={`dot-pulse absolute inline-flex h-full w-full rounded-full ${allUp ? "bg-emerald-400" : "bg-red-400"}`} />
        <span className={`relative inline-flex rounded-full h-4 w-4 ${allUp ? "bg-emerald-400" : "bg-red-400"}`} />
      </span>
      <div className="flex-1">
        <p className={`text-lg font-semibold ${allUp ? "text-emerald-300" : "text-red-300"}`}>
          {allUp ? "All systems operational" : `${open.length} incident${open.length > 1 ? "s" : ""} ongoing`}
        </p>
        <p className="text-sm text-mist-500">
          {live ? "Live" : "Snapshot"} data · updated {timeAgo(state.updatedAt)}
        </p>
      </div>
      <Link href="/incidents" className="text-sm text-mist-300 hover:text-mist-100 underline underline-offset-4 shrink-0">
        Incident log
      </Link>
    </div>
  );
}

function ServiceCard({ state, slug }: { state: ProbeState; slug: string }) {
  const def = SERVICES.find((s) => s.slug === slug)!;
  const up = isUp(state, slug);
  const up30 = uptimePct(state, slug, 30);
  const lat = latencyStats(state, slug);
  return (
    <Link
      href={`/services/${slug}`}
      className="block rounded-2xl border border-ink-600/70 bg-ink-900 p-5 hover:border-mist-600 hover:bg-ink-800/60 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusDot state={state} slug={slug} />
          <h3 className="font-semibold truncate">{def.name}</h3>
        </div>
        <span className={`text-sm font-medium ${statusColor(state, slug)}`}>{statusLabel(state, slug)}</span>
      </div>
      <p className="text-sm text-mist-500 mt-1 truncate font-mono">{def.url.replace(/^https?:\/\//, "")}</p>
      <div className="mt-4">
        <UptimeBars state={state} slug={slug} days={90} />
      </div>
      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="text-mist-500">
          {up30 === null ? "collecting data" : `${up30.toFixed(2)}% uptime · 30d`}
        </span>
        <span className="text-mist-500 font-mono">
          {lat === null ? "—" : up === false ? "down" : `${lat.avg} ms avg`}
        </span>
      </div>
    </Link>
  );
}

export function ServiceGrid({ state }: { state: ProbeState }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SERVICES.map((s) => (
        <ServiceCard key={s.slug} state={state} slug={s.slug} />
      ))}
    </div>
  );
}
