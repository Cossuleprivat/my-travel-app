'use client';
import { useTransition } from 'react';
import Link from 'next/link';
import { createNote } from '@/lib/actions/wiki';

export function NoteEditor({ note, categories }: {
  note: null;
  categories: { id: string; label: string }[];
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    startTransition(() => createNote(fd));
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="title"
        required
        placeholder="Titel der Notiz *"
        className="w-full rounded-xl bg-bg-surface border border-border-subtle px-4 py-2.5 text-base font-medium text-text-primary focus:outline-none focus:border-accent-blue"
      />
      <select name="category" className="w-full rounded-xl bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary">
        {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <textarea
        name="content"
        rows={14}
        className="w-full rounded-xl bg-bg-surface border border-border-subtle px-4 py-3 text-sm text-text-primary font-mono leading-relaxed focus:outline-none focus:border-accent-blue resize-none"
        placeholder="# Überschrift&#10;## Abschnitt&#10;**fett** *kursiv* `code`&#10;- Listenpunkt&#10;> Zitat&#10;---"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-accent-blue text-white py-2 text-sm font-medium disabled:opacity-50">
          {pending ? 'Erstellen…' : 'Notiz erstellen'}
        </button>
        <Link href="/wiki" className="px-4 py-2 text-sm text-text-muted flex items-center">Abbrechen</Link>
      </div>
      <p className="text-xs text-text-muted text-center">Markdown: # H1 · ## H2 · **fett** · *kursiv* · - Liste · &gt; Zitat · ---</p>
    </form>
  );
}
