'use server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { revalidatePath } from 'next/cache';

export async function saveMonth(fd: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const month = parseInt(fd.get('month') as string);
  await sb.from('finance_months').upsert({
    user_id: userId, year: 2026, month,
    kk_saldo_end: parseFloat(fd.get('kk_saldo_end') as string) || null,
    kk_free: parseFloat(fd.get('kk_free') as string) || null,
    giro_saldo: parseFloat(fd.get('giro_saldo') as string) || null,
    salary: parseFloat(fd.get('salary') as string) || null,
    rent_return: parseFloat(fd.get('rent_return') as string) || null,
    notes: fd.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,year,month' });
  revalidatePath('/finance');
}
