'use client';

import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer as ArrayBuffer;
}

type State = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

export function PushNotificationToggle() {
  const [state, setState] = useState<State>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription()
    ).then((sub) => {
      setState(sub ? 'subscribed' : 'unsubscribed');
    });
  }, []);

  async function registerSW() {
    return navigator.serviceWorker.register('/sw.js');
  }

  async function subscribe() {
    if (!VAPID_PUBLIC_KEY) {
      alert('NEXT_PUBLIC_VAPID_PUBLIC_KEY ist nicht gesetzt. Siehe README.');
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setState('denied'); return; }

      const reg = await registerSW();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });

      setState('subscribed');
    } catch (e) {
      console.error('Push subscribe failed', e);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('unsubscribed');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'loading') return null;

  if (state === 'unsupported') {
    return (
      <p className="text-text-muted text-xs label-mono">
        Push-Notifications werden in diesem Browser nicht unterstützt.
      </p>
    );
  }

  if (state === 'denied') {
    return (
      <p className="text-text-muted text-xs label-mono">
        Notifications blockiert — erlaube sie in den Browser-Einstellungen.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-primary text-sm">Daily Reminders</p>
        <p className="text-text-muted text-xs mt-0.5">
          {state === 'subscribed' ? 'Tägliche Streak-Erinnerungen aktiv' : 'Nie wieder einen Streak verpassen'}
        </p>
      </div>
      {state === 'subscribed' ? (
        <button
          onClick={unsubscribe}
          disabled={busy}
          className="text-xs label-mono px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50"
        >
          {busy ? '...' : 'Deaktivieren'}
        </button>
      ) : (
        <button
          onClick={subscribe}
          disabled={busy}
          className="text-xs label-mono px-3 py-1.5 rounded-lg border border-accent-blue/40 text-accent-blue hover:bg-accent-blue/10 transition-colors disabled:opacity-50"
        >
          {busy ? '...' : '🔔 Aktivieren'}
        </button>
      )}
    </div>
  );
}
