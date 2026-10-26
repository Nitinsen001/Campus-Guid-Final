"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Compass, Gamepad2 } from "lucide-react";

const smartTrackerAdminUrl = new URL(
  "/admin-panel/login/",
  process.env.NEXT_PUBLIC_SMARTTRACKER_URL || "http://localhost:8000",
).toString();

const campusSolveAiUrl = "https://campus-solve-ai.vercel.app/";
const seatifyUrl = "https://seatify-hk5g.vercel.app/";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/campus?mode=explore", label: "Explore Campus" },
  { href: "/campus?mode=game", label: "Game Mode" },
  { href: "/campus?mode=directory", label: "Directory" },
  { href: "/campus?mode=faculty", label: "Find Faculty" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && !currentMode;
    if (href.includes("mode=")) {
      const targetMode = href.split("mode=")[1];
      return pathname === "/campus" && currentMode === targetMode;
    }
    return pathname === href;
  };

  return (
    <header className="neo-header" role="banner">
      <div className="neo-header-inner">
        <div className="neo-history">
          <button
            className="neo-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
            type="button"
          >
            &lt;
          </button>
          <button
            className="neo-nav-btn"
            onClick={() => router.forward()}
            aria-label="Go forward"
            type="button"
          >
            &gt;
          </button>
        </div>

        <Link href="/" className="neo-logo">
          <span className="neo-logo-dot" aria-hidden="true" />
          <span className="neo-logo-text">Campus Guide 3D</span>
        </Link>

        <nav className="neo-nav" aria-label="Primary">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                isActive(href) ? "neo-nav-link active" : "neo-nav-link"
              }
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <a href={smartTrackerAdminUrl} className="neo-nav-link">
            Admin Panel
          </a>
          <a
            href={campusSolveAiUrl}
            className="neo-nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Campus Solve AI
          </a>
          <a
            href={seatifyUrl}
            className="neo-nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Seatify
          </a>
        </nav>

        <div className="neo-actions">
          <Link
            href="/campus?mode=game"
            className="neo-nav-btn flex items-center gap-1.5"
            aria-label="Game Mode"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Game</span>
          </Link>
          <Link
            href="/campus?mode=explore"
            className="neo-cta flex items-center gap-1.5"
          >
            <Compass className="h-4 w-4" />
            <span>Enter 3D</span>
          </Link>
        </div>

        <button
          className="neo-mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          type="button"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className={mobileOpen ? "neo-mobile-menu open" : "neo-mobile-menu"}>
        <nav aria-label="Mobile">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                isActive(href) ? "neo-nav-link active" : "neo-nav-link"
              }
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <a
            href={smartTrackerAdminUrl}
            className="neo-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Admin Panel
          </a>
          <a
            href={campusSolveAiUrl}
            className="neo-nav-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
          >
            Campus Solve AI
          </a>
          <a
            href={seatifyUrl}
            className="neo-nav-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
          >
            Seatify
          </a>
          <Link
            href="/campus?mode=explore"
            className="neo-cta"
            onClick={() => setMobileOpen(false)}
          >
            Enter Campus 3D
          </Link>
        </nav>
      </div>
    </header>
  );
}
