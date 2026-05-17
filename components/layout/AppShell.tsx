'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { XpToastProvider } from '@/components/ui/XpToast';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <TopBar onMenuOpen={() => setSidebarOpen(true)} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-10">
        {children}
      </main>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <XpToastProvider />
      <InstallPrompt />
      <ServiceWorkerRegistrar />
    </div>
  );
}
