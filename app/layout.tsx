import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = "https://faizanxbuilds-status.vercel.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const OG_TITLE = "PulseDeck — live status of everything I ship";
const OG_DESCRIPTION =
  "A public uptime dashboard: a scheduled prober checks my production sites every 30 minutes, stores results in git, and files incidents automatically. Built by Faizan Parvez.";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESCRIPTION,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: "PulseDeck",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "PulseDeck status dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

function Nav() {
  return (
    <header className="border-b border-ink-600/60 bg-ink-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="dot-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="font-semibold tracking-tight">PulseDeck</span>
        </Link>
        <nav className="flex items-center gap-0.5 text-[13px] sm:text-sm sm:gap-1 text-mist-300">
          <Link href="/" className="px-2 sm:px-3 py-1.5 rounded-md hover:bg-ink-700 hover:text-mist-100 whitespace-nowrap">Status</Link>
          <Link href="/incidents" className="px-2 sm:px-3 py-1.5 rounded-md hover:bg-ink-700 hover:text-mist-100 whitespace-nowrap">Incidents</Link>
          <Link href="/architecture" className="px-2 sm:px-3 py-1.5 rounded-md hover:bg-ink-700 hover:text-mist-100 whitespace-nowrap">How it works</Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ink-600/60 mt-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm text-mist-500">
            <p>
              Built and operated by{" "}
              <a href="https://github.com/Faizan00parvez" className="text-mist-300 hover:text-mist-100 underline underline-offset-4">
                Faizan Parvez
              </a>{" "}
              — probed every 30 min by GitHub Actions.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/Faizan00parvez/pulsedeck" className="hover:text-mist-100 underline underline-offset-4">Source</a>
              <a href="/api/status" className="hover:text-mist-100 underline underline-offset-4">JSON API</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
