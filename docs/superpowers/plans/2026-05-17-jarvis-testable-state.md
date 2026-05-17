# Jarvis Testable-State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Jarvis to a state where it can be tested daily on Vercel production — consistent routing, a single dashboard-hub with live module data, a Jarvis chat that knows real numbers, all verified and deployed.

**Architecture:** Fix the entry redirect to `/dashboard`, delete the navigation-less `(hub)` route group after extracting its live-stats logic into a reusable, unit-tested pure function. Add a Jarvis live-context builder (pure formatter + thin DB wrapper). Verify with typecheck/build/tests/smoke, then merge to `main` so Vercel auto-deploys.

**Tech Stack:** Next.js 15 (App Router, server components), TypeScript, Supabase (service client), Vitest (`environment: node`, tests in `lib/**/*.test.ts`), Tailwind CSS, OpenRouter (SSE streaming).

**Working context:** Git worktree on branch `claude/zealous-bell-2416c4`. Spec: `docs/superpowers/specs/2026-05-17-jarvis-testable-state-design.md`.

**Test approach:** The codebase unit-tests pure logic only (see `lib/xp.test.ts`); DB/IO is verified via build + smoke test. This plan follows that pattern: extract pure functions (TDD-tested), keep DB wrappers thin (build/smoke-verified).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `middleware.ts` | Entry redirect target | Modify (1 line) |
| `lib/dashboard/module-stats.ts` | Pure `computeModuleStats` + DB wrapper `getModuleStats` | Create |
| `lib/dashboard/module-stats.test.ts` | Unit tests for `computeModuleStats` | Create |
| `app/(app)/dashboard/page.tsx` | Hub composition: greeting, Heute section, live module grid | Modify |
| `app/(hub)/hub/page.tsx` | (old navigation-less hub) | Delete |
| `app/(hub)/layout.tsx` | (old hub layout) | Delete |
| `lib/jarvis/context.ts` | Pure `formatJarvisContext` + DB wrapper `gatherJarvisContext` | Create |
| `lib/jarvis/context.test.ts` | Unit tests for `formatJarvisContext` | Create |
| `app/api/jarvis/route.ts` | Inject live context into system prompt | Modify |
| `STATUS.md` | Reflect real state | Modify |

---

## Task 1: Fix entry redirect to /dashboard

**Files:**
- Modify: `middleware.ts:9`

- [ ] **Step 1: Change redirect target**

In `middleware.ts`, the block currently reads:

```ts
  // Auth routes and root → redirect to hub (no login needed)
  if (path === '/' || path === '/auth/login' || path === '/auth/signup') {
    const url = req.nextUrl.clone();
    url.pathname = '/hub';
    url.search = '';
    return NextResponse.redirect(url);
  }
```

Change `url.pathname = '/hub';` to `url.pathname = '/dashboard';` and update the comment:

```ts
  // Auth routes and root → redirect to dashboard (no login needed)
  if (path === '/' || path === '/auth/login' || path === '/auth/signup') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "fix(routing): redirect entry to /dashboard instead of /hub"
```

---

## Task 2: Extract live module stats into a tested pure function

The old hub computes per-module headline/subline strings from raw Supabase rows (`app/(hub)/hub/page.tsx` lines ~81–165). We extract the pure computation (testable) from the DB fetch (thin wrapper).

