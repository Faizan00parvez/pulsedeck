"use client";

import type { Sample } from "../lib/types";

function path(samples: Sample[], w: number, h: number): string {
  const ok = samples.filter((s) => s.ok && s.ms >= 0);
  if (ok.length < 2) return "";
  const max = Math.max(...ok.map((s) => s.ms)) * 1.15 || 1;
  const step = w / (ok.length - 1);
  return ok
    .map((s, i) => {
      const x = (i * step).toFixed(1);
      const y = (h - (s.ms / max) * (h - 6) - 3).toFixed(1);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

/** Hand-rolled SVG latency sparkline — no chart dependency needed. */
export function LatencySpark({
  samples,
  width = 560,
  height = 120,
}: {
  samples: Sample[];
  width?: number;
  height?: number;
}) {
  const ok = samples.filter((s) => s.ok && s.ms >= 0);
  if (ok.length < 2) {
    return (
      <p className="text-sm text-mist-500 py-8 text-center">
        Not enough latency data yet — check back after a few probe runs.
      </p>
    );
  }
  const max = Math.max(...ok.map((s) => s.ms));
  const d = path(samples, width, height);
  const last = ok[ok.length - 1];
  const lx = width;
  const ly = height - (last.ms / (max * 1.15 || 1)) * (height - 6) - 3;
  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-32 w-full"
        role="img"
        aria-label="Latency over recent checks"
      >
        {[0.25, 0.5, 0.75].map((level) => (
          <line
            key={level}
            x1="0"
            x2={width}
            y1={height * level}
            y2={height * level}
            stroke="#d8dfd4"
            strokeDasharray="3 5"
          />
        ))}
        <path
          d={d}
          fill="none"
          stroke="#287146"
          vectorEffect="non-scaling-stroke"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={lx - 2} cy={ly} r="3.5" fill="#287146" />
      </svg>
      <div className="flex justify-between text-xs text-mist-500 mt-1 font-mono">
        <span>max {Math.round(max)} ms</span>
        <span>latest {Math.round(last.ms)} ms</span>
      </div>
    </div>
  );
}
