import Link from "next/link";
import { Container } from "./Container";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trips", label: "Trips" },
  { href: "/map", label: "Map" },
] as const;

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <Container>
        <nav
          className="flex h-16 items-center justify-between"
          aria-label="App navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Travel Scorer — Home"
          >
            <div className="h-8 w-8 rounded-lg bg-brand-700 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-800 transition-colors">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>
            <span className="font-display text-lg text-stone-900 hidden sm:block">
              Travel Scorer
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side: user avatar placeholder */}
          {/* AUTH BYPASS: user menu will be added when auth is implemented */}
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full bg-brand-700 flex items-center justify-center cursor-default"
              aria-label="User menu (auth not yet implemented)"
              title="Auth coming soon"
            >
              <span className="text-white text-sm font-semibold font-sans">?</span>
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
