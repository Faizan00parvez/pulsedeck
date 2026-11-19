"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  ["/", "Overview"],
  ["/incidents", "Incidents"],
  ["/architecture", "Architecture"],
  ["/demo", "Demo"],
];
export function Nav() {
  const path = usePathname();
  return (
    <header className="mast">
      <div className="mast-inner">
        <Link href="/" className="brand">
          <span aria-hidden="true" className="brand-mark">
            ∿
          </span>
          PulseDeck
        </Link>
        <nav aria-label="Main navigation">
          {pages.map(([href, label]) => (
            <Link
              href={href}
              key={href}
              aria-current={
                path === href || (href === "/" && path.startsWith("/services/"))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
