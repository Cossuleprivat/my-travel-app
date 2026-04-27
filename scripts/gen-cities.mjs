// Generates supabase/seed/03_cities.sql.
// Capitals come from restcountries.com; bonus cities are curated.

import { writeFileSync } from 'node:fs';

// Bonus cities by ISO2 — top destinations to pad beyond capitals.
const BONUS = {
  US: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami'],
  GB: ['Manchester', 'Edinburgh', 'Liverpool', 'Birmingham'],
  FR: ['Lyon', 'Marseille', 'Nice', 'Bordeaux'],
  DE: ['Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
  IT: ['Milan', 'Florence', 'Venice', 'Naples'],
  ES: ['Barcelona', 'Valencia', 'Seville'],
  JP: ['Osaka', 'Kyoto', 'Yokohama'],
  CN: ['Shanghai', 'Hong Kong', 'Guangzhou'],
  IN: ['Mumbai', 'Bangalore', 'Kolkata', 'Chennai'],
  BR: ['Rio de Janeiro', 'São Paulo', 'Salvador'],
  CA: ['Toronto', 'Vancouver', 'Montreal'],
  AU: ['Sydney', 'Melbourne', 'Brisbane'],
  MX: ['Cancún', 'Guadalajara', 'Monterrey'],
  TH: ['Phuket', 'Chiang Mai'],
  AE: ['Dubai'],
  TR: ['Istanbul', 'Izmir'],
  EG: ['Alexandria', 'Luxor'],
  ZA: ['Cape Town', 'Johannesburg'],
  AR: ['Córdoba', 'Mendoza'],
  PT: ['Porto', 'Faro'],
  NL: ['Rotterdam', 'The Hague'],
  GR: ['Thessaloniki'],
  RU: ['Saint Petersburg'],
  KR: ['Busan'],
  VN: ['Ho Chi Minh City', 'Da Nang'],
  ID: ['Bali', 'Bandung'],
  PH: ['Cebu City', 'Davao'],
  MA: ['Marrakech', 'Casablanca'],
  PE: ['Cusco'],
  CL: ['Valparaíso'],
};

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escape(s) { return s.replace(/'/g, "''"); }

const res = await fetch(
  'https://restcountries.com/v3.1/all?fields=name,cca2,capital',
);
const countries = await res.json();

const cities = [];
const seenSlug = new Set();

function pushCity(countryIso2, name) {
  let slug = slugify(name);
  let finalSlug = slug;
  let n = 2;
  while (seenSlug.has(finalSlug)) {
    finalSlug = `${slug}-${countryIso2.toLowerCase()}-${n++}`;
  }
  seenSlug.add(finalSlug);
  cities.push({ countryIso2, name, slug: finalSlug });
}

for (const c of countries) {
  const iso2 = c.cca2;
  const caps = c.capital ?? [];
  for (const cap of caps) pushCity(iso2, cap);
  for (const bonus of (BONUS[iso2] ?? [])) pushCity(iso2, bonus);
}

const lines = cities.map(
  (city) =>
    `  ((select id from public.countries where iso2 = '${escape(city.countryIso2)}' limit 1), '${escape(city.slug)}', '${escape(city.name)}')`,
);

const sql = `-- Auto-generated. ${cities.length} cities (capitals + curated bonuses).
insert into public.cities (country_id, slug, name) values
${lines.join(',\n')}
on conflict (slug) do update set
  name = excluded.name;
`;

writeFileSync('supabase/seed/03_cities.sql', sql);
console.log(`Wrote ${cities.length} cities.`);
