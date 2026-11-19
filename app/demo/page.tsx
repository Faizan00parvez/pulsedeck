import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "../../lib/services";
import Replay from "./Replay";

export const metadata: Metadata = { title: "Project demo · PulseDeck" };

export default function DemoPage() {
  return (
    <div className="workspace">
      <h1>Meet PulseDeck</h1>
      <p className="mt-3 max-w-2xl text-lg text-mist-300">
        PulseDeck checks whether my websites are reachable, records how fast they
        respond, and tracks outages from the first failed check through recovery.
        Step through an example with my portfolio site.
      </p>
      <Replay />
      <section className="mt-10">
        <h2>Explore the real projects</h2>
        <ul className="mt-4 border-t border-ink-600">
          {SERVICES.filter(service => service.category === "mine").map(service =>
            <li key={service.slug} className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-600 py-4">
              <div><h3 className="font-semibold">{service.name}</h3><p className="text-sm text-mist-500">{service.description}</p></div>
              <div className="flex gap-5 text-sm underline underline-offset-4">
                <Link href={`/services/${service.slug}`}>View health</Link>
                <a href={service.url}>Open project ↗</a>
              </div>
            </li>
          )}
        </ul>
        <Link className="architecture-link" href="/architecture">See how the pipeline works →</Link>
      </section>
    </div>
  );
}
