export type LaufplanWeek = {
  week: number;
  weekStr: string;
  dates: string;
  km: number;
  units: string;
  isTaper?: boolean;
  isRace?: boolean;
  isSardinia?: boolean;
};

export const LAUFPLAN_2026: LaufplanWeek[] = [
  { week: 22, weekStr: 'W22', dates: '25–31.05.', km: 12, units: '2× EL 4–5 km + 1× LL 6 km — EINSTIEG' },
  { week: 23, weekStr: 'W23', dates: '01–07.06.', km: 15, units: '2× EL 5 km + 1× LL 8 km' },
  { week: 24, weekStr: 'W24', dates: '08–14.06.', km: 18, units: '2× EL 5–6 km + 1× LL 9 km' },
  { week: 25, weekStr: 'W25', dates: '15–21.06.', km: 20, units: '2× EL 6 km + 1× LL 10 km' },
  { week: 26, weekStr: 'W26', dates: '22–28.06.', km: 23, units: '2× EL 6 km + 1× LL 12 km' },
  { week: 27, weekStr: 'W27', dates: '29.06–05.07.', km: 25, units: '2× EL 7 km + 1× LL 14 km' },
  { week: 28, weekStr: 'W28', dates: '06–12.07.', km: 28, units: '2× EL 7 km + 1× LL 16 km' },
  { week: 29, weekStr: 'W29', dates: '13–19.07.', km: 30, units: '2× EL 7–8 km + 1× LL 17 km' },
  { week: 30, weekStr: 'W30', dates: '20–26.07.', km: 33, units: '2× EL 8 km + 1× LL 18 km' },
  { week: 31, weekStr: 'W31', dates: '27.07–02.08.', km: 36, units: '2× EL 9 km + 1× LL 20 km' },
  { week: 32, weekStr: 'W32', dates: '03–09.08.', km: 36, units: '2× EL 9 km + 1× LL 20 km' },
  { week: 33, weekStr: 'W33', dates: '10–16.08.', km: 38, units: 'Sardinien-Woche — optional locker', isSardinia: true },
  { week: 34, weekStr: 'W34', dates: '17–23.08.', km: 40, units: '2× EL 10 km + 1× LL 21 km' },
  { week: 35, weekStr: 'W35', dates: '24–30.08.', km: 42, units: '2× EL 10 km + 1× LL 21 km' },
  { week: 36, weekStr: 'W36', dates: '31.08–06.09.', km: 35, units: 'Taper-Beginn', isTaper: true },
  { week: 37, weekStr: 'W37', dates: '07–13.09.', km: 25, units: 'Taper', isTaper: true },
  { week: 38, weekStr: 'W38', dates: '14–20.09.', km: 20, units: 'Taper', isTaper: true },
  { week: 39, weekStr: 'W39', dates: '21–27.09.', km: 12, units: 'Letzte Lockerung', isTaper: true },
  { week: 40, weekStr: 'W40', dates: '28.09–04.10.', km: 10, units: 'Taper-Woche', isTaper: true },
  { week: 41, weekStr: 'W41', dates: '05–11.10.', km: 5, units: 'Ruhewoche', isTaper: true },
  { week: 42, weekStr: 'W42', dates: '12–18.10.', km: 5, units: 'Letzte Lockerung', isTaper: true },
  { week: 43, weekStr: 'W43', dates: '19–25.10.', km: 21.1, units: '🏁 HALBMARATHON — Sportscheck Run Nürnberg', isRace: true },
];

export const HM_DATE = new Date('2026-10-25');
export const GOAL_KM_2026 = 500;
export const KM_BEFORE_PLAN = 8.6; // km logged before laufplan (Jan–W21)

export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function daysUntilHM(today: Date = new Date()): number {
  const diff = HM_DATE.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getCurrentPlanWeek(isoWeek: number): LaufplanWeek | null {
  return LAUFPLAN_2026.find((w) => w.week === isoWeek) ?? null;
}

export function getNextPlanWeek(isoWeek: number): LaufplanWeek | null {
  return LAUFPLAN_2026.find((w) => w.week > isoWeek) ?? null;
}
