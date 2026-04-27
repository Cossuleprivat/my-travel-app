-- Idempotent: re-runs do nothing.
insert into public.continents (code, name, slug, emoji) values
  ('AF', 'Africa',        'africa',        '🌍'),
  ('AN', 'Antarctica',    'antarctica',    '🧊'),
  ('AS', 'Asia',          'asia',          '🌏'),
  ('EU', 'Europe',        'europe',        '🌍'),
  ('NA', 'North America', 'north-america', '🌎'),
  ('OC', 'Oceania',       'oceania',       '🌏'),
  ('SA', 'South America', 'south-america', '🌎')
on conflict (code) do update set
  slug = excluded.slug,
  emoji = excluded.emoji;
