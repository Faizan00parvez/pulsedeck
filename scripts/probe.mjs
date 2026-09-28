#!/usr/bin/env node
/**
 * PulseDeck prober.
 *
 * Runs on a schedule (GitHub Actions, every 30 min) and locally via
 * `npm run probe`. For each configured service it records reachability,
 * latency and HTTP status, maintains rolling samples + daily aggregates,
 * detects incidents (up->down transitions), and writes data/state.json.
 *
 * In CI the workflow commits state.json to the `data` branch; the site
 * fetches it at runtime from raw.githubusercontent.com, so the dashboard
 * stays live without a rebuild per probe.
 *
 * Incident alerting: the probe writes data/events.json describing any
 * incident opened/closed on this run; the workflow turns those into
 * GitHub issues (see .github/workflows/probe.yml).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// PULSE_STATE_PATH lets CI point the prober at a separate checkout of the
// `data` branch while the script itself lives on main.
const STATE_PATH = process.env.PULSE_STATE_PATH
  ? join(process.env.PULSE_STATE_PATH, "state.json")
  : join(ROOT, "data", "state.json");
const EVENTS_PATH = join(dirname(STATE_PATH), "events.json");

const TIMEOUT_MS = 10_000;
const MAX_SAMPLES = 1600; // ~33 days at 30-min cadence
const MAX_DAYS = 120;
const MAX_INCIDENTS = 50;

const SERVICES = [
  { slug: "portfolio", name: "Portfolio", url: "https://faizanxbuilds.github.io" },
  { slug: "greet", name: "GREET Teacher Training College", url: "https://greetteachertrainingcollege.in" },
  { slug: "seenbyai", name: "SeenByAI", url: "https://seenbyai-one.vercel.app" },
  { slug: "github-api", name: "GitHub API", url: "https://api.github.com/zen" },
  { slug: "google-edge", name: "Google Edge", url: "https://www.google.com/generate_204" },
];

function emptyService() {
  return { samples: [], daily: [], incidents: [] };
}

function loadState() {
  if (existsSync(STATE_PATH)) {
    try {
      const s = JSON.parse(readFileSync(STATE_PATH, "utf8"));
      if (s && s.version === 1 && s.services) return s;
    } catch {
      /* fall through to fresh state */
    }
  }
  return { version: 1, updatedAt: new Date(0).toISOString(), services: {} };
}

async function probe(url) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "PulseDeck-prober/1.0 (+https://github.com/Faizan00parvez/pulsedeck)" },
    });
    // Drain body so the timing reflects a complete response.
    await res.arrayBuffer().catch(() => {});
    const ms = Date.now() - start;
    return { ok: res.status >= 200 && res.status < 400, ms, code: res.status };
  } catch {
    return { ok: false, ms: -1, code: -1 };
  } finally {
    clearTimeout(timer);
  }
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[i];
}

function detectIncidents(svc, nowIso) {
  const events = [];
  const samples = svc.samples;
  if (samples.length < 2) return events;
  const prev = samples[samples.length - 2];
  const cur = samples[samples.length - 1];
  const open = svc.incidents.find((i) => i.endedAt === null);

  if (prev.ok && !cur.ok && !open) {
    const incident = {
      id: `inc-${Date.parse(nowIso)}`,
      startedAt: nowIso,
      endedAt: null,
      failedChecks: 1,
    };
    svc.incidents.push(incident);
    events.push({ type: "opened", incident });
  } else if (!cur.ok && open) {
    open.failedChecks += 1;
  } else if (!prev.ok && cur.ok && open) {
    open.endedAt = nowIso;
    events.push({ type: "closed", incident: open });
  }
  // Cap stored incidents (open ones are never dropped).
  const closed = svc.incidents.filter((i) => i.endedAt !== null);
  const dropped = Math.max(0, closed.length - MAX_INCIDENTS);
  if (dropped > 0) {
    const keepIds = new Set(closed.slice(dropped).map((i) => i.id));
    svc.incidents = svc.incidents.filter((i) => i.endedAt === null || keepIds.has(i.id));
  }
  return events;
}

async function main() {
  const state = loadState();
  const now = new Date();
  const nowIso = now.toISOString();
  const today = nowIso.slice(0, 10);
  const allEvents = [];

  for (const def of SERVICES) {
    const result = await probe(def.url);
    const svc = state.services[def.slug] ?? emptyService();

    svc.samples.push({ t: now.getTime(), ok: result.ok, ms: result.ms, code: result.code });
    if (svc.samples.length > MAX_SAMPLES) svc.samples = svc.samples.slice(-MAX_SAMPLES);

    // Daily aggregate for today.
    let day = svc.daily.find((d) => d.d === today);
    if (!day) {
      day = { d: today, up: 0, total: 0, p95: 0 };
      svc.daily.push(day);
      if (svc.daily.length > MAX_DAYS) svc.daily = svc.daily.slice(-MAX_DAYS);
    }
    day.total += 1;
    if (result.ok) {
      day.up += 1;
      const latencies = svc.samples.filter((s) => s.ok && s.ms >= 0).map((s) => s.ms).sort((a, b) => a - b);
      day.p95 = Math.round(percentile(latencies, 95));
    }

    const events = detectIncidents(svc, nowIso);
    for (const e of events) allEvents.push({ slug: def.slug, name: def.name, url: def.url, ...e });

    state.services[def.slug] = svc;
    console.log(`${result.ok ? "UP  " : "DOWN"} ${def.slug} ${result.code} ${result.ms}ms`);
  }

  state.updatedAt = nowIso;
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 1) + "\n");

  if (allEvents.length > 0) {
    writeFileSync(EVENTS_PATH, JSON.stringify(allEvents, null, 1) + "\n");
    console.log(`incident events: ${allEvents.length}`);
  }
  console.log(`state written, updatedAt=${nowIso}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
