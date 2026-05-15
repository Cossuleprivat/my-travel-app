'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateNote, deleteNote, togglePin } from '@/lib/actions/wiki';
import { renderMarkdown } from '@/lib/wiki/markdown';

type Note = {
  id: string;
  title: string;
  category: string;
  content: string;
  lektion_nr: number | null;
  lektion_zeitraum: string | null;
  is_pinned: boolean;
  updated_at: string;
};

export function NoteViewer({ note, categories }: { note: Note; categories: { id: string; label: string }[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleUpdate(fd: FormData) {
    startTransition(async () => {
      await updateNote(note.id, fd);
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`"${note.title}" löschen?`)) return;
    startTransition(() => deleteNote(note.id));
  }

  function handlePin() {
    startTransition(() => togglePin(note.id, note.is_pinned));
  }

  const rendered = renderMarkdown(note.content);

  if (editing) {
    return (
      <div className="space-y-4">
        <header className="flex items-center gap-3">
          <Link href="/wiki" className="text-text-muted text-sm">← zurück</Link>
        </header>
        <form action={handleUpdate} className="space-y-3">
          <input
            type="text"
            name="title"
            defaultValue={note.title}
            required
            className="w-full rounded-xl bg-bg-surface border border-border-subtle px-4 py-2.5 text-base font-medium text-text-primary focus:outline-none focus:border-accent-blue"
          />
          <select name="category" defaultValue={note.category} className="w-full rounded-xl bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <textarea
            name="content"
            defaultValue={note.content}
            rows={20}
            className="w-full rounded-xl bg-bg-surface border border-border-subtle px-4 py-3 text-sm text-text-primary font-mono leading-relaxed focus:outline-none focus:border-accent-blue resize-none"
            placeholder="# Überschrift&#10;## Abschnitt&#10;**fett** *kursiv*&#10;- Listenpunkt&#10;> Zitat"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-accent-blue text-white py-2 text-sm font-medium disabled:opacity-50">
              {pending ? 'Speichern…' : 'Speichern'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-text-muted">Abbrechen</button>
          </div>
        </form>
        <p className="text-xs text-text-muted text-center">Markdown: # H1 · ## H2 · **fett** · *kursiv* · - Liste · &gt; Zitat · ---</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <Link href="/wiki" className="text-xs label-mono text-text-muted">← Wissensbase</Link>
        <div className="flex items-start justify-between mt-2 gap-3">
          <h1 className="font-sans text-xl text-text-primary leading-tight">{note.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handlePin} disabled={pending} className={`text-lg ${note.is_pinned ? 'opacity-100' : 'opacity-30'}`} title={note.is_pinned ? 'Anpinnen aufheben' : 'Anpinnen'}>
              📌
            </button>
            <button onClick={() => setEditing(true)} className="px-3 py-1 rounded-lg bg-bg-surface border border-border-subtle text-xs text-text-muted hover:text-text-primary transition-colors">
              Bearbeiten
            </button>
          </div>
        </div>
        {note.lektion_zeitraum && (
          <p className="text-xs text-accent-blue mt-1">{note.lektion_zeitraum}</p>
        )}
        <p className="text-xs text-text-muted mt-1">
          Zuletzt bearbeitet: {new Date(note.updated_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </header>

      <div
        className="rounded-xl bg-bg-surface border border-border-subtle p-4 prose-wiki"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />

      <button
        onClick={handleDelete}
        disabled={pending}
        className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
      >
        Notiz löschen
      </button>
    </div>
  );
}
