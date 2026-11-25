"use client";

import { useState } from "react";
import { SERVICES } from "../../lib/services";

const projects = SERVICES.filter(service => ["slip-025", "holdpoint"].includes(service.slug));
type Check = { ok: boolean; event: string };
const baseline: Check = { ok: true, event: "Baseline recorded" };

function clock(index: number) {
  const minutes = 9 * 60 + index * 30;
  return `Day ${Math.floor(minutes / 1440) + 1} · ${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${index % 2 ? "30" : "00"}`;
}

export default function Replay() {
  const [slug, setSlug] = useState(projects[0].slug);
  const [checks, setChecks] = useState<Check[]>([baseline]);
  const last = checks[checks.length - 1];
  const start = checks.map(check => check.event).lastIndexOf("Issue opened");
  const count = checks.length - 1;
  const closed = last.ok && start >= 0;
  const end = closed ? checks.findIndex((check, i) => i > start && check.ok) : checks.length;
  function run(ok: boolean) {
    setChecks(previous => {
      const wasUp = previous[previous.length - 1].ok;
      const event = ok ? (wasUp ? "Success recorded" : "Issue closed") : (wasUp ? "Issue opened" : "Failure added to open issue");
      return [...previous, { ok, event }];
    });
  }
  return <section className="drill">
    <div className="drill-controls"><label>Probe target <select value={slug} onChange={event => { setSlug(event.target.value); setChecks([baseline]); }}>
      {projects.map(project => <option key={project.slug} value={project.slug}>{project.name}</option>)}
    </select></label><button onClick={() => setChecks([baseline])}>Reset drill</button></div>
    <div className="scope" aria-live="polite">
      <p className="font-mono text-sm">Simulated HTTP probe · {clock(count)} UTC</p>
      <h2 key={count}>{last.ok ? "200 OK" : "503 Service unavailable"}</h2>
      <p className="font-mono break-all">{projects.find(project => project.slug === slug)?.url}</p>
      <div className="drill-signal" aria-hidden="true">{checks.slice(-40).map((check,i) => <i key={count-i} className={check.ok ? "up" : "down"} />)}</div>
      <p>{last.event} · {start < 0 ? "No incident" : `${closed ? "Resolved" : "Open"} incident · ${end - start} failed check${end - start === 1 ? "" : "s"} · ${((closed ? end : count) - start) * 30} min since detection`}</p>
    </div>
    <div className="drill-actions"><strong>Next simulated response</strong><button onClick={() => run(false)}>Send 503 failure</button><button onClick={() => run(true)}>Send 200 success</button></div>
    <details open className="drill-log"><summary>Probe log ({checks.length})</summary><ol>{checks.map((check,i) => <li key={i}><time>{clock(i)}</time><b>{check.ok ? "200" : "503"}</b>{check.event}</li>).reverse()}</ol></details>
  </section>;
}
