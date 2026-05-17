import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';

type CreateTaskParams = {
  title: string;
  area: string;
  priority: string;
  deadline?: string;
  notes?: string;
};

type CreateWikiParams = {
  title: string;
  content: string;
  category: string;
};

type ConfirmBody =
  | { tool: 'create_task';     params: CreateTaskParams }
  | { tool: 'create_wiki_page'; params: CreateWikiParams };

export async function POST(req: NextRequest) {
  const body: ConfirmBody = await req.json();
  const userId = await requireUserId();
  const sb = createServiceClient();

  if (body.tool === 'create_task') {
    const { title, area, priority, deadline, notes } = body.params;

    const { data, error } = await sb
      .from('user_tasks')
      .insert({
        user_id:  userId,
        title,
        area:     area    || 'allgemein',
        priority: priority || 'medium',
        deadline: deadline || null,
        notes:    notes   || null,
        status:   'open',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Task creation error:', error);
      return NextResponse.json({ success: false, message: 'Fehler beim Erstellen der Aufgabe.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id:      data.id,
      message: `Aufgabe "${title}" wurde angelegt. Zu finden unter /tasks.`,
    });
  }

  if (body.tool === 'create_wiki_page') {
    const { title, content, category } = body.params;

    const { data, error } = await sb
      .from('user_notes')
      .insert({
        user_id:  userId,
        title,
        content,
        category: category || 'allgemein',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Wiki creation error:', error);
      return NextResponse.json({ success: false, message: 'Fehler beim Erstellen der Seite.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id:      data.id,
      href:    `/wiki/${data.id}`,
      message: `Wiki-Seite "${title}" wurde erstellt. Zu finden unter /wiki.`,
    });
  }

  return NextResponse.json({ success: false, message: 'Unbekanntes Tool.' }, { status: 400 });
}
