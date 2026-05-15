import { BottomNav } from './BottomNav';
import { XpToastProvider } from '@/components/ui/XpToast';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
      <XpToastProvider />
      <InstallPrompt />
      <ServiceWorkerRegistrar />
    </div>
  );
}
