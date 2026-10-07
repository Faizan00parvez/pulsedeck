import { useNow } from "../lib/data";
import { DATA_URL, GITHUB_REPO } from "../lib/services";
import { historyDays, recentProbeTimes, totalChecks } from "../lib/stats";
import type { ProbeState } from "../lib/types";

const REPO_URL = `https://github.com/${GITHUB_REPO}`;

/**
 * "Don't take my word for it": the on-page audit trail. Every probe lands
 * as a git commit on the data branch and a workflow run with logs — this
 * section renders the recent probe timestamps from the live data and links
 * straight to all three proof surfaces.
 */
export function ProofSection({ state }: { state: ProbeState }) {
  const now = useNow(30000);
  const probes = recentProbeTimes(state, 8);
  const checks = totalChecks(state);
  const days = historyDays(state, now);

  const links = [
    {
      label: "Workflow runs",
      desc: "every probe execution, with logs",
      href: `${REPO_URL}/actions/workflows/probe.yml`,
    },
    {
      label: "Probe commits",
      desc: "append-only git log of probe results",
      href: `${REPO_URL}/commits/data`,
    },
    {
      label: "Raw probe data",
      desc: "the state.json this page renders",
      href: DATA_URL,
    },
  ];

  return (
    <section className="rounded-2xl border border-ink-600/70 bg-ink-900 p-6">
      <h2 className="text-lg font-semibold">Don&apos;t take my word for it</h2>
      <p className="text-mist-300 text-[15px] mt-2 leading-relaxed">
        {checks > 0 ? (
          <>
            <span className="text-mist-100 font-medium">{checks} checks</span> recorded over{" "}
            <span className="text-mist-100 font-medium">{days} day{days === 1 ? "" : "s"}</span>.
            The last few probe times, straight from the data this page renders:
          </>
        ) : (
          "Probe timestamps will appear here once the first scheduled run lands."
        )}
      </p>

      {probes.length > 0 && (
        <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[13px] text-mist-400">
          {probes.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              {new Date(t).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="rounded-lg border border-ink-600 px-4 py-2 text-sm font-semibold text-mist-100 hover:bg-ink-800"
            title={l.desc}
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </section>
  );
}
