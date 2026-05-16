'use server';
import { createServiceClient } from '@/lib/supabase/server';
import { ZEITLEKTUR_CONTENT, PLACEHOLDER_MARKER } from '@/lib/wiki/zeitlekturen-content';

// Pre-populated from Notion 2026 HQ — run once per user to bootstrap their data

export async function seedGames(userId: string) {
  const sb = createServiceClient();
  const { count } = await sb.from('user_games').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if ((count ?? 0) > 0) return { seeded: false };

  const games = [
    // Completed slots
    { user_id: userId, title: 'Pokemon XG', platform: 'Switch', played_with: 'Solo', status: 'completed', slot_number: 1, year: 2026, quarter: 'Q1', completed_at: '2026-03-31', sort_order: 1 },
    { user_id: userId, title: 'Borderlands 3', platform: 'PC', played_with: 'Koop Christopher', status: 'completed', slot_number: 2, year: 2026, quarter: 'Q1', completed_at: '2026-03-31', sort_order: 2 },
    // Active slot
    { user_id: userId, title: 'Pokemon Legend ZA', platform: 'Switch', played_with: 'Solo', status: 'active', slot_number: 3, year: 2026, quarter: 'Q2', sort_order: 3 },
    // Active (no slot yet — candidates for slots 4–6)
    { user_id: userId, title: 'Need for Speed Unbound', platform: 'PS5/PC', genre: 'Racing', played_with: 'Solo', status: 'active', notes: 'Angefangen', sort_order: 10 },
    { user_id: userId, title: 'Lies of P', platform: 'PS5/Steam Deck', genre: 'Souls-like', played_with: 'Solo', status: 'active', notes: 'Angefangen', sort_order: 11 },
    { user_id: userId, title: 'Ghost of Tsushima', platform: 'PS5', genre: 'Action-Adventure', played_with: 'Solo', status: 'active', notes: 'Angefangen', sort_order: 12 },
    { user_id: userId, title: 'Final Fantasy I (Pixel Remaster)', platform: 'Switch/Steam Deck', genre: 'RPG', played_with: 'Solo', status: 'active', notes: 'Angefangen', sort_order: 13 },
    { user_id: userId, title: 'Elden Ring', platform: 'PS5/Steam Deck', genre: 'Souls-like', played_with: 'Solo', status: 'active', notes: 'Angefangen', sort_order: 14 },
    { user_id: userId, title: 'Sparking Zero', platform: 'PS5', genre: 'Fighting/Competitive', played_with: 'Solo + Competitive', status: 'active', notes: 'Story angefangen — Competitive als separates Ziel (Q3/Q4)', sort_order: 15 },
    { user_id: userId, title: 'Golf Story', platform: 'Switch', genre: 'RPG/Sport', played_with: 'Solo', status: 'active', notes: 'Angefangen', sort_order: 16 },
    { user_id: userId, title: 'Sand Land', platform: 'PS5/Steam Deck', genre: 'Action-RPG', played_with: 'Solo', status: 'active', notes: 'Angefangen', sort_order: 17 },
    // Pipeline
    { user_id: userId, title: 'Pokemon Unbound', platform: 'Switch/Emulator', genre: 'RPG', played_with: 'Solo', status: 'pipeline', notes: '🔥 Hoch', sort_order: 20 },
    { user_id: userId, title: 'Pokemon SoulSilver', platform: 'DS/Emulator', genre: 'RPG', played_with: 'Solo', status: 'pipeline', notes: '🔥 Hoch', sort_order: 21 },
    { user_id: userId, title: 'Spider-Man 2', platform: 'PS5', genre: 'Action-Adventure', played_with: 'Solo', status: 'pipeline', notes: '🔥 Hoch', sort_order: 22 },
    { user_id: userId, title: 'Horizon Zero Dawn', platform: 'PS5/Steam Deck', genre: 'Action-RPG', played_with: 'Solo', status: 'pipeline', notes: '🔥 Hoch', sort_order: 23 },
    { user_id: userId, title: 'Cyberpunk 2077', platform: 'PS5/Steam Deck', genre: 'Action-RPG', played_with: 'Solo', status: 'pipeline', notes: '🔥 Hoch', sort_order: 24 },
    { user_id: userId, title: 'Monster Hunter Stories 1', platform: 'Switch/Steam Deck', genre: 'RPG', played_with: 'Solo', status: 'pipeline', notes: '🟡 Mittel', sort_order: 25 },
    { user_id: userId, title: 'Monster Hunter Stories 2', platform: 'Switch/Steam Deck', genre: 'RPG', played_with: 'Solo', status: 'pipeline', notes: '🟡 Mittel', sort_order: 26 },
    { user_id: userId, title: 'Final Fantasy XIII', platform: 'PS5/Steam Deck', genre: 'RPG', played_with: 'Solo', status: 'pipeline', notes: '🟡 Mittel', sort_order: 27 },
    { user_id: userId, title: 'Pokemon Mystery Dungeon: Explorers of Sky', platform: 'DS/Emulator', genre: 'RPG', played_with: 'Solo', status: 'pipeline', notes: '🟡 Mittel', sort_order: 28 },
    { user_id: userId, title: 'Dark Souls', platform: 'PS5/Steam Deck', genre: 'Souls-like', played_with: 'Solo', status: 'pipeline', notes: '🟡 Mittel', sort_order: 29 },
    { user_id: userId, title: 'Dead Space', platform: 'PS5/Steam Deck', genre: 'Horror-Action', played_with: 'Solo', status: 'pipeline', notes: '🟡 Mittel', sort_order: 30 },
  ];

  const { error } = await sb.from('user_games').insert(games);
  if (error) throw error;
  return { seeded: true, count: games.length };
}

