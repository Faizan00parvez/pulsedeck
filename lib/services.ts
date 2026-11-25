import type { ServiceDef } from "./types";

// Public projects checked by the scheduled prober.
export const SERVICES: ServiceDef[] = [
  {
    slug: "portfolio",
    name: "Portfolio",
    url: "https://faizanxbuilds.github.io",
    description: "My DevOps & cloud portfolio site.",
    category: "mine",
  },
  {
    slug: "greet",
    name: "GREET Teacher Training College",
    url: "https://greetteachertrainingcollege.in",
    description: "Production college website I built and maintain.",
    category: "mine",
  },
  {
    slug: "deploywatch",
    name: "DeployWatch",
    url: "https://faizanxbuilds.github.io/DeployWatch/",
    description: "My live Kubernetes deployment watcher — Flask, Docker, Helm, ArgoCD.",
    category: "mine",
  },
  {
    slug: "slip-025",
    name: "Slip 025",
    url: "https://checkout-incident-lab.vercel.app/",
    description: "Trace a slow checkout through shipping.",
    category: "mine",
  },
  {
    slug: "holdpoint",
    name: "Holdpoint",
    url: "https://faizan00parvez.github.io/holdpoint/",
    description: "Replay a canary rollout and inspect its stop decision.",
    category: "mine",
  },
];

export const GITHUB_REPO = "Faizan00parvez/pulsedeck";
// The probe workflow pushes fresh state.json to this branch; the site
// fetches it at runtime so the page stays live without rebuilds.
export const DATA_BRANCH = "data";
export const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${DATA_BRANCH}/state.json`;