**Files:**
- Create: `lib/dashboard/module-stats.ts`
- Test: `lib/dashboard/module-stats.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/dashboard/module-stats.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeModuleStats, type ModuleStatsInput } from './module-stats';

const FIXED_NOW = new Date('2026-05-17T12:00:00Z');

const baseInput: ModuleStatsInput = {
  runLogs: [{ distance_km: 100 }, { distance_km: 27.4 }],
  games: [{ status: 'completed' }, { status: 'active' }, { status: 'pipeline' }],
  books: [
    { status: 'done', type: 'book' },
    { status: 'reading', type: 'book' },
    { status: 'done', type: 'audiobook' },
  ],
  financeMonths: [
    { kk_saldo_end: -2000, kk_free: 100 },
    { kk_saldo_end: -1240, kk_free: 380 },
  ],
  weddingTasks: [{ status: 'done' }, { status: 'open' }, { status: 'open' }],
  goals: [
    { status: 'done', xp_reward: 50 },
    { status: 'open', xp_reward: 100 },
  ],
  tasks: [{ status: 'open' }, { status: 'open' }, { status: 'done' }],
  wikiNotes: [
    { category: 'zeitlektur', lektion_nr: 1 },
    { category: 'literatur', lektion_nr: null },
  ],
};

describe('computeModuleStats', () => {
  it('sums run distance and counts days to half marathon', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.sport?.headline).toBe('127.4 km gelaufen');
    // 2026-10-25 minus 2026-05-17 = 161 days
    expect(r.sport?.subline).toBe('161d bis Halbmarathon · Ziel: 500 km');
  });

  it('counts completed games out of total', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.gaming?.headline).toBe('1/3 Spiele fertig');
  });

  it('counts done books and audiobooks separately', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.reading?.headline).toBe('1/6 Bücher · 1/6 Hörbücher');
  });

  it('uses the latest finance month', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.finance?.headline).toContain('-1.240');
    expect(r.finance?.subline).toContain('380');
  });

  it('falls back when no finance month exists', () => {
    const r = computeModuleStats({ ...baseInput, financeMonths: [] }, FIXED_NOW);
    expect(r.finance?.headline).toBe('Noch kein Snapshot');
  });

  it('counts wedding tasks and days to Standesamt', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.wedding?.headline).toBe('1/3 Tasks erledigt');
    // 2026-10-10 minus 2026-05-17 = 146 days
    expect(r.wedding?.subline).toBe('Standesamt in 146 Tagen');
  });

  it('sums goal XP done vs total', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.goals?.headline).toBe('50 / 150 XP');
    expect(r.goals?.subline).toBe('1/2 Ziele erreicht');
  });

  it('counts open vs done tasks', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.tasks?.headline).toBe('2 offen');
    expect(r.tasks?.subline).toBe('1/3 erledigt');
  });

  it('counts wiki notes and zeitlektüren', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.wiki?.headline).toBe('2 Notizen');
    expect(r.wiki?.subline).toBe('1 Zeitlektüren · L1–L17');
  });

  it('handles all-empty input without throwing', () => {
    const empty: ModuleStatsInput = {
      runLogs: [], games: [], books: [], financeMonths: [],
      weddingTasks: [], goals: [], tasks: [], wikiNotes: [],
    };
    const r = computeModuleStats(empty, FIXED_NOW);
    expect(r.sport?.headline).toBe('0.0 km gelaufen');
    expect(r.gaming?.headline).toBe('0/0 Spiele fertig');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- module-stats`
Expected: FAIL — `Cannot find module './module-stats'`.

- [ ] **Step 3: Write the implementation**

Create `lib/dashboard/module-stats.ts`:

