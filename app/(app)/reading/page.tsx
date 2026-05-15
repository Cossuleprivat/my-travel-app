import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { seedBooks } from '@/lib/actions/life-seed';
import { BookCard } from '@/components/reading/BookCard';
import { AddBookForm } from '@/components/reading/AddBookForm';

async function getBooks(userId: string) {
  const sb = createServiceClient();
  const { data } = await sb.from('user_books').select('*').eq('user_id', userId).order('slot_number', { nullsFirst: false }).order('created_at');
  return data ?? [];
}

export default async function ReadingPage() {
  const userId = await requireUserId();
  await seedBooks(userId);
  const books = await getBooks(userId);

  const booksOnly = books.filter((b) => b.type === 'book');
  const audiobooks = books.filter((b) => b.type === 'audiobook');
  const bDone = booksOnly.filter((b) => b.status === 'done').length;
  const aDone = audiobooks.filter((b) => b.status === 'done').length;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← LiveOS</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">📚 Lesen & Hörbücher 2026</h1>
      </header>

      {/* Progress */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle px-4 py-3 flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-sans text-accent-blue">{bDone}<span className="text-text-muted text-base">/5</span></p>
          <p className="text-xs label-mono text-text-muted">Bücher</p>
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full rounded-full bg-accent-blue" style={{ width: `${(bDone / 5) * 100}%` }} />
          </div>
          <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full rounded-full bg-accent-purple" style={{ width: `${(aDone / 5) * 100}%` }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-sans text-accent-purple">{aDone}<span className="text-text-muted text-base">/5</span></p>
          <p className="text-xs label-mono text-text-muted">Hörbücher</p>
        </div>
      </div>

      {/* Books */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Bücher 2026</h2>
        <div className="space-y-2">
          {booksOnly.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>

      {/* Audiobooks */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Hörbücher 2026</h2>
        <div className="space-y-2">
          {audiobooks.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>

      {/* Add */}
      <AddBookForm />

      {/* Buchideen-Pool */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Buchideen-Pool (Slot 5)</h2>
        <div className="rounded-xl bg-bg-surface border border-border-subtle px-4 py-3">
          {['Atomic Habits', 'Deep Work', 'Sapiens', '48 Laws of Power', 'Rich Dad Poor Dad', 'The Pragmatic Programmer', 'Zero to One'].map((t) => (
            <p key={t} className="text-sm text-text-muted py-0.5">· {t}</p>
          ))}
        </div>
      </section>

      {/* Routine */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Routine</h2>
        <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle overflow-hidden">
          {[['Täglich abends', '20–30 Seiten lesen', '20–30 min'], ['Pendeln / Gassi', 'Hörbuch', 'variabel'], ['So', 'Lese-Block', '30–60 min']].map(([w, a, d]) => (
            <div key={w} className="flex items-center gap-3 px-4 py-2.5">
              <p className="text-xs label-mono text-accent-blue w-24 shrink-0">{w}</p>
              <p className="text-sm text-text-primary flex-1">{a}</p>
              <p className="text-xs label-mono text-text-muted shrink-0">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
