import { notFound } from 'next/navigation';
import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { NoteViewer } from '@/components/wiki/NoteViewer';
import { CATEGORIES } from '../page';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const sb = createServiceClient();

  const { data } = await sb
    .from('user_notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!data) notFound();

  return (
    <NoteViewer
      note={data}
      categories={CATEGORIES.slice(1).map((c) => ({ id: c.id, label: c.label }))}
    />
  );
}