export async function seedBooks(userId: string) {
  const sb = createServiceClient();
  const { count } = await sb.from('user_books').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if ((count ?? 0) > 0) return { seeded: false };

  const books = [
    { user_id: userId, title: 'Shitbürger', type: 'book', status: 'done', slot_number: 1, year: 2026, quarter: 'Q1', completed_at: '2026-03-31' },
    { user_id: userId, title: 'Sherlock Holmes', type: 'book', status: 'reading', slot_number: 2, year: 2026, quarter: 'Q2', current_page: 60 },
    { user_id: userId, title: 'Bitcoin Standard', author: 'Saifedean Ammous', type: 'book', status: 'planned', slot_number: 3, year: 2026, quarter: 'Q2', notes: 'Wiederholung' },
    { user_id: userId, title: 'Pyramiden', type: 'book', status: 'planned', slot_number: 4, year: 2026, quarter: 'Q3' },
    // Audiobooks
    { user_id: userId, title: 'Harry Potter — Orden des Phönix', narrator: 'Rufus Beck', type: 'audiobook', status: 'reading', slot_number: 1, year: 2026, quarter: 'Q2', duration_hours: 31, notes: 'Zur Hälfte' },
    { user_id: userId, title: 'Harry Potter — Heiligtümer des Todes', narrator: 'Rufus Beck', type: 'audiobook', status: 'planned', slot_number: 2, year: 2026, quarter: 'Q2/Q3', duration_hours: 27 },
    { user_id: userId, title: 'Dune — Der Wüstenplanet 1', type: 'audiobook', status: 'planned', slot_number: 3, year: 2026, quarter: 'Q3', duration_hours: 22 },
    { user_id: userId, title: 'Think Like Sherlock', type: 'audiobook', status: 'planned', slot_number: 4, year: 2026, quarter: 'Q3', duration_hours: 4, notes: 'Perfekt parallel zum Sherlock-Buch!' },
  ];

  const { error } = await sb.from('user_books').insert(books);
  if (error) throw error;
  return { seeded: true };
}

