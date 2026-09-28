// Shared types for PulseDeck probe state.

export interface Sample {
  /** epoch ms */
  t: number;
  /** true = HTTP 2xx/3xx within timeout */
  ok: boolean;
  /** round-trip latency in ms (-1 when down) */
  ms: number;
  /** HTTP status code (-1 when no response) */
  code: number;
}

export interface DayAggregate {
  /** YYYY-MM-DD */
  d: string;
  up: number;
  total: number;
  /** p95 latency of successful checks that day, ms */
  p95: number;
}

export interface Incident {
  id: string;
  startedAt: string; // ISO
  endedAt: string | null; // ISO, null while open
  failedChecks: number;
  /** GitHub issue number filed for this incident (CI only) */
  issue?: number;
}

export interface ServiceState {
  samples: Sample[];
  daily: DayAggregate[];
  incidents: Incident[];
}

export interface ProbeState {
  version: 1;
  updatedAt: string; // ISO of last probe run
  services: Record<string, ServiceState>;
}

export interface ServiceDef {
  slug: string;
  name: string;
  url: string;
  description: string;
  category: "mine" | "third-party";
}
