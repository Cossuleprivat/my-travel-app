import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServiceClient } from '@/lib/supabase/server';

// Configure VAPID — keys must be set in .env.local:
//   VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_MAILTO=mailto:you@example.com
//
// Generate keys once: npx web-push generate-vapid-keys
webpush.setVapidDetails(
  process.env.VAPID_MAILTO ?? 'mailto:admin@liveos.app',
  process.env.VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? '',
);

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function POST(req: NextRequest) {
  // Internal endpoint — protect with a shared secret in production
  const secret = req.headers.get('x-push-secret');
  if (secret !== process.env.PUSH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, payload }: { userId?: string; payload: PushPayload } = await req.json();

  const sb = createServiceClient();
  const query = sb.from('push_subscriptions').select('endpoint, auth_key, p256dh_key');
  if (userId) query.eq('user_id', userId);

  const { data: subs } = await query;
  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { auth: sub.auth_key, p256dh: sub.p256dh_key } },
        JSON.stringify(payload),
      ),
    ),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  return NextResponse.json({ sent, total: subs.length });
}
