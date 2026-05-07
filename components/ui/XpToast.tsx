'use client';

import React, { useEffect, useState } from 'react';

type ToastEvent = {
  id: string;
  xp: number;
  label?: string;
};

let listeners: Array<(e: ToastEvent) => void> = [];

export function fireXpToast(xp: number, label?: string) {
  const ev: ToastEvent = { id: Math.random().toString(36).slice(2), xp, label };
  listeners.forEach((l) => l(ev));
}

export function XpToastProvider() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const handler = (e: ToastEvent) => {
      setToasts((prev: ToastEvent[]) => [...prev, e]);
      setTimeout(() => setToasts((prev: ToastEvent[]) => prev.filter((t: ToastEvent) => t.id !== e.id)), 3000);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t: ToastEvent) => (
        <div
          key={t.id}
          className="animate-fade-up bg-accent-amber text-bg-base text-sm font-sans rounded-full px-4 py-1.5 shadow-lg"
        >
          +{t.xp} XP {t.label ? `— ${t.label}` : ''}
        </div>
      ))}
    </div>
  );
}