export async function seedFinance(userId: string) {
  const sb = createServiceClient();
  const { count: mCount } = await sb.from('finance_months').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if ((mCount ?? 0) === 0) {
    await sb.from('finance_months').insert({
      user_id: userId, year: 2026, month: 4,
      kk_saldo_end: -2492, kk_free: 3508, giro_saldo: 1567,
      salary: 2750, rent_return: 400, other_income: 2.23,
      notes: 'Ausgangslage April 2026',
    });
  }

  const { count: eCount } = await sb.from('finance_special_expenses').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if ((eCount ?? 0) > 0) return { seeded: false };

  const expenses = [
    { user_id: userId, title: 'Golf Platzreife Kurs', amount_eur: 200, planned_date: '2026-05-01', status: 'open', sort_order: 1 },
    { user_id: userId, title: 'Kundendienst Auto', amount_eur: 350, planned_date: '2026-05-15', status: 'open', sort_order: 2 },
    { user_id: userId, title: 'Portugal Vor-Ort', amount_eur: 200, planned_date: '2026-05-28', status: 'open', sort_order: 3 },
    { user_id: userId, title: 'Sardinien Flug', amount_eur: 300, planned_date: '2026-05-31', status: 'open', sort_order: 4 },
    { user_id: userId, title: 'Sardinien Unterkunft', amount_eur: 350, planned_date: '2026-06-01', status: 'open', sort_order: 5 },
    { user_id: userId, title: 'Anzug (eigene Hochzeit)', amount_eur: 375, planned_date: '2026-07-01', status: 'open', sort_order: 6 },
    { user_id: userId, title: 'Anzug (Kumpel-Hochzeit)', amount_eur: 250, planned_date: '2026-07-15', status: 'open', sort_order: 7 },
    { user_id: userId, title: 'Sardinien Vor-Ort', amount_eur: 200, planned_date: '2026-08-15', status: 'open', sort_order: 8 },
    { user_id: userId, title: 'Ehering', amount_eur: 500, planned_date: '2026-09-01', status: 'open', sort_order: 9 },
    { user_id: userId, title: 'Standesamt-Feier', amount_eur: 550, planned_date: '2026-10-10', status: 'open', sort_order: 10 },
    { user_id: userId, title: 'Kfz-Versicherung', amount_eur: 100, planned_date: '2026-11-01', status: 'open', sort_order: 11 },
    { user_id: userId, title: 'Geschenke Dezember', amount_eur: 300, planned_date: '2026-12-01', status: 'open', sort_order: 12 },
    { user_id: userId, title: 'iPhone', amount_eur: 1100, planned_date: '2027-01-01', status: 'postponed', notes: 'Verschoben auf Jan 2027', sort_order: 13 },
    { user_id: userId, title: 'iPad (optional)', amount_eur: 600, planned_date: '2027-06-01', status: 'postponed', notes: 'Optional', sort_order: 14 },
    { user_id: userId, title: 'Ayn Odin + Switch', amount_eur: 650, planned_date: '2027-06-01', status: 'postponed', notes: 'Optional', sort_order: 15 },
  ];

  const { error } = await sb.from('finance_special_expenses').insert(expenses);
  if (error) throw error;
  return { seeded: true };
}

export async function seedWedding(userId: string) {
  const sb = createServiceClient();
  const { count } = await sb.from('wedding_tasks').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if ((count ?? 0) > 0) return { seeded: false };

  const tasks = [
    { user_id: userId, title: 'Standesamt Rednitzhembach anrufen (09122 6921-39)', deadline: '2026-04-17', area: 'standesamt', status: 'done', sort_order: 1 },
    { user_id: userId, title: 'Die Schmiede Schwabach anfragen', deadline: '2026-04-30', area: 'standesamt', status: 'done', sort_order: 2 },
    { user_id: userId, title: 'Standesamt buchen', deadline: '2026-04-30', area: 'standesamt', status: 'done', sort_order: 3 },
    { user_id: userId, title: 'Gästeliste v1 erstellen', area: 'standesamt', status: 'open', sort_order: 4 },
    { user_id: userId, title: 'Anzug kaufen', deadline: '2026-07-01', area: 'standesamt', status: 'open', sort_order: 5 },
    { user_id: userId, title: 'Ehering kaufen', deadline: '2026-09-01', area: 'standesamt', status: 'open', sort_order: 6 },
    { user_id: userId, title: 'Feier planen (Standesamt 10.10.)', deadline: '2026-09-01', area: 'standesamt', status: 'open', sort_order: 7 },
    { user_id: userId, title: 'Steuerklasse ändern — gesetzliche Frist!', deadline: '2026-11-30', area: 'allgemein', status: 'open', sort_order: 8 },
    { user_id: userId, title: 'Location Freie Trauung 2027 — Shortlist', area: 'freie_trauung', status: 'open', sort_order: 10 },
    { user_id: userId, title: 'Freie Trauung Planung starten', deadline: '2026-11-01', area: 'freie_trauung', status: 'open', sort_order: 11 },
  ];

  const { error } = await sb.from('wedding_tasks').insert(tasks);
  if (error) throw error;
  return { seeded: true };
}

