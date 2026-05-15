import { NoteEditor } from '@/components/wiki/NoteEditor';
import { CATEGORIES } from '../page';

export default function NewNotePage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← Wissensbase</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">Neue Notiz</h1>
      </header>
      <NoteEditor
        note={null}
        categories={CATEGORIES.slice(1).map((c) => ({ id: c.id, label: c.label }))}
      />
    </div>
  );
}
