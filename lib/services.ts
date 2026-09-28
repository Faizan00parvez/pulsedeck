import type { ServiceDef } from "./types";

// The services PulseDeck watches. Three are real sites I built and ship;
// two are stable third-party endpoints that act as controls.
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
    slug: "seenbyai",
    name: "SeenByAI",
    url: "https://seenbyai-one.vercel.app",
    description: "My indie SaaS MVP — AI visibility audits for local businesses.",
    category: "mine",
  },
  {
    slug: "github-api",
    name: "GitHub API",
    url: "https://api.github.com/zen",
    description: "Third-party control endpoint.",
    category: "third-party",
  },
  {
    slug: "google-edge",
    name: "Google Edge",
    url: "https://www.google.com/generate_204",
    description: "Third-party control endpoint.",
    category: "third-party",
  },
];

export const GITHUB_REPO = "Faizan00parvez/pulsedeck";
// The probe workflow pushes fresh state.json to this branch; the site
// fetches it at runtime so the page stays live without rebuilds.
export const DATA_BRANCH = "data";
export const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${DATA_BRANCH}/state.json`;
