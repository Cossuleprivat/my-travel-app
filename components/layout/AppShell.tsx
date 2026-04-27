import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
