import { XpToastProvider } from '@/components/ui/XpToast';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        {children}
      </main>
      <XpToastProvider />
    </div>
  );
}
