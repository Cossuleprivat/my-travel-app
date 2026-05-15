export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  const { endpoint, keys } = await req.json();

  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const sb = createServiceClient();
  await sb
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint, auth_key: keys.auth, p256dh_key: keys.p256dh },
      { onConflict: 'user_id, endpoint' },
    )
    .throwOnError();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await requireUserId();
  const { endpoint } = await req.json();

  const sb = createServiceClient();
  await sb
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  return NextResponse.json({ ok: true });
}