```ts
import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

export type ModuleStat = { headline: string; subline: string } | null;
export type ModuleStatsResult = Record<string, ModuleStat>;

export type ModuleStatsInput = {
  runLogs: { distance_km: number | string | null }[];
  games: { status: string }[];
  books: { status: string; type: string }[];
  financeMonths: { kk_saldo_end: number | string | null; kk_free: number | string | null }[];
  weddingTasks: { status: string }[];
  goals: { status: string; xp_reward: number }[];
  tasks: { status: string }[];
  wikiNotes: { category: string; lektion_nr: number | null }[];
};

const HM_DATE = '2026-10-25';
const STANDESAMT_DATE = '2026-10-10';

function daysBetween(target: string, now: Date): number {
  return Math.ceil((new Date(target).getTime() - now.getTime()) / 86400000);
}

export function computeModuleStats(input: ModuleStatsInput, now: Date): ModuleStatsResult {
  const totalKm = input.runLogs.reduce((s, r) => s + Number(r.distance_km ?? 0), 0);
  const daysToHM = daysBetween(HM_DATE, now);

  const gamesCompleted = input.games.filter((g) => g.status === 'completed').length;
  const gamesTotal = input.games.length;

  const booksDone = input.books.filter((b) => b.type === 'book' && b.status === 'done').length;
  const audioDone = input.books.filter((b) => b.type === 'audiobook' && b.status === 'done').length;

  const latestMonth = input.financeMonths.at(-1);

  const wDone = input.weddingTasks.filter((t) => t.status === 'done').length;
  const wTotal = input.weddingTasks.length;
  const daysToStandesamt = daysBetween(STANDESAMT_DATE, now);

  const totalXP = input.goals.reduce((s, g) => s + g.xp_reward, 0);
  const doneXP = input.goals.filter((g) => g.status === 'done').reduce((s, g) => s + g.xp_reward, 0);
  const goalsDone = input.goals.filter((g) => g.status === 'done').length;

  const tasksRemaining = input.tasks.filter((t) => t.status !== 'done').length;
  const tasksDone = input.tasks.filter((t) => t.status === 'done').length;

  const zeitlekturen = input.wikiNotes.filter((n) => n.category === 'zeitlektur').length;
  const wikiTotal = input.wikiNotes.length;

  return {
    sport: {
      headline: `${totalKm.toFixed(1)} km gelaufen`,
      subline: `${daysToHM}d bis Halbmarathon · Ziel: 500 km`,
    },
    gaming: {
      headline: `${gamesCompleted}/${gamesTotal} Spiele fertig`,
      subline: '10-Slot Backlog · Jahresplan 2026',
    },
    reading: {
      headline: `${booksDone}/6 Bücher · ${audioDone}/6 Hörbücher`,
      subline: 'Leseplan 2026',
    },
    finance: latestMonth
      ? {
          headline: `KK ${Number(latestMonth.kk_saldo_end ?? 0).toLocaleString('de-DE')} €`,
          subline: `${Number(latestMonth.kk_free ?? 0).toLocaleString('de-DE')} € frei · Tilgungsplan aktiv`,
        }
      : {
          headline: 'Noch kein Snapshot',
          subline: 'Ersten Monatseintrag erstellen',
        },
    wedding: {
      headline: `${wDone}/${wTotal} Tasks erledigt`,
      subline: `Standesamt in ${daysToStandesamt} Tagen`,
    },
    goals: {
      headline: `${doneXP} / ${totalXP} XP`,
      subline: `${goalsDone}/${input.goals.length} Ziele erreicht`,
    },
    tasks: {
      headline: `${tasksRemaining} offen`,
      subline: `${tasksDone}/${input.tasks.length} erledigt`,
    },
    wiki: {
      headline: `${wikiTotal} Notizen`,
      subline: `${zeitlekturen} Zeitlektüren · L1–L17`,
    },
  };
}

export async function getModuleStats(userId: string): Promise<ModuleStatsResult> {
  const sb = createServiceClient();

  const [
    { data: runLogs },
    { data: games },
    { data: books },
    { data: financeMonths },
    { data: weddingTasks },
    { data: goals },
    { data: tasks },
    { data: wikiNotes },
  ] = await Promise.all([
    sb.from('user_run_logs').select('distance_km').eq('user_id', userId),
    sb.from('user_games').select('status').eq('user_id', userId).eq('year', 2026),
    sb.from('user_books').select('status, type').eq('user_id', userId).eq('year', 2026),
    sb
      .from('finance_months')
      .select('kk_saldo_end, kk_free')
      .eq('user_id', userId)
      .eq('year', 2026)
      .order('month')
      .limit(12),
    sb.from('wedding_tasks').select('status').eq('user_id', userId),
    sb.from('user_goals').select('status, xp_reward').eq('user_id', userId).eq('year', 2026),
    sb.from('user_tasks').select('status').eq('user_id', userId),
    sb.from('user_notes').select('category, lektion_nr').eq('user_id', userId),
  ]);

  return computeModuleStats(
    {
      runLogs: runLogs ?? [],
      games: games ?? [],
      books: books ?? [],
      financeMonths: financeMonths ?? [],
      weddingTasks: weddingTasks ?? [],
      goals: goals ?? [],
      tasks: tasks ?? [],
      wikiNotes: wikiNotes ?? [],
    },
    new Date(),
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- module-stats`
Expected: PASS — all assertions green.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/dashboard/module-stats.ts lib/dashboard/module-stats.test.ts
git commit -m "feat(dashboard): extract live module stats into tested pure fn"
```

---

## Task 3: Wire live stats + Heute section into the dashboard

Replace the dashboard's static module taglines with live `getModuleStats` data, and add the "Heute" overview from `getTodayOverview` (already exists in `lib/dashboard/today.ts`). Also run `seedAllFromNotion` on load so data exists.

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Update imports**

At the top of `app/(app)/dashboard/page.tsx`, add these imports alongside the existing ones:

```ts
import { getModuleStats } from '@/lib/dashboard/module-stats';
import { getTodayOverview } from '@/lib/dashboard/today';
import { seedAllFromNotion } from '@/lib/actions/life-seed';
```

- [ ] **Step 2: Load seed + stats + today in the data-fetch block**

The page currently has:

```ts
  const userId = await requireUserId();
  const [profile, stats, recent, avatarUrl, streakData] = await Promise.all([
    ensureUserProfile(userId),
    getUserStats(userId),
    listRecentActivity(userId, 5),
    getAvatarSignedUrl(userId),
    getStreak(userId),
  ]);
