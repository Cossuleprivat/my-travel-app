import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { seedFinance } from '@/lib/actions/life-seed';
import { MonthForm } from '@/components/finance/MonthForm';

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const FIXKOSTEN = 2285;
const NETTO = 2750;
const KK_LIMIT = 6000;
const KK_MIN_FREE = 1500;
const GIRO_MIN = 1000;

async function getFinanceData(userId: string) {
  const sb = createServiceClient();
  const [{ data: months }, { data: expenses }] = await Promise.all([
    sb.from('finance_months').select('*').eq('user_id', userId).eq('year', 2026).order('month'),
    sb.from('finance_special_expenses').select('*').eq('user_id', userId).eq('year', 2026).order('sort_order'),
  ]);
  return { months: months ?? [], expenses: expenses ?? [] };
}

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return `${n >= 0 ? '' : ''}${n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
}

function statusDot(value: number, min: number) {
  return value >= min ? '🟢' : value >= min * 0.8 ? '🟡' : '🔴';
}

export default async function FinancePage() {
  const userId = await requireUserId();
  await seedFinance(userId);
  const { months, expenses } = await getFinanceData(userId);

  const latest = months[months.length - 1];
  const openExpenses = expenses.filter((e) => e.status === 'open');
  const openTotal = openExpenses.reduce((a, e) => a + Number(e.amount_eur ?? 0), 0);
  const paidExpenses = expenses.filter((e) => e.status === 'paid');

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← LiveOS</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">💰 Finanzen 2026</h1>
      </header>

      {/* Schnellübersicht */}
      {latest && (
        <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
          <p className="text-xs label-mono text-text-muted">Aktueller Stand (Monat {MONTHS[latest.month - 1]})</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-bg-elevated px-3 py-2.5">
              <p className="text-xs text-text-muted">KK-Saldo</p>
              <p className="text-lg font-sans text-text-primary">{fmt(latest.kk_saldo_end)}</p>
              <p className="text-xs text-text-muted">{latest.kk_free != null ? `${fmt(latest.kk_free)} frei` : ''} {latest.kk_free != null ? statusDot(Number(latest.kk_free), KK_MIN_FREE) : ''}</p>
            </div>
            <div className="rounded-lg bg-bg-elevated px-3 py-2.5">
              <p className="text-xs text-text-muted">Girokonto</p>
              <p className="text-lg font-sans text-text-primary">{fmt(latest.giro_saldo)}</p>
              <p className="text-xs text-text-muted">Min. {fmt(GIRO_MIN)} {latest.giro_saldo != null ? statusDot(Number(latest.giro_saldo), GIRO_MIN) : ''}</p>
            </div>
          </div>
          <div className="rounded-lg bg-bg-elevated px-3 py-2.5 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Netto-Gehalt</span>
              <span className="text-text-primary">{fmt(NETTO)}/Mo.</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Fixkosten</span>
              <span className="text-text-primary">~{fmt(FIXKOSTEN)}/Mo.</span>
            </div>
            <div className="flex justify-between text-xs border-t border-border-subtle pt-1">
              <span className="text-text-muted">Frei verfügbar</span>
              <span className="text-accent-green font-medium">~465–865 €/Mo.</span>
            </div>
          </div>
          <div className="rounded-lg bg-bg-elevated px-3 py-2 text-xs text-text-muted">
            <span className="font-medium text-text-secondary">2 Eiserne Regeln:</span>
            {' '}Girokonto ≥ 1.000 € · KK-Puffer ≥ 1.500 € frei
          </div>
        </div>
      )}

      {/* KK Tilgungsplan */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-2">
        <p className="text-xs label-mono text-text-muted">Schulden-Tilgungsplan</p>
        {[
          { title: 'Easybank KK-Saldo', current: '-2.492 €', rate: '1.000 €/Mo.', done: '~Okt 2026', priority: true },
          { title: 'Consorsbank', current: '-1.775 €', rate: '47,50 €/Mo.', done: '~Mitte 2029' },
          { title: 'Easybank Ratenkredit', current: '-19.256 €', rate: '238,30 €/Mo.', done: '~Dez 2031' },
        ].map((d) => (
          <div key={d.title} className={`rounded-lg px-3 py-2 flex items-center gap-3 ${d.priority ? 'bg-accent-blue/10 border border-accent-blue/20' : 'bg-bg-elevated'}`}>
            <div className="flex-1">
              <p className="text-sm text-text-primary">{d.title}</p>
              <p className="text-xs text-text-muted">{d.rate} · Getilgt {d.done}</p>
            </div>
            <p className="text-sm font-medium text-text-primary shrink-0">{d.current}</p>
          </div>
        ))}
      </div>

      {/* Monthly log */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Monats-Tracking 2026</h2>
        <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-3 py-2 label-mono text-text-muted font-normal">Monat</th>
                  <th className="text-right px-3 py-2 label-mono text-text-muted font-normal">KK-Saldo</th>
                  <th className="text-right px-3 py-2 label-mono text-text-muted font-normal">KK-Frei</th>
                  <th className="text-right px-3 py-2 label-mono text-text-muted font-normal">Giro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {Array.from({ length: 9 }, (_, i) => i + 4).map((m) => {
                  const entry = months.find((mo) => mo.month === m);
                  return (
                    <tr key={m} className={entry ? '' : 'opacity-40'}>
                      <td className="px-3 py-2 label-mono">{MONTHS[m - 1]} 26</td>
                      <td className="px-3 py-2 text-right text-text-primary">{fmt(entry?.kk_saldo_end)}</td>
                      <td className="px-3 py-2 text-right text-text-muted">{fmt(entry?.kk_free)}</td>
                      <td className="px-3 py-2 text-right text-text-muted">{fmt(entry?.giro_saldo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <MonthForm existingMonths={months.map((m) => m.month)} />
      </section>

      {/* Sonderausgaben */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs label-mono text-text-muted">Geplante Sonderausgaben</h2>
          <p className="text-xs label-mono text-text-muted">Gesamt offen: ~{openTotal.toLocaleString('de-DE')} €</p>
        </div>
        <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
          {expenses.map((e) => (
            <div key={e.id} className={`flex items-center gap-3 px-4 py-2.5 ${e.status === 'postponed' ? 'opacity-40' : ''}`}>
              <span className="text-base shrink-0">{e.status === 'paid' ? '✅' : e.status === 'postponed' ? '⏸' : '🔴'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{e.title}</p>
                {e.planned_date && <p className="text-xs text-text-muted">{new Date(e.planned_date).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}</p>}
              </div>
              <p className="text-sm font-medium text-text-primary shrink-0">~{Number(e.amount_eur).toLocaleString('de-DE')} €</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