export async function seedGoals(userId: string) {
  const sb = createServiceClient();
  const { count } = await sb.from('user_goals').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if ((count ?? 0) > 0) return { seeded: false };

  const goals = [
    { user_id: userId, year: 2026, area: 'sport', title: '500 km in der Nike Running App', definition_of_done: 'Nike App zeigt ≥500 km', deadline: '2026-12-31', xp_reward: 500, status: 'active' },
    { user_id: userId, year: 2026, area: 'sport', title: 'Halbmarathon finishen', definition_of_done: 'Ziellinie Sportscheck Run Nürnberg überquert', deadline: '2026-10-25', xp_reward: 1000, status: 'active' },
    { user_id: userId, year: 2026, area: 'sport', title: 'Golf Platzreife schaffen', definition_of_done: 'DTB-Prüfung offiziell bestanden', deadline: '2026-05-31', xp_reward: 200, status: 'active' },
    { user_id: userId, year: 2026, area: 'sport', title: 'Mit Händen zum Boden kommen', definition_of_done: 'Handflächen flach auf Boden, Beine gestreckt', deadline: '2026-12-31', xp_reward: 100, status: 'active' },
    { user_id: userId, year: 2026, area: 'gaming', title: '10 Games durchspielen', definition_of_done: '10× Credits gesehen / Hauptstory abgeschlossen', deadline: '2026-12-31', xp_reward: 500, status: 'active' },
    { user_id: userId, year: 2026, area: 'reading', title: '5 Bücher lesen', definition_of_done: '5 Bücher komplett gelesen', deadline: '2026-12-31', xp_reward: 300, status: 'active' },
    { user_id: userId, year: 2026, area: 'reading', title: '5 Hörbücher hören', definition_of_done: '5 Hörbücher komplett gehört', deadline: '2026-12-31', xp_reward: 300, status: 'active' },
    { user_id: userId, year: 2026, area: 'travel', title: '4 Reisen machen', definition_of_done: 'Südkorea ✅, Stangel Wirt ✅, Portugal, Sardinien alle durchgeführt', deadline: '2026-12-31', xp_reward: 400, status: 'active' },
    { user_id: userId, year: 2026, area: 'finance', title: 'Budget 2026 einhalten', definition_of_done: 'Ausgaben ≤ 11.500 €, alle Reisen + Käufe geplant bezahlt', deadline: '2026-12-31', xp_reward: 300, status: 'active' },
    { user_id: userId, year: 2026, area: 'finance', title: 'KK-Saldo auf 0 bringen', definition_of_done: 'Easybank KK-Saldo bei 0 €', deadline: '2026-10-31', xp_reward: 500, status: 'active' },
    { user_id: userId, year: 2026, area: 'wedding', title: 'Standesamtlich heiraten', definition_of_done: 'Trauung durchgeführt, Urkunde erhalten — 10.10.2026', deadline: '2026-10-10', xp_reward: 2000, status: 'active' },
    { user_id: userId, year: 2026, area: 'coding', title: 'Travel-Scorer / LiveOS MVP live', definition_of_done: 'App deployed, alle Module funktionieren, Link teilbar', deadline: '2026-12-31', xp_reward: 1000, status: 'active' },
    { user_id: userId, year: 2026, area: 'content', title: 'TikTok/YouTube 1 Monat testen', definition_of_done: '30 Tage gepostet, Daten ausgewertet, Entscheidung getroffen', deadline: '2026-12-31', xp_reward: 300, status: 'open' },
  ];

  const { error } = await sb.from('user_goals').insert(goals);
  if (error) throw error;
  return { seeded: true };
}

