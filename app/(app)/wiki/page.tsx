import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { seedWiki } from '@/lib/actions/life-seed';
import { WikiList } from '@/components/wiki/WikiList';

export const CATEGORIES = [
  { id: 'alle',        label: '— Alle' },
  { id: 'zeitlektur',  label: '📅 Zeitlektüren' },
  { id: 'weltgeschichte', label: '🌍 Weltgeschichte' },
  { id: 'literatur',   label: '📖 Literatur' },
  { id: 'kunst',       label: '🎨 Kunst' },
  { id: 'architektur', label: '🏛️ Architektur' },
  { id: 'musik',       label: '🎵 Musik' },
  { id: 'philosophie', label: '🧠 Philosophie' },
  { id: 'allgemein',   label: '📋 Allgemein' },
];

export type Note = {
  id: string;
  title: string;
  category: string;
  content: string;
  lektion_nr: number | null;
  lektion_zeitraum: string | null;
  is_pinned: boolean;
  sort_order: number;
  updated_at: string;
};

export default async function WikiPage() {
  const userId = await requireUserId();
  await seedWiki(userId);

  const sb = createServiceClient();
  const { data } = await sb
    .from('user_notes')
    .select('id, title, category, content, lektion_nr, lektion_zeitraum, is_pinned, sort_order, updated_at')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('lektion_nr', { nullsFirst: false })
    .order('updated_at', { ascending: false });

  const notes = (data ?? []) as Note[];

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs label-mono text-text-muted">← LiveOS</p>
          <h1 className="font-sans text-2xl text-text-primary mt-1">📚 Wissensbase</h1>
        </div>
        <Link
          href="/wiki/new"
          className="mt-2 px-3 py-1.5 rounded-lg bg-accent-blue text-white text-sm font-medium"
        >
          + Neu
        </Link>
      </header>

      <WikiList notes={notes} categories={CATEGORIES} />
    </div>
  );
}
