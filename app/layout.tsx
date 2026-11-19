import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "../components/Nav";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseDeck — live status of everything I ship",
  description:
    "A public uptime dashboard: a scheduled prober checks my production sites around the clock, stores results in git, and files incidents automatically. Built by Faizan Parvez.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ink-600/60 mt-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm text-mist-500">
            <p>
              Built and operated by{" "}
              <a
                href="https://github.com/Faizan00parvez"
                className="text-mist-300 hover:text-mist-100 underline underline-offset-4"
              >
                Faizan Parvez
              </a>{" "}
              — probed around the clock by GitHub Actions.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/Faizan00parvez/pulsedeck"
                className="hover:text-mist-100 underline underline-offset-4"
              >
                Source
              </a>
              <a
                href="/api/status"
                className="hover:text-mist-100 underline underline-offset-4"
              >
                JSON API
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
