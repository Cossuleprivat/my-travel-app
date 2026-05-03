import Link from "next/link";
import { Container } from "./Container";

export function PublicNav() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-accent-blue focus:px-4 focus:py-2 focus:text-bg-base focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-surface/95 backdrop-blur-sm">
        <Container>
          <nav
            className="flex h-16 items-center justify-between"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="Travel Scorer — Home"
            >
              <div className="h-8 w-8 rounded-lg bg-accent-blue flex items-center justify-center flex-shrink-0 group-hover:bg-accent-blue/90 transition-colors">
                <span className="font-mono text-bg-base text-sm font-bold" aria-hidden="true">TS</span>
              </div>
              <span className="font-mono uppercase tracking-wider text-sm text-text-primary hidden sm:block">
                Travel Scorer
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-lg border border-border-interactive bg-bg-elevated px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-surface transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-bg-base hover:bg-accent-blue/90 transition-colors"
              >
                Registrieren
              </Link>
            </div>
          </nav>
        </Container>
      </header>
    </>
  );
}
