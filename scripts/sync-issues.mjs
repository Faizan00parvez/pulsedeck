#!/usr/bin/env node
/**
 * Turns probe incident events into GitHub issues.
 *
 * Reads <stateDir>/events.json (written by scripts/probe.mjs) and
 * <stateDir>/state.json. For each opened incident it creates a GitHub
 * issue and records the issue number on the incident; for each closed
 * incident it finds the open issue by incident id and closes it.
 *
 * Requires the `gh` CLI authenticated (GH_TOKEN) and network access.
 * Safe to run when events.json is absent (no-op).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const stateDir = process.env.PULSE_STATE_PATH ?? join(process.cwd(), "data");
const eventsPath = join(stateDir, "events.json");
const statePath = join(stateDir, "state.json");

function gh(args, input) {
  return execFileSync("gh", args, { encoding: "utf8", input }).trim();
}

function main() {
  if (!existsSync(eventsPath)) {
    console.log("no incident events; nothing to do");
    return;
  }
  const events = JSON.parse(readFileSync(eventsPath, "utf8"));
  const state = JSON.parse(readFileSync(statePath, "utf8"));

  for (const ev of events) {
    const svc = state.services[ev.slug];
    const incident = svc?.incidents.find((i) => i.id === ev.incident.id);
    if (!incident) continue;

    if (ev.type === "opened") {
      const body = [
        `Incident ${ev.incident.id} — **${ev.name}** is unreachable.`,
        ``,
        `- URL: ${ev.url}`,
        `- First failed check: ${ev.incident.startedAt}`,
        `- Consecutive failed checks: ${ev.incident.failedChecks}`,
        ``,
        `Opened automatically by the PulseDeck prober. It will close itself when the service recovers.`,
      ].join("\n");
      const out = gh(["issue", "create", "--title", `[incident] ${ev.name} is down`, "--body", body, "--label", "incident"]);
      const m = out.match(/\/issues\/(\d+)/);
      if (m) {
        incident.issue = Number.parseInt(m[1], 10);
        console.log(`opened issue #${incident.issue} for ${ev.incident.id}`);
      }
    } else if (ev.type === "closed") {
      const found = JSON.parse(
        gh(["issue", "list", "--state", "open", "--search", `${ev.incident.id} in:body`, "--json", "number", "--limit", "5"])
      );
      for (const issue of found) {
        gh(["issue", "close", String(issue.number), "--comment",
          `Recovered at ${ev.incident.endedAt} after ${ev.incident.failedChecks} failed checks. Auto-closed by PulseDeck.`]);
        console.log(`closed issue #${issue.number} for ${ev.incident.id}`);
      }
    }
  }

  writeFileSync(statePath, JSON.stringify(state, null, 1) + "\n");
  rmSync(eventsPath);
  console.log("issues synced");
}

main();
