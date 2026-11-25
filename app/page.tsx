"use client";

import Link from "next/link";
import { useProbeState } from "../lib/data";
import { SERVICES } from "../lib/services";
import { openIncidents, totalChecks } from "../lib/stats";
import { ServiceGrid, StatusBanner } from "../components/Status";
import { ProofSection } from "../components/Proof";

export default function Home() {
  const { state, live } = useProbeState();
  return (
    <div className="workspace">
      <div className="page-heading">
        <h1>System overview</h1>
        <a href="https://github.com/Faizan00parvez/pulsedeck">Source code ↗</a>
      </div>
      <section className="drill-invite"><div><p className="font-mono text-sm">Interactive incident drill</p><h2>What happens after a failed check?</h2><p>Take Slip 025 or Holdpoint offline in a simulation and follow the incident through recovery.</p></div><Link href="/demo">Run the drill</Link></section>
      <StatusBanner state={state} live={live} />
      <dl className="metrics">
        <div>
          <dt>Monitored services</dt>
          <dd>{SERVICES.length}</dd>
        </div>
        <div>
          <dt>Recorded checks</dt>
          <dd>{totalChecks(state).toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Open incidents</dt>
          <dd>
            <Link href="/incidents">{openIncidents(state).length}</Link>
          </dd>
        </div>
      </dl>
      <section>
        <div className="section-heading">
          <h2>Service health</h2>
          <span>90-day history</span>
        </div>
        <ServiceGrid state={state} />
      </section>
      <ProofSection state={state} />
      <Link className="architecture-link" href="/architecture">
        Explore the monitoring pipeline →
      </Link>
    </div>
  );
}
