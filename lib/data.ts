"use client";

import { useEffect, useState } from "react";
import { DATA_URL } from "./services";
import type { ProbeState } from "./types";
import snapshot from "../data/state.json";

/**
 * Loads probe state. The page ships with a bundled snapshot (so it renders
 * instantly and works offline), then swaps in the live state from the `data`
 * branch — which the probe workflow refreshes every 30 minutes.
 */
export function useProbeState(): { state: ProbeState; live: boolean } {
  const [state, setState] = useState<ProbeState>(snapshot as ProbeState);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        if (!cancelled && json && json.version === 1 && json.services) {
          setState(json as ProbeState);
          setLive(true);
        }
      })
      .catch(() => {
        /* keep the bundled snapshot */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { state, live };
}
