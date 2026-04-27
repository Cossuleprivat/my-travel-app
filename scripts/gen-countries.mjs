// Generates supabase/seed/02_countries.sql from restcountries.com.
// Run once: `node scripts/gen-countries.mjs`. Delete after.

import { writeFileSync } from 'node:fs';

const REGION_TO_CONTINENT_CODE = {
  Africa: 'AF',
  Americas: null, // split by subregion below
  Asia: 'AS',
  Europe: 'EU',
  Oceania: 'OC',
  Antarctic: 'AN',
};

const SUBREGION_TO_CONTINENT_CODE = {
  'Northern America': 'NA',
  'Central America': 'NA',
  'Caribbean': 'NA',
  'South America': 'SA',
};

function continentCodeFor(country) {
  if (country.region === 'Americas') {
    return SUBREGION_TO_CONTINENT_CODE[country.subregion] ?? 'NA';
  }
  return REGION_TO_CONTINENT_CODE[country.region];
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escape(s) {
  return s.replace(/'/g, "''");
}

const res = await fetch(
  'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,subregion,flag',
);
const countries = await res.json();

const rows = countries
  .map((c) => ({
    code: c.cca3,
    iso2: c.cca2,
    name: c.name.common,
    slug: slugify(c.name.common),
    flag: c.flag ?? null,
    continent: continentCodeFor(c),
  }))
  .filter((c) => c.continent && c.code && c.name)
  .sort((a, b) => a.name.localeCompare(b.name));

const lines = rows.map(
  (c) =>
    `  ('${escape(c.code)}', (select id from c where code = '${c.continent}'), '${escape(c.iso2 ?? '')}', '${escape(c.name)}', '${escape(c.slug)}', ${c.flag ? `'${escape(c.flag)}'` : 'null'})`,
);

const sql = `-- Auto-generated from restcountries.com (${rows.length} countries).
-- Regenerate by re-running scripts/gen-countries.mjs.
with c as (select id, code from public.continents)
insert into public.countries (code, continent_id, iso2, name, slug, flag_emoji) values
${lines.join(',\n')}
on conflict (code) do update set
  iso2 = excluded.iso2,
  name = excluded.name,
  slug = excluded.slug,
  flag_emoji = excluded.flag_emoji;
`;

writeFileSync('supabase/seed/02_countries.sql', sql);
console.log(`Wrote ${rows.length} countries.`);
