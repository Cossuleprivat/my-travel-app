'use client';
import { useRef, useState, useTransition } from 'react';

async function addBook(fd: FormData) {
  'use server';
  const { createServiceClient } = await import('@/lib/supabase/server');
  const { requireUserId } = await import('@/lib/auth/current-user');
  const { revalidatePath } = await import('next/cache');
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_books').insert({
    user_id: userId,
    title: fd.get('title') as string,
    author: fd.get('author') as string || null,
    type: fd.get('type') as string || 'book',
    status: 'planned',
    year: 2026,
    notes: fd.get('notes') as string || null,
  });
  revalidatePath('/reading');
}

export function AddBookForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full rounded-xl border border-dashed border-border-subtle bg-bg-surface py-3 text-sm text-text-muted hover:text-text-secondary transition-colors">
        + Buch / Hörbuch hinzufügen
      </button>
    );
  }

  return (
    <form ref={formRef} action={async (fd) => { await addBook(fd); formRef.current?.reset(); setOpen(false); }} className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
      <p className="text-xs label-mono text-text-muted">Neues Buch / Hörbuch</p>
      <input type="text" name="title" placeholder="Titel *" required className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <div className="grid grid-cols-2 gap-3">
        <input type="text" name="author" placeholder="Autor / Sprecher" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
        <select name="type" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary">
          <option value="book">📖 Buch</option>
          <option value="audiobook">🎧 Hörbuch</option>
        </select>
      </div>
      <input type="text" name="notes" placeholder="Notizen (optional)" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-accent-blue text-white py-2 text-sm font-medium">Hinzufügen</button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-text-muted">Abbrechen</button>
      </div>
    </form>
  );
}
