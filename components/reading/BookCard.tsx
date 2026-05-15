import { setBookStatus } from '@/lib/actions/reading';

type Book = {
  id: string; title: string; author: string | null; type: string; status: string;
  slot_number: number | null; quarter: string | null; current_page: number | null;
  narrator: string | null; duration_hours: number | null; notes: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  done: 'bg-accent-green/20 border-accent-green/30',
  reading: 'bg-accent-blue/20 border-accent-blue/30',
  planned: 'bg-bg-surface border-border-subtle',
};

const STATUS_LABEL: Record<string, string> = { done: '✅ Fertig', reading: '🔵 Aktiv', planned: '📋 Offen' };

export function BookCard({ book }: { book: Book }) {
  return (
    <form action={setBookStatus.bind(null, book.id, book.status === 'done' ? 'planned' : book.status === 'reading' ? 'done' : 'reading')}>
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${STATUS_COLOR[book.status]}`}>
        {book.slot_number && (
          <span className="w-6 h-6 rounded-full bg-bg-elevated text-text-muted text-xs label-mono flex items-center justify-center shrink-0">{book.slot_number}</span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary font-medium leading-tight">{book.title}</p>
          <p className="text-xs text-text-muted">
            {book.type === 'audiobook'
              ? [book.narrator, book.duration_hours ? `${book.duration_hours}h` : null].filter(Boolean).join(' · ')
              : book.author ?? ''}
            {book.current_page ? ` · Seite ${book.current_page}` : ''}
            {book.quarter ? ` · ${book.quarter}` : ''}
            {book.notes ? ` · ${book.notes}` : ''}
          </p>
        </div>
        <button type="submit" className="text-xs label-mono text-text-muted shrink-0 hover:text-text-primary transition-colors">
          {STATUS_LABEL[book.status]}
        </button>
      </div>
    </form>
  );
}