export async function seedTasks(userId: string) {
  const sb = createServiceClient();
  const { count } = await sb.from('user_tasks').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if ((count ?? 0) > 0) return { seeded: false };

  const tasks = [
    // Sport
    { user_id: userId, title: 'Golf Platzreife Prüfung anmelden', area: 'sport', priority: 'high', deadline: '2026-05-31', notes: 'DTB-Prüfung buchen' },
    { user_id: userId, title: 'Laufschuhe überprüfen / ggf. neu', area: 'sport', priority: 'medium', deadline: '2026-05-25' },
    { user_id: userId, title: 'Stretching-Routine aufbauen', area: 'sport', priority: 'low', notes: 'Ziel: Hände zum Boden' },
    // Travel
    { user_id: userId, title: 'Portugal Aktivitäten recherchieren', area: 'travel', priority: 'high', deadline: '2026-05-25' },
    { user_id: userId, title: 'Sardinien Unterkunft finalisieren', area: 'travel', priority: 'high', deadline: '2026-05-31' },
    { user_id: userId, title: 'Reiseversicherung prüfen', area: 'travel', priority: 'medium', deadline: '2026-06-01' },
    // Finance
    { user_id: userId, title: 'KK-Abrechnung Mai prüfen', area: 'finance', priority: 'high', deadline: '2026-06-01' },
    { user_id: userId, title: 'Daueraufträge überprüfen', area: 'finance', priority: 'medium' },
    { user_id: userId, title: 'Budget-Übersicht aktualisieren', area: 'finance', priority: 'medium' },
    // Wedding
    { user_id: userId, title: 'Standesamt Termin bestätigen', area: 'wedding', priority: 'high', deadline: '2026-06-01' },
    { user_id: userId, title: 'Anzug Anprobe Termin buchen', area: 'wedding', priority: 'high', deadline: '2026-06-15' },
    { user_id: userId, title: 'Hochzeitsfeier Gästeliste finalisieren', area: 'wedding', priority: 'medium', deadline: '2026-07-01' },
    // Coding
    { user_id: userId, title: 'LiveOS auf Vercel deployen', area: 'coding', priority: 'high', notes: 'Domain kaufen, ENV vars setzen' },
    { user_id: userId, title: 'PWA auf iPhone testen', area: 'coding', priority: 'medium' },
    { user_id: userId, title: 'Push Notifications einrichten', area: 'coding', priority: 'low' },
    // Allgemein
    { user_id: userId, title: 'Arzttermin Jahrescheck', area: 'allgemein', priority: 'medium' },
    { user_id: userId, title: 'Abo-Liste durchgehen', area: 'allgemein', priority: 'low', notes: 'Unnötige Abos kündigen' },
  ];

  const { error } = await sb.from('user_tasks').insert(tasks);
  if (error) throw error;
  return { seeded: true };
}

