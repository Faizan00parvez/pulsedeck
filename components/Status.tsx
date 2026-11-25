import Link from "next/link";
import { useNow } from "../lib/data";
import { SERVICES } from "../lib/services";
import {
  formatCadence,
  isUp,
  latencyStats,
  measuredCadenceMs,
  openIncidents,
  timeAgoFrom,
  uptimePct,
} from "../lib/stats";
import type { ProbeState } from "../lib/types";
import { statusColor, statusLabel } from "./StatusDot";
import { UptimeBars } from "./UptimeBars";

function Signal() {
  return (
    <svg className="signal" viewBox="0 0 380 160" aria-hidden="true">
      {Array.from({ length: 23 }, (_, row) => {
        const points = Array.from({ length: 90 }, (_, i) => {
          const x = i * 4.4;
          const y =
            48 +
            row * 3 +
            Math.sin(x / 53 + row / 14) * 30 +
            Math.sin(x / 34 - row / 17) * 15;
          return x + "," + y.toFixed(2);
        }).join(" ");
        return (
          <polyline
            key={row}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="0.1 4.6"
          />
        );
      })}
    </svg>
  );
}

export function StatusBanner({
  state,
  live,
}: {
  state: ProbeState;
  live: boolean;
}) {
  const now = useNow(1000);
  const open = openIncidents(state);
  const cadence = measuredCadenceMs(state);
  return (
    <section className={"health-panel" + (open.length ? " outage" : "")}>
      <div>
        <p className="monitor-label">
          <i />
          {live ? "Live monitoring" : "Monitoring snapshot"}
        </p>
        <h2>
          {open.length
            ? open.length + " ongoing incident" + (open.length > 1 ? "s" : "")
            : "All systems operational"}
        </h2>
        <p className="timing" title={new Date(state.updatedAt).toUTCString()}>
          Checked {timeAgoFrom(state.updatedAt, now)}
           ? Scheduled every 30 min
          {cadence !== null && <> · Recent median gap {formatCadence(cadence)}</>}
        </p>
        <Link href="/incidents">View incident log →</Link>
      </div>
      <Signal />
    </section>
  );
}

export function ServiceGrid({ state }: { state: ProbeState }) {
  return (
    <div className="directory">
      <div className="service-line columns" aria-hidden="true">
        <span>Service / endpoint</span>
        <span>Availability</span>
        <span>Uptime · 30d</span>
        <span>Avg latency</span>
        <span />
      </div>
      {SERVICES.map((service) => {
        const slug = service.slug;
        const uptime = uptimePct(state, slug, 30);
        const latency = latencyStats(state, slug);
        return (
          <Link
            className="service-line service-row"
            key={slug}
            href={`/services/${slug}`}
          >
            <div className="service-name">
              <strong>{service.name}</strong>
              <small>{service.url.replace(/^https?:\/\//, "")}</small>
            </div>
            <div className="availability">
              <UptimeBars state={state} slug={slug} />
              <small className={statusColor(state, slug)}>
                {statusLabel(state, slug)}
              </small>
            </div>
            <span className="reading">
              <b>30d uptime </b>
              {uptime === null ? "—" : uptime.toFixed(2) + "%"}
            </span>
            <span className="reading">
              <b>Avg latency </b>
              {latency === null
                ? "—"
                : isUp(state, slug) === false
                  ? "down"
                  : latency.avg + " ms"}
            </span>
            <span className="row-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        );
      })}
    </div>
  );
}
