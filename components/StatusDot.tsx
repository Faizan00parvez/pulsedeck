import { latestSample } from "../lib/stats";
import type { ProbeState } from "../lib/types";

export function StatusDot({ state, slug, size = "md" }: { state: ProbeState; slug: string; size?: "sm" | "md" | "lg" }) {
  const s = latestSample(state, slug);
  const cls =
    s == null
      ? "bg-mist-500"
      : s.ok
        ? "bg-emerald-400"
        : "bg-red-400";
  const sz = size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-2.5 w-2.5";
  const pulse = s?.ok ? "dot-pulse" : "";
  return (
    <span className="relative flex shrink-0">
      <span className={`${pulse} absolute inline-flex h-full w-full rounded-full ${cls}`} />
      <span className={`relative inline-flex rounded-full ${sz} ${cls}`} />
    </span>
  );
}

export function statusLabel(state: ProbeState, slug: string): string {
  const s = latestSample(state, slug);
  if (s == null) return "No data yet";
  return s.ok ? "Operational" : "Down";
}

export function statusColor(state: ProbeState, slug: string): string {
  const s = latestSample(state, slug);
  if (s == null) return "text-mist-500";
  return s.ok ? "text-emerald-300" : "text-red-300";
}
