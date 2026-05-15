'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const isIosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    const stored = sessionStorage.getItem('pwa-prompt-dismissed');
    if (stored) setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-prompt-dismissed', '1');
  };

  if (installed || dismissed) return null;
  if (!prompt && !isIos) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl bg-bg-surface border border-border-subtle shadow-xl p-4 flex items-start gap-3">
      <div className="text-2xl shrink-0">✈</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">Install LiveOS</p>
        {isIos ? (
          <p className="text-xs text-text-muted mt-0.5">
            Tap <span className="font-mono">Share</span> then <span className="font-mono">Add to Home Screen</span>
          </p>
        ) : (
          <p className="text-xs text-text-muted mt-0.5">Add to your home screen for the full experience</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0 items-center">
        {!isIos && (
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-medium"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="px-2 py-1.5 text-text-muted text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
