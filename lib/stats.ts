import type { DayAggregate, ProbeState, Sample, ServiceState } from "./types";

export function emptyServiceState(): ServiceState {
  return { samples: [], daily: [], incidents: [] };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

/** Latest sample, or null when the service has never been probed. */
export function latestSample(state: ProbeState, slug: string): Sample | null {
  const s = state.services[slug]?.samples;
  return s && s.length > 0 ? s[s.length - 1] : null;
}

export function isUp(state: ProbeState, slug: string): boolean | null {
  const l = latestSample(state, slug);
  return l ? l.ok : null;
}

/** Uptime % over the last N days (or all data when fewer). */
export function uptimePct(state: ProbeState, slug: string, days: number): number | null {
  const daily = state.services[slug]?.daily ?? [];
  const recent = daily.slice(-days);
  if (recent.length === 0) return null;
  const up = recent.reduce((a, d) => a + d.up, 0);
  const total = recent.reduce((a, d) => a + d.total, 0);
  return total === 0 ? null : (up / total) * 100;
}

/** Latency stats over recent successful samples. */
export function latencyStats(
  state: ProbeState,
  slug: string,
  maxSamples = 200
): { avg: number; p95: number; count: number } | null {
  const samples = (state.services[slug]?.samples ?? [])
    .slice(-maxSamples)
    .filter((s) => s.ok && s.ms >= 0)
    .map((s) => s.ms)
    .sort((a, b) => a - b);
  if (samples.length === 0) return null;
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { avg: Math.round(avg), p95: Math.round(percentile(samples, 95)), count: samples.length };
}

/** Daily bars for the last N days, oldest first. Missing days are filled with nulls. */
export function dailyBars(
  state: ProbeState,
  slug: string,
  days = 90
): (DayAggregate | null)[] {
  const daily = state.services[slug]?.daily ?? [];
  const byDay = new Map(daily.map((d) => [d.d, d]));
  const out: (DayAggregate | null)[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? null);
  }
  return out;
}

/** Number of currently open incidents across all services. */
export function openIncidents(state: ProbeState): { slug: string; incident: NonNullable<ServiceState["incidents"][number]> }[] {
  const out: { slug: string; incident: NonNullable<ServiceState["incidents"][number]> }[] = [];
  for (const [slug, svc] of Object.entries(state.services)) {
    for (const inc of svc.incidents) {
      if (inc.endedAt === null) out.push({ slug, incident: inc });
    }
  }
  return out.sort((a, b) => b.incident.startedAt.localeCompare(a.incident.startedAt));
}

/** All incidents across services, newest first. */
export function allIncidents(state: ProbeState): { slug: string; incident: NonNullable<ServiceState["incidents"][number]> }[] {
  const out: { slug: string; incident: NonNullable<ServiceState["incidents"][number]> }[] = [];
  for (const [slug, svc] of Object.entries(state.services)) {
    for (const inc of svc.incidents) out.push({ slug, incident: inc });
  }
  return out.sort((a, b) => b.incident.startedAt.localeCompare(a.incident.startedAt));
}

export function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "<1 min";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "just now";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
