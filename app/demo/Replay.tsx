"use client";

import { useState } from "react";
import Link from "next/link";

const checks = [
  { time: "09:00", result: "HTTP 200", state: "Operational", title: "A successful check", explanation: "The scheduled probe requests the portfolio homepage. It responds in 184 ms, so PulseDeck records a successful check and its latency in git.", event: "Reachable · 184 ms" },
  { time: "09:30", result: "HTTP 503", state: "Down", title: "An outage opens an incident", explanation: "The next request returns a service error. PulseDeck records the failure and the workflow opens a GitHub issue so someone can investigate.", event: "Incident opened" },
  { time: "10:00", result: "HTTP 503", state: "Down", title: "A second failure joins the same incident", explanation: "The portfolio is still unavailable. PulseDeck adds this failed check to the ongoing incident, keeping both failures together.", event: "Incident updated · 2 failed checks" },
  { time: "10:30", result: "HTTP 200", state: "Operational", title: "Recovery closes the loop", explanation: "The homepage responds again in 207 ms. PulseDeck records the recovery and the workflow closes the issue. The incident log retains the hour between detection and recovery.", event: "Incident resolved · 1 hour" },
];

export default function Replay() {
  const [index, setIndex] = useState(0);
  const check = checks[index];
  return <section className="mt-7 overflow-hidden rounded-lg border border-ink-600 bg-white">
    <div className="bg-[#183b2d] p-5 text-[#f3f6e9] sm:p-8" aria-live="polite" aria-atomic="true">
      <p className="font-mono text-xs uppercase tracking-widest text-[#d4e9bf]">Simulated checks · {index + 1} of {checks.length}</p>
      <h2 className="mt-4 text-3xl font-medium tracking-tight">{check.title}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed">{check.explanation}</p>
    </div>
    <div className="p-5 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-semibold">Portfolio probe log</h3><span className={check.state === "Down" ? "text-red-300" : "text-emerald-300"}>{check.state}</span></div>
      <ol className="mt-3">{checks.slice(0,index+1).map(row =>
        <li key={row.time} className="flex flex-wrap gap-x-5 border-t border-ink-600 py-2 text-sm"><span className="font-mono">{row.time} UTC</span><span className="font-mono">{row.result}</span><span>{row.event}</span></li>
      )}</ol>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="button" disabled={index === 0} onClick={() => setIndex(index-1)} className="cursor-pointer text-sm underline underline-offset-4 disabled:cursor-default disabled:opacity-40">Previous</button>
        <button type="button" onClick={() => setIndex((index+1) % checks.length)} className="cursor-pointer rounded-lg bg-[#183b2d] px-4 py-2 text-sm font-medium text-white hover:bg-[#28533e]">{index === checks.length-1 ? "Replay demo" : "Run next check →"}</button>
        {index === checks.length-1 && <Link className="text-sm underline underline-offset-4" href="/">Open live dashboard →</Link>}
      </div>
    </div>
  </section>;
}
