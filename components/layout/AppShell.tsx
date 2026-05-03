import Link from 'next/link';
import { BottomNav } from './BottomNav';
import { SidebarNav } from './SidebarNav';
import { AppBackground } from './AppBackground';
import { SignOutButton } from '@/components/auth/SignOutButton';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-text-primary">
      <AppBackground />
      {/* Desktop sidebar */}
      <SidebarNav />

      {/* Mobile top header */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-border-subtle bg-bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 w-full max-w-2xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="Travel Scorer — Dashboard">
            <div className="h-6 w-6 rounded-md bg-accent-blue flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-bg-base" aria-hidden="true">TS</span>
            </div>
            <span className="font-mono uppercase tracking-wider text-xs text-text-secondary hidden sm:block">
              Travel Scorer
            </span>
          </Link>
          <SignOutButton compact />
        </div>
      </header>

      {/* Content — offset by sidebar on desktop */}
      <main className="relative z-10 lg:pl-16 mx-auto w-full max-w-4xl px-4 pb-24 pt-4 lg:pb-8 lg:pt-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