```

Replace with (add `seedAllFromNotion` to the first batch, then fetch stats/today after seeding so seeded rows are visible):

```ts
  const userId = await requireUserId();
  const [profile, stats, recent, avatarUrl, streakData] = await Promise.all([
    ensureUserProfile(userId),
    getUserStats(userId),
    listRecentActivity(userId, 5),
    getAvatarSignedUrl(userId),
    getStreak(userId),
    seedAllFromNotion(userId),
  ]);
  const [moduleStats, today] = await Promise.all([
    getModuleStats(userId),
    getTodayOverview(userId),
  ]);
```

- [ ] **Step 3: Add the Heute section helper constants**

Directly below the existing `COLOR_MAP` constant near the top of the file, add:

```ts
const EVENT_DOT: Record<string, string> = {
  blue: 'bg-accent-blue',
  green: 'bg-accent-green',
  amber: 'bg-accent-amber',
  purple: 'bg-accent-purple',
  red: 'bg-red-400',
};
```

- [ ] **Step 4: Render the Heute section**

In the returned JSX, immediately after the `<StreakBadge ... />` line and before the `{/* Life modules grid */}` section, insert:

```tsx
      {/* Heute */}
      <section className="space-y-3">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">Heute</p>

        {today.planWeek && (
          <div className="rounded-xl bg-bg-surface border border-accent-green/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs label-mono text-accent-green">
                  Laufplan {today.planWeek.weekStr} · {today.planWeek.dates}
                </p>
                <p className="text-text-primary text-sm mt-1">{today.planWeek.units}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-accent-green font-semibold">{today.planWeek.km} km</p>
                <p className="text-text-muted text-[11px]">{today.daysToHM}d bis HM</p>
              </div>
            </div>
          </div>
        )}
        {!today.planWeek && today.nextPlanWeek && (
          <div className="rounded-xl bg-bg-surface border border-border-subtle p-4">
            <p className="text-xs label-mono text-text-muted">Laufplan startet</p>
            <p className="text-text-primary text-sm mt-1">
              {today.nextPlanWeek.weekStr} · {today.nextPlanWeek.dates} — {today.nextPlanWeek.units}
            </p>
          </div>
        )}

        {today.dueItems.length > 0 ? (
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle">
            {today.dueItems.slice(0, 6).map((item) => (
              <Link
                key={`${item.source}-${item.id}`}
                href={item.source === 'wedding' ? '/wedding' : '/tasks'}
                className="flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors"
              >
                <span
                  className={[
                    'h-2 w-2 rounded-full shrink-0',
                    item.overdue ? 'bg-red-400' : 'bg-accent-amber',
                  ].join(' ')}
                />
                <span className="flex-1 text-sm text-text-primary truncate">{item.title}</span>
                <span
                  className={[
                    'text-[11px] label-mono shrink-0',
                    item.overdue ? 'text-red-400' : 'text-text-muted',
                  ].join(' ')}
                >
                  {item.overdue ? 'überfällig' : 'heute'} · {item.area}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm px-1">Nichts überfällig — alles im Griff.</p>
        )}

        {today.todayEvents.length > 0 && (
          <div className="rounded-xl bg-bg-surface border border-border-subtle p-3 space-y-2">
            <p className="text-[11px] label-mono text-text-muted">Termine heute</p>
            {today.todayEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${EVENT_DOT[e.color] ?? 'bg-accent-blue'}`} />
                <span className="text-sm text-text-primary">{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>
```

- [ ] **Step 5: Use live stats in the module grid**

The module grid currently renders the static tagline:

```tsx
                <p className="text-[10px] text-text-muted truncate">{m.tagline}</p>
```

Replace that single line with a live headline/subline (falling back to the tagline when no stats):

```tsx
                {moduleStats[m.id] ? (
                  <>
                    <p className="text-[10px] text-text-secondary truncate">{moduleStats[m.id]!.headline}</p>
                    <p className="text-[10px] text-text-muted truncate">{moduleStats[m.id]!.subline}</p>
                  </>
                ) : (
                  <p className="text-[10px] text-text-muted truncate">{m.tagline}</p>
                )}
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors. (If `today.planWeek.weekStr/dates/units/km` or `e.color/e.id/e.title` type errors appear, confirm the property names against `lib/dashboard/today.ts` and `lib/calendar/events.ts` `CalEvent` type, and use the exact names found there.)

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: build succeeds, `/dashboard` compiles.

- [ ] **Step 8: Commit**

```bash
git add "app/(app)/dashboard/page.tsx"
git commit -m "feat(dashboard): live module stats + Heute overview"
```

---

## Task 4: Delete the navigation-less (hub) route group

Now that its logic lives in `lib/dashboard/module-stats.ts` and the dashboard renders the Heute section, the old `/hub` is dead and inconsistent (no Sidebar).

**Files:**
- Delete: `app/(hub)/hub/page.tsx`
- Delete: `app/(hub)/layout.tsx`

- [ ] **Step 1: Delete the files**

```bash
git rm "app/(hub)/hub/page.tsx" "app/(hub)/layout.tsx"
```

- [ ] **Step 2: Check for dangling references**

Run: `grep -rn "/hub" app components lib middleware.ts --include="*.ts" --include="*.tsx" | grep -v node_modules`
Expected: no references to the `/hub` route remain (the middleware was already changed in Task 1). If `components/dashboard/QuickAddTask` is only used by the deleted hub page, leave it — it is a harmless unused component; do NOT delete unrelated files in this task.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds; `(hub)` route no longer in the route manifest.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(routing): remove navigation-less (hub) route group"
```

---

## Task 5: Jarvis live-context builder (tested pure formatter + DB wrapper)

Build a snapshot string injected into the system prompt so Jarvis answers status questions with real numbers.

**Files:**
- Create: `lib/jarvis/context.ts`
- Test: `lib/jarvis/context.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/jarvis/context.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatJarvisContext, type JarvisSnapshot } from './context';

const FIXED_NOW = new Date('2026-05-17T12:00:00Z');

const snap: JarvisSnapshot = {
  openTasks: [
    { title: 'Steuer 2025', area: 'finance', deadline: '2026-05-01' },
    { title: 'Trauzeugen fragen', area: 'wedding', deadline: '2026-05-20' },
  ],
  openTaskCount: 7,
  totalKm: 127.4,
  doneBooks: 1,
  doneAudiobooks: 0,
  doneGames: 2,
  gamesTotal: 10,
  weddingDone: 4,
  weddingTotal: 12,
  financeKkSaldo: -1240,
  financeKkFree: 380,
  goalsDoneXp: 50,
  goalsTotalXp: 150,
};

describe('formatJarvisContext', () => {
  it('produces a compact German status block', () => {
    const out = formatJarvisContext(snap, FIXED_NOW);
    expect(out).toContain('Aktueller Stand (live)');
    expect(out).toContain('7 offen');
    expect(out).toContain('Steuer 2025');
    expect(out).toContain('127.4 / 500 km');
    expect(out).toContain('161 Tage bis Halbmarathon');
    expect(out).toContain('146 Tage bis Standesamt');
    expect(out).toContain('1/6 Bücher');
    expect(out).toContain('2/10 Spiele');
  });

  it('marks overdue tasks relative to now', () => {
    const out = formatJarvisContext(snap, FIXED_NOW);
    // 2026-05-01 is before 2026-05-17 → overdue
    expect(out).toMatch(/Steuer 2025.*überfällig/);
  });

  it('handles empty task list without throwing', () => {
    const out = formatJarvisContext(
      { ...snap, openTasks: [], openTaskCount: 0 },
      FIXED_NOW,
    );
    expect(out).toContain('0 offen');
    expect(out).toContain('Aktueller Stand (live)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- jarvis/context`
Expected: FAIL — `Cannot find module './context'`.

- [ ] **Step 3: Write the implementation**

Create `lib/jarvis/context.ts`:

```ts
import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

const HM_DATE = '2026-10-25';
const STANDESAMT_DATE = '2026-10-10';

export type JarvisSnapshot = {
  openTasks: { title: string; area: string; deadline: string | null }[];
  openTaskCount: number;
  totalKm: number;
  doneBooks: number;
  doneAudiobooks: number;
  doneGames: number;
  gamesTotal: number;
  weddingDone: number;
  weddingTotal: number;
  financeKkSaldo: number | null;
  financeKkFree: number | null;
  goalsDoneXp: number;
  goalsTotalXp: number;
};

function days(target: string, now: Date): number {
  return Math.ceil((new Date(target).getTime() - now.getTime()) / 86400000);
}

export function formatJarvisContext(s: JarvisSnapshot, now: Date): string {
  const todayISO = now.toISOString().slice(0, 10);

  const taskLines = s.openTasks
    .slice(0, 5)
    .map((t) => {
      const overdue = t.deadline && t.deadline < todayISO;
      const when = !t.deadline
        ? ''
        : overdue
          ? ', überfällig'
          : `, fällig ${t.deadline}`;
      return `"${t.title}" (${t.area}${when})`;
    })
    .join('; ');

  const lines = [
    'Aktueller Stand (live):',
    `• Tasks: ${s.openTaskCount} offen${taskLines ? ` — ${taskLines}` : ''}`,
    `• Sport: ${s.totalKm.toFixed(1)} / 500 km · ${days(HM_DATE, now)} Tage bis Halbmarathon`,
    `• Hochzeit: ${days(STANDESAMT_DATE, now)} Tage bis Standesamt · ${s.weddingDone}/${s.weddingTotal} Tasks erledigt`,
    `• Lesen: ${s.doneBooks}/6 Bücher · ${s.doneAudiobooks}/6 Hörbücher`,
    `• Gaming: ${s.doneGames}/${s.gamesTotal} Spiele fertig`,
    `• Finanzen: KK ${Number(s.financeKkSaldo ?? 0).toLocaleString('de-DE')} € · ${Number(s.financeKkFree ?? 0).toLocaleString('de-DE')} € frei`,
    `• Jahresplan: ${s.goalsDoneXp} / ${s.goalsTotalXp} XP erreicht`,
  ];
  return lines.join('\n');
}

export async function gatherJarvisContext(userId: string): Promise<string> {
  const sb = createServiceClient();

  const [
    { data: openTasks },
    { count: openTaskCount },
    { data: runLogs },
    { data: books },
    { data: games },
    { data: weddingTasks },
    { data: financeMonths },
    { data: goals },
  ] = await Promise.all([
    sb
      .from('user_tasks')
      .select('title, area, deadline')
      .eq('user_id', userId)
      .neq('status', 'done')
      .order('deadline', { nullsFirst: false })
      .limit(5),
    sb
      .from('user_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'done'),
    sb.from('user_run_logs').select('distance_km').eq('user_id', userId),
    sb.from('user_books').select('status, type').eq('user_id', userId).eq('year', 2026),
    sb.from('user_games').select('status').eq('user_id', userId).eq('year', 2026),
    sb.from('wedding_tasks').select('status').eq('user_id', userId),
    sb
      .from('finance_months')
      .select('kk_saldo_end, kk_free')
      .eq('user_id', userId)
      .eq('year', 2026)
      .order('month')
      .limit(12),
    sb.from('user_goals').select('status, xp_reward').eq('user_id', userId).eq('year', 2026),
  ]);

  const booksArr = books ?? [];
  const gamesArr = games ?? [];
  const wArr = weddingTasks ?? [];
  const latestMonth = (financeMonths ?? []).at(-1);
  const goalsArr = goals ?? [];

  const snapshot: JarvisSnapshot = {
    openTasks: (openTasks ?? []).map((t) => ({
      title: t.title as string,
      area: (t.area as string) ?? 'allgemein',
      deadline: (t.deadline as string | null) ?? null,
    })),
    openTaskCount: openTaskCount ?? 0,
    totalKm: (runLogs ?? []).reduce((s, r) => s + Number(r.distance_km ?? 0), 0),
    doneBooks: booksArr.filter((b) => b.type === 'book' && b.status === 'done').length,
    doneAudiobooks: booksArr.filter((b) => b.type === 'audiobook' && b.status === 'done').length,
    doneGames: gamesArr.filter((g) => g.status === 'completed').length,
    gamesTotal: gamesArr.length,
    weddingDone: wArr.filter((t) => t.status === 'done').length,
    weddingTotal: wArr.length,
    financeKkSaldo: latestMonth ? Number(latestMonth.kk_saldo_end ?? 0) : null,
    financeKkFree: latestMonth ? Number(latestMonth.kk_free ?? 0) : null,
    goalsDoneXp: goalsArr.filter((g) => g.status === 'done').reduce((s, g) => s + g.xp_reward, 0),
    goalsTotalXp: goalsArr.reduce((s, g) => s + g.xp_reward, 0),
  };

  return formatJarvisContext(snapshot, new Date());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- jarvis/context`
Expected: PASS — all assertions green.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/jarvis/context.ts lib/jarvis/context.test.ts
git commit -m "feat(jarvis): live user-state context builder"
```

---

## Task 6: Inject live context into the Jarvis system prompt

**Files:**
- Modify: `app/api/jarvis/route.ts`

- [ ] **Step 1: Add imports**

At the top of `app/api/jarvis/route.ts`, below the existing `import { NextRequest } from 'next/server';`, add:

```ts
import { requireUserId } from '@/lib/auth/current-user';
import { gatherJarvisContext } from '@/lib/jarvis/context';
```

- [ ] **Step 2: Make buildSystemPrompt accept a context block**

The function signature is currently:

```ts
function buildSystemPrompt(userName: string): string {
```

Change it to:

```ts
function buildSystemPrompt(userName: string, liveContext: string): string {
```

Then, inside the returned template string, the block currently ends with the module list and `Tools:` paragraph. Immediately **before** the `Tools: Du hast Zugriff...` line, insert the live context:

Find:

```
Tools: Du hast Zugriff auf create_task und create_wiki_page.
```

Replace with:

```
${liveContext ? liveContext + '\n\n' : ''}Tools: Du hast Zugriff auf create_task und create_wiki_page.
```

- [ ] **Step 3: Gather context in the POST handler**

In `export async function POST(req: NextRequest)`, after the `apiKey` check block:

```ts
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key' }), { status: 500 });
  }
```

add the context fetch (fault-tolerant — chat must never break on a context error):

```ts
  let liveContext = '';
  try {
    const userId = await requireUserId();
    liveContext = await gatherJarvisContext(userId);
  } catch (err) {
    console.error('Jarvis context error:', err);
  }
```

- [ ] **Step 4: Pass the context into the prompt**

The messages array currently builds the system prompt as:

```ts
  const messages = [
    { role: 'system', content: buildSystemPrompt(name) },
    ...(history ?? []).slice(-20),
    { role: 'user', content: message },
  ];
```

Change the system line to:

```ts
  const messages = [
    { role: 'system', content: buildSystemPrompt(name, liveContext) },
    ...(history ?? []).slice(-20),
    { role: 'user', content: message },
  ];
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add "app/api/jarvis/route.ts"
git commit -m "feat(jarvis): inject live user context into system prompt"
```

---

## Task 7: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Typecheck, tests, build**

Run: `npm run typecheck && npm test && npm run build`
Expected: typecheck clean, all vitest suites pass (including the two new ones), production build succeeds.

- [ ] **Step 2: Start dev server and smoke-test routes**

Run: `npm run dev` (background), then for each route check it returns HTTP 200 and renders without a server error:

```bash
for p in dashboard jarvis tasks sport gaming reading finance wedding goals wiki calendar explore trips profile; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/$p")
  echo "$p -> $code"
done
curl -s -o /dev/null -w "/ -> %{http_code} (redirect)\n" "http://localhost:3000/"
```

Expected: every module route prints `-> 200`. `/` returns a redirect (307/308) to `/dashboard`. Investigate and fix any non-200 before proceeding. If a browser is available, additionally load `/dashboard` and visually confirm the Heute section + live module numbers render.

- [ ] **Step 2b: Verify `/` redirects to `/dashboard`**

Run: `curl -s -o /dev/null -w "%{redirect_url}\n" "http://localhost:3000/"`
Expected: ends with `/dashboard`.

- [ ] **Step 3: Functional Jarvis test**

With the dev server running and `OPENROUTER_API_KEY` present in `.env.local`, in a browser open `/jarvis` (or `/dashboard` QuickChat) and:
1. Ask "Was steht an?" → Jarvis names a real open-task count / titles (proves live context).
2. Ask "Leg eine Aufgabe an: Test-Aufgabe, Bereich allgemein, Priorität low" → a `JarvisToolProposal` card appears → click "Ja" → confirm a success message, then verify the row exists: open `/tasks` and see "Test-Aufgabe".

If the model is unreachable (free-tier rate limit), note it explicitly rather than claiming success; the tool-calling/context code path is still verified by build + the unit tests.

- [ ] **Step 4: Stop the dev server**

Stop the background `npm run dev` process.

---

## Task 8: Update STATUS.md

**Files:**
- Modify: `STATUS.md`

- [ ] **Step 1: Correct the outdated claims**

In `STATUS.md`:
1. In the "Jarvis-UI" table, change the "Mock-API" row to reflect the real OpenRouter integration with tool-calling and live context. Change row label to "KI-Backend" with detail: "Echter OpenRouter-Stream (DeepSeek v4 Flash, Llama-Fallback), Tool-Calling mit Bestätigung, Live-Kontext aus allen Modulen".
2. In the "Bekannte Probleme" table, **remove** the rows "Navigation unvollständig" and "Jarvis KI ist ein Mock" (both resolved). Keep "Push Notifications" and "Vercel Projektname".
3. Add a one-line note under the title: `> Stand: 2026-05-17 · Routing fix + Dashboard-Hub + Jarvis Live-Kontext live.`
4. Update the "Navigation" mention from "BottomNav 5 Tabs" to "Sidebar (Slide-in) — alle Module erreichbar; Einstieg → /dashboard".

- [ ] **Step 2: Commit**

```bash
git add STATUS.md
git commit -m "docs: update STATUS.md — Jarvis live, routing/nav done"
```

---

## Task 9: Merge to main and deploy to Vercel

**This is mandatory** — per the spec, the user tests only on Vercel production, which auto-deploys from `main`. Merge/push to `main` are shared, risky actions.

**Files:** none (git operations)

- [ ] **Step 1: Confirm with the user before merging**

Show the user the summary of changes on `claude/zealous-bell-2416c4` and explicitly ask for approval to merge into `main` and trigger the Vercel production deploy. Do not proceed without a clear "yes".

- [ ] **Step 2: Ensure everything is committed and green**

Run: `git status --short && npm run typecheck && npm test && npm run build`
Expected: clean working tree, all green. Do not merge otherwise.

- [ ] **Step 3: Merge the branch into main**

```bash
git checkout main
git merge --no-ff claude/zealous-bell-2416c4 -m "feat: Jarvis testable-state — routing, dashboard-hub, live context"
```

- [ ] **Step 4: Push main to trigger Vercel auto-deploy**

```bash
git push origin main
```

Expected: push succeeds; Vercel starts a production deploy from `main`.

- [ ] **Step 5: Verify the production deploy**

Confirm (via the user or `gh`/Vercel dashboard if available) that the Vercel deploy finished green, and that on the production URL `/` redirects to `/dashboard` and the dashboard shows live module numbers. Report the production URL to the user for testing.

---

## Self-Review

**Spec coverage:**
- Routing fix (`/` → `/dashboard`) → Task 1 ✓
- Delete `(hub)` route group → Task 4 ✓
- Splash untouched (no action) → covered by not touching it; explicitly out of scope in spec ✓
- `lib/dashboard/module-stats.ts` extraction → Task 2 ✓
- Dashboard live grid + Heute + `seedAllFromNotion` → Task 3 ✓
- `lib/jarvis/context.ts` builder → Task 5 ✓
- Inject context into `app/api/jarvis/route.ts` with try/catch fallback → Task 6 ✓
- Verification (typecheck/build/test/smoke/functional) → Task 7 ✓
- STATUS.md update → Task 8 ✓
- Mandatory merge-to-main + Vercel deploy with user confirmation → Task 9 ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. ✓

**Type consistency:** `ModuleStatsInput`/`ModuleStatsResult`/`computeModuleStats`/`getModuleStats` consistent across Task 2 & 3. `JarvisSnapshot`/`formatJarvisContext`/`gatherJarvisContext` consistent across Task 5 & 6. `buildSystemPrompt(userName, liveContext)` signature consistent in Task 6 steps 2 & 4. ✓

**Known assumptions flagged for the implementer:** Task 3 Step 6 warns to verify `today.planWeek`/`CalEvent` property names against source if a type error appears (the Heute JSX is lifted verbatim from the working old hub page, so names should already match).
