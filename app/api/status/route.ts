import { NextResponse } from "next/server";
import { DATA_URL } from "@/lib/services";
import { isUp, latencyStats, measuredCadenceMs, uptimePct } from "@/lib/stats";
import { SERVICES } from "@/lib/services";
import type { ProbeState } from "@/lib/types";
import snapshot from "@/data/state.json";

/**
 * Public JSON status API.
 * Proxies the live probe state (cached 5 min) with a bundled fallback,
 * so /api/status is always fast and always honest about freshness.
 * The cadence reported is the measured one — GitHub's scheduler is
 * best-effort, so the configured cron is not what actually happens.
 */
export async function GET() {
  let state = snapshot as ProbeState;
  let live = false;
  try {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const json = await res.json();
      if (json?.version === 1 && json.services) {
        state = json as ProbeState;
        live = true;
      }
    }
  } catch {
    /* fall back to the bundled snapshot */
  }

  const services = SERVICES.map((def) => {
    const up = isUp(state, def.slug);
    const lat = latencyStats(state, def.slug);
    return {
      slug: def.slug,
      name: def.name,
      url: def.url,
      status: up === null ? "unknown" : up ? "up" : "down",
      uptime_30d: uptimePct(state, def.slug, 30),
      latency_avg_ms: lat?.avg ?? null,
      latency_p95_ms: lat?.p95 ?? null,
    };
  });

  const cadenceMs = measuredCadenceMs(state);

  return NextResponse.json({
    status: services.every((s) => s.status !== "down") ? "operational" : "incident",
    live,
    updated_at: state.updatedAt,
    probe_schedule: "*/30 * * * *",
    probe_cadence_minutes: cadenceMs === null ? null : Math.round(cadenceMs / 60000),
    probe_cadence_note:
      "Measured from recent probe timestamps. GitHub Actions schedules are best-effort, so the observed cadence differs from the configured cron.",
    services,
  });
}
