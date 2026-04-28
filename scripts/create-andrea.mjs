// One-shot: creates andrea@travelscorer.local with password Andrea123.
// Idempotent: if the user already exists, just ensures the password + profile.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n')
  .filter((l) => l && !l.startsWith('#'))
  .reduce((acc, l) => { const [k, ...v] = l.split('='); acc[k] = v.join('='); return acc; }, {});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('missing env');

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const email = 'andrea@travelscorer.local';
const password = 'Andrea123';
const displayName = 'Andrea';

// Look for existing user.
const list = await sb.auth.admin.listUsers({ perPage: 200 });
if (list.error) throw list.error;
const existing = list.data.users.find((u) => u.email === email);

let userId;
if (existing) {
  userId = existing.id;
  const upd = await sb.auth.admin.updateUserById(userId, { password, email_confirm: true });
  if (upd.error) throw upd.error;
  console.log('updated existing user', userId);
} else {
  const created = await sb.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error) throw created.error;
  userId = created.data.user.id;
  console.log('created user', userId);
}

// Upsert profile.
const profile = await sb.from('user_profiles').upsert(
  { id: userId, display_name: displayName, travel_interests: [] },
  { onConflict: 'id' },
).select('id, display_name, xp_total, level').single();
if (profile.error) throw profile.error;

console.log('profile:', profile.data);
console.log('\n→ user id:', userId);
console.log('→ login:', email, '/', password);
