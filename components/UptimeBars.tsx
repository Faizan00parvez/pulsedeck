import { dailyBars } from "../lib/stats";
import type { ProbeState } from "../lib/types";

function barColor(pct: number | null): string {
  if (pct === null) return "bg-ink-600";
  if (pct >= 99.5) return "bg-emerald-500";
  if (pct >= 95) return "bg-amber-400";
  return "bg-red-500";
}

/** 90-day uptime bar strip, oldest → newest. */
export function UptimeBars({ state, slug, days = 90 }: { state: ProbeState; slug: string; days?: number }) {
  const bars = dailyBars(state, slug, days);
  return (
    <div className="flex items-end gap-[3px] h-10" role="img" aria-label={`${days}-day uptime history`}>
      {bars.map((d, i) => {
        const pct = d && d.total > 0 ? (d.up / d.total) * 100 : null;
        return (
          <div
            key={i}
            title={d ? `${d.d}: ${pct === null ? "—" : pct.toFixed(1) + "%"} (${d.up}/${d.total} checks)` : "no data"}
            className={`flex-1 rounded-[2px] ${barColor(pct)} ${pct === null ? "opacity-40" : ""}`}
            style={{ height: pct === null ? "18%" : `${Math.max(18, pct)}%` }}
          />
        );
      })}
    </div>
  );
}
