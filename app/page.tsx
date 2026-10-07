"use client";

import Link from "next/link";
import { useNow, useProbeState } from "../lib/data";
import { formatCadence, measuredCadenceMs, timeAgoFrom } from "../lib/stats";
import { ServiceGrid, StatusBanner } from "../components/Status";
import { ProofSection } from "../components/Proof";

export default function Home() {
  const { state, live } = useProbeState();
  const now = useNow(1000);
  const cadence = measuredCadenceMs(state);
  return (
    <div>
      {/* Hero */}
      <div className="bg-grid border-b border-ink-600/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-10">
          <p className="text-sm font-mono text-emerald-300/90 mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="dot-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>
              {live ? "live" : "loading live data"} · checked {timeAgoFrom(state.updatedAt, now)}
              {cadence !== null && <> · probes {formatCadence(cadence)}</>}
            </span>
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Everything I ship,<br />monitored in public.
          </h1>
          <p className="text-mist-300 mt-4 max-w-2xl text-lg">
            PulseDeck is a status page I built and operate like production: a scheduled
            prober checks my sites around the clock, stores every result in git, and
            files an incident automatically when something goes down.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/architecture"
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-emerald-300"
            >
              How it works
            </Link>
            <a
              href="https://github.com/Faizan00parvez/pulsedeck"
              className="rounded-lg border border-ink-600 px-4 py-2 text-sm font-semibold text-mist-100 hover:bg-ink-800"
            >
              Source code
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-10">
        <StatusBanner state={state} live={live} />
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold">Services</h2>
            <span className="text-sm text-mist-500 font-mono">{live ? "live feed" : "bundled snapshot"}</span>
          </div>
          <ServiceGrid state={state} />
        </section>

        <ProofSection state={state} />

        <section className="rounded-2xl border border-ink-600/70 bg-ink-900 p-6">
          <h2 className="text-lg font-semibold mb-2">Why a status page?</h2>
          <p className="text-mist-300 text-[15px] leading-relaxed">
            Anyone can claim &ldquo;I know monitoring.&rdquo; This page is the receipts: real probes,
            real latency numbers, real incident history — running on a schedule, with the
            pipeline visible in the repo. It&rsquo;s the same loop I&rsquo;d run on day one as a
            Cloud/DevOps engineer: <span className="text-mist-100 font-medium">observe → alert → investigate → document.</span>
          </p>
          <Link href="/architecture" className="inline-block mt-3 text-sm text-emerald-300 hover:text-emerald-200 underline underline-offset-4">
            See the pipeline behind this page →
          </Link>
        </section>
      </div>
    </div>
  );
}