const ZEITLEKTUREN = [
  { nr: 1,  titel: 'Frühgeschichte & Antike Hochkulturen',  zeitraum: 'ca. 3500–500 v. Chr.' },
  { nr: 2,  titel: 'Klassische Antike — Griechenland & Rom', zeitraum: 'ca. 800 v. Chr. – 476 n. Chr.' },
  { nr: 3,  titel: 'Spätantike & Frühes Mittelalter',        zeitraum: 'ca. 300–1000 n. Chr.' },
  { nr: 4,  titel: 'Hochmittelalter',                        zeitraum: 'ca. 1000–1300' },
  { nr: 5,  titel: 'Spätmittelalter & Übergang',             zeitraum: 'ca. 1300–1400' },
  { nr: 6,  titel: 'Frührenaissance',                        zeitraum: 'ca. 1400–1480' },
  { nr: 7,  titel: 'Hochrenaissance & Manierismus',          zeitraum: 'ca. 1480–1550' },
  { nr: 8,  titel: 'Reformation & Gegenreformation',         zeitraum: 'ca. 1517–1650' },
  { nr: 9,  titel: 'Barock',                                 zeitraum: 'ca. 1600–1750' },
  { nr: 10, titel: 'Aufklärung',                             zeitraum: 'ca. 1680–1800' },
  { nr: 11, titel: 'Klassizismus & Romantik',                zeitraum: 'ca. 1780–1850' },
  { nr: 12, titel: 'Realismus & Industrialisierung',         zeitraum: 'ca. 1840–1890' },
  { nr: 13, titel: 'Jugendstil & Symbolismus',               zeitraum: 'ca. 1890–1910' },
  { nr: 14, titel: 'Klassische Moderne I — Expressionismus & Kubismus', zeitraum: 'ca. 1905–1930' },
  { nr: 15, titel: 'Klassische Moderne II — Bauhaus & Neue Sachlichkeit', zeitraum: 'ca. 1919–1939' },
  { nr: 16, titel: 'Nachkriegsmoderne & Abstrakte Kunst',    zeitraum: 'ca. 1945–1975' },
  { nr: 17, titel: 'Postmoderne bis Gegenwart',              zeitraum: 'ca. 1970 – heute' },
];

function zeitlekturContent(zeitraum: string) {
  return `# Zeitraum: ${zeitraum}

## 🌍 Weltgeschichte
_Wichtige Ereignisse, Reiche, politische Umbrüche..._

---

## 📖 Literatur
_Bedeutende Werke, Autoren, literarische Strömungen..._

---

## 🎨 Kunst
_Stile, Künstler, Meisterwerke, visuelle Merkmale..._

---

## 🏛️ Architektur
_Baustile, Gebäude, Baumaterialien, Raumkonzepte..._

---

## 🎵 Musik & Kultur
_Musikformen, Komponisten, kulturelle Besonderheiten..._

---

## 💡 Meine Erkenntnisse
_Was hat mich überrascht? Was nehme ich mit?_
`;
}

export async function seedWiki(userId: string) {
  const sb = createServiceClient();
  const { count } = await sb.from('user_notes').select('id', { count: 'exact', head: true }).eq('user_id', userId);

  if ((count ?? 0) === 0) {
    const notes = ZEITLEKTUREN.map((l, i) => ({
      user_id: userId,
      title: `L${l.nr} — ${l.titel}`,
      category: 'zeitlektur',
      content: ZEITLEKTUR_CONTENT[l.nr] ?? zeitlekturContent(l.zeitraum),
      lektion_nr: l.nr,
      lektion_zeitraum: l.zeitraum,
      is_pinned: l.nr === 1,
      sort_order: i + 1,
    }));
    const { error } = await sb.from('user_notes').insert(notes);
    if (error) throw error;
    return { seeded: true };
  }

  // Backfill: replace placeholder templates with rich encyclopedia prose,
  // without overwriting any note the user has edited themselves.
  const { data: existing } = await sb
    .from('user_notes')
    .select('id, lektion_nr, content')
    .eq('user_id', userId)
    .eq('category', 'zeitlektur');

  let backfilled = 0;
  for (const note of existing ?? []) {
    const nr = note.lektion_nr as number | null;
    if (!nr || !ZEITLEKTUR_CONTENT[nr]) continue;
    const content = (note.content as string) ?? '';
    if (content.includes(PLACEHOLDER_MARKER)) {
      await sb
        .from('user_notes')
        .update({ content: ZEITLEKTUR_CONTENT[nr] })
        .eq('id', note.id as string);
      backfilled++;
    }
  }
  return { seeded: false, backfilled };
}

export async function seedAllFromNotion(userId: string) {
  const [goals, games, books, finance, wedding, tasks, wiki] = await Promise.all([
    seedGoals(userId),
    seedGames(userId),
    seedBooks(userId),
    seedFinance(userId),
    seedWedding(userId),
    seedTasks(userId),
    seedWiki(userId),
  ]);
  return { goals, games, books, finance, wedding, tasks, wiki };
}
