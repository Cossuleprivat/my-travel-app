-- Sprint 16: Quest seed for top travel destinations
-- Cities: London, Paris, New York, Tokyo, Barcelona, Amsterdam, Rome, Prague,
--         Vienna, Bangkok, Bali, Singapore, Lisbon, Budapest, Istanbul,
--         Berlin (extend), Kyoto, Seoul

INSERT INTO quests (id, city_id, title, description, category, difficulty, estimated_minutes, estimated_cost_eur, is_active) VALUES

-- LONDON (38eb0b9e-c56b-4775-8d63-0cf7bacb1f04)
(gen_random_uuid(), '38eb0b9e-c56b-4775-8d63-0cf7bacb1f04', 'Tower of London', 'Explore a thousand years of royal history, the Crown Jewels, and the infamous ravens.', 'landmark', 2, 90, 35, true),
(gen_random_uuid(), '38eb0b9e-c56b-4775-8d63-0cf7bacb1f04', 'Borough Market food crawl', 'Graze through London''s legendary food market — cheese, bread, street food, coffee.', 'activity', 1, 90, 20, true),
(gen_random_uuid(), '38eb0b9e-c56b-4775-8d63-0cf7bacb1f04', 'Tate Modern', 'Free world-class contemporary art in a converted power station on the Thames.', 'landmark', 1, 75, 0, true),
(gen_random_uuid(), '38eb0b9e-c56b-4775-8d63-0cf7bacb1f04', 'Shoreditch street art walk', 'Discover Banksy and beyond in London''s creative East End mural district.', 'hidden_gem', 1, 90, 0, true),
(gen_random_uuid(), '38eb0b9e-c56b-4775-8d63-0cf7bacb1f04', 'Brunch at Dishoom', 'Bombay-style brunch at one of London''s most beloved spots — queue is part of the vibe.', 'restaurant', 2, 90, 22, true),

-- PARIS (64729dab-16ef-414b-9c58-c848a933c85b)
(gen_random_uuid(), '64729dab-16ef-414b-9c58-c848a933c85b', 'Eiffel Tower at golden hour', 'Climb the iron lady at sunset for the best view over the City of Light.', 'landmark', 2, 120, 30, true),
(gen_random_uuid(), '64729dab-16ef-414b-9c58-c848a933c85b', 'Louvre highlights tour', 'Hit the must-sees — Mona Lisa, Venus de Milo, Winged Victory — in under 3 hours.', 'landmark', 3, 180, 22, true),
(gen_random_uuid(), '64729dab-16ef-414b-9c58-c848a933c85b', 'Le Marais neighborhood wander', 'Get lost among galleries, falafel shops, and fashion boutiques in this medieval district.', 'hidden_gem', 1, 120, 0, true),
(gen_random_uuid(), '64729dab-16ef-414b-9c58-c848a933c85b', 'Croissant at a local boulangerie', 'Skip the tourist cafés — find a neighborhood bakery and eat a proper croissant standing up.', 'restaurant', 1, 20, 4, true),
(gen_random_uuid(), '64729dab-16ef-414b-9c58-c848a933c85b', 'Montmartre & Sacré-Cœur', 'Climb the bohemian hill, watch street artists at work, and sit on the steps at dusk.', 'landmark', 2, 90, 0, true),

-- NEW YORK (d82c4f36-b7d9-43d7-866b-ec9e6e3bd49a)
(gen_random_uuid(), 'd82c4f36-b7d9-43d7-866b-ec9e6e3bd49a', 'Walk the Brooklyn Bridge', 'Cross NYC''s most iconic bridge on foot — the Manhattan skyline is worth every step.', 'landmark', 1, 60, 0, true),
(gen_random_uuid(), 'd82c4f36-b7d9-43d7-866b-ec9e6e3bd49a', 'Central Park loop', 'Rent a bike or walk the full 10 km loop — Bethesda Fountain, Bow Bridge, the Ramble.', 'activity', 1, 90, 0, true),
(gen_random_uuid(), 'd82c4f36-b7d9-43d7-866b-ec9e6e3bd49a', 'MoMA visit', 'Stand in front of Starry Night and Warhol''s soup cans in person.', 'landmark', 2, 120, 25, true),
(gen_random_uuid(), 'd82c4f36-b7d9-43d7-866b-ec9e6e3bd49a', 'Dollar pizza slice, NYC-style', 'Find a no-frills slice joint, fold it in half, eat it standing — that''s the ritual.', 'restaurant', 1, 20, 4, true),
(gen_random_uuid(), 'd82c4f36-b7d9-43d7-866b-ec9e6e3bd49a', 'High Line & Chelsea Market', 'Elevated rail park above the city with killer views and artisan food below.', 'hidden_gem', 1, 120, 0, true),

-- TOKYO (585ed1cf-275a-4cd8-bfde-e1e85f11913f)
(gen_random_uuid(), '585ed1cf-275a-4cd8-bfde-e1e85f11913f', 'Senso-ji Temple', 'Tokyo''s oldest temple — arrive before 8am to avoid crowds and feel the atmosphere.', 'landmark', 1, 60, 0, true),
(gen_random_uuid(), '585ed1cf-275a-4cd8-bfde-e1e85f11913f', 'Shibuya Crossing at night', 'Stand at the center of the world''s busiest pedestrian crossing after dark.', 'landmark', 1, 30, 0, true),
(gen_random_uuid(), '585ed1cf-275a-4cd8-bfde-e1e85f11913f', 'Ramen in Shinjuku', 'Find a counter-seat ramen shop, order from the vending machine, and slurp.', 'restaurant', 1, 45, 10, true),
(gen_random_uuid(), '585ed1cf-275a-4cd8-bfde-e1e85f11913f', 'Yanaka old town walk', 'Tokyo''s last pre-war neighborhood — cats, vintage shops, temples, no tourists.', 'hidden_gem', 2, 90, 0, true),
(gen_random_uuid(), '585ed1cf-275a-4cd8-bfde-e1e85f11913f', 'TeamLab Planets', 'Immerse yourself in digital art you literally walk through — mind-bending.', 'activity', 2, 90, 28, true),

-- BARCELONA (1d58256e-2b03-40e5-b785-acdc83433dc5)
(gen_random_uuid(), '1d58256e-2b03-40e5-b785-acdc83433dc5', 'Sagrada Família', 'Gaudí''s unfinished masterpiece — the towers and stained glass are otherworldly.', 'landmark', 1, 90, 26, true),
(gen_random_uuid(), '1d58256e-2b03-40e5-b785-acdc83433dc5', 'Park Güell', 'Mosaics, serpentine benches, and panoramic city views — arrive early for best light.', 'landmark', 2, 90, 10, true),
(gen_random_uuid(), '1d58256e-2b03-40e5-b785-acdc83433dc5', 'La Boqueria market', 'Barcelona''s famous covered market — fresh fruit, jamón, seafood, chaos.', 'activity', 1, 60, 10, true),
(gen_random_uuid(), '1d58256e-2b03-40e5-b785-acdc83433dc5', 'Tapas dinner in El Born', 'Order patatas bravas, croquetas, and pan con tomate at a packed neighborhood bar.', 'restaurant', 1, 90, 20, true),
(gen_random_uuid(), '1d58256e-2b03-40e5-b785-acdc83433dc5', 'Bunkers del Carmel sunset', 'Climb to the old anti-aircraft bunkers for the best 360° sunset view in the city.', 'hidden_gem', 2, 60, 0, true),

-- AMSTERDAM (98f9b048-20bb-4604-acae-db2de626c276)
(gen_random_uuid(), '98f9b048-20bb-4604-acae-db2de626c276', 'Rijksmuseum', 'Rembrandt''s Night Watch and Vermeer''s The Milkmaid in their natural habitat.', 'landmark', 2, 120, 22, true),
(gen_random_uuid(), '98f9b048-20bb-4604-acae-db2de626c276', 'Canal boat tour', 'See the 17th-century canal ring from the water — the city makes sense from here.', 'activity', 1, 75, 18, true),
(gen_random_uuid(), '98f9b048-20bb-4604-acae-db2de626c276', 'Jordaan neighborhood walk', 'Tiny galleries, houseboats, flower stalls, and the best brown cafés in the city.', 'hidden_gem', 1, 90, 0, true),
(gen_random_uuid(), '98f9b048-20bb-4604-acae-db2de626c276', 'Stroopwafel at Albert Cuyp Market', 'Eat a fresh, warm stroopwafel straight from the market stall — non-negotiable.', 'restaurant', 1, 30, 4, true),
(gen_random_uuid(), '98f9b048-20bb-4604-acae-db2de626c276', 'Anne Frank House', 'Book months ahead — the hidden annex is a moving, necessary experience.', 'landmark', 2, 90, 14, true),

-- ROME (3093aa45-b258-47fa-b724-5f6c7f9d79f3)
(gen_random_uuid(), '3093aa45-b258-47fa-b724-5f6c7f9d79f3', 'Colosseum', '2000-year-old gladiatorial arena — book skip-the-line tickets well in advance.', 'landmark', 2, 120, 18, true),
(gen_random_uuid(), '3093aa45-b258-47fa-b724-5f6c7f9d79f3', 'Vatican Museums & Sistine Chapel', 'Michelangelo''s ceiling is worth the crowds — look up and feel small.', 'landmark', 3, 180, 20, true),
(gen_random_uuid(), '3093aa45-b258-47fa-b724-5f6c7f9d79f3', 'Trevi Fountain coin toss', 'Throw a coin over your left shoulder — one means you''ll return to Rome.', 'landmark', 1, 30, 0, true),
(gen_random_uuid(), '3093aa45-b258-47fa-b724-5f6c7f9d79f3', 'Cacio e pepe in Trastevere', 'The real Roman pasta — two ingredients, no compromises, eaten in a centuries-old trattoria.', 'restaurant', 1, 90, 15, true),
(gen_random_uuid(), '3093aa45-b258-47fa-b724-5f6c7f9d79f3', 'Spanish Steps at dawn', 'Rome''s most theatrical staircase belongs to you alone before 7am.', 'hidden_gem', 2, 30, 0, true),

-- PRAGUE (7dd6b303-470e-49b3-b288-43830bf1b0f0)
(gen_random_uuid(), '7dd6b303-470e-49b3-b288-43830bf1b0f0', 'Prague Castle', 'The largest ancient castle complex in the world — St. Vitus Cathedral alone is worth it.', 'landmark', 2, 120, 14, true),
(gen_random_uuid(), '7dd6b303-470e-49b3-b288-43830bf1b0f0', 'Charles Bridge at dawn', 'Cross the 14th-century bridge before sunrise — 30 baroque saints, zero tourists.', 'hidden_gem', 3, 30, 0, true),
(gen_random_uuid(), '7dd6b303-470e-49b3-b288-43830bf1b0f0', 'Old Town Square & Astronomical Clock', 'Watch the mechanical clock strike the hour and spot the 12 apostles appear.', 'landmark', 1, 60, 0, true),
(gen_random_uuid(), '7dd6b303-470e-49b3-b288-43830bf1b0f0', 'Czech beer at a traditional pub', 'Order a Pilsner Urquell or Kozel dark in a classic pivnice — it''s a cultural act.', 'restaurant', 1, 60, 8, true),
(gen_random_uuid(), '7dd6b303-470e-49b3-b288-43830bf1b0f0', 'Vyšehrad fortress views', 'Quiet hilltop fortress with panoramic river views and a cemetery full of Czech legends.', 'hidden_gem', 2, 90, 0, true),

-- VIENNA (f2f7620a-02cc-489b-86c7-fe3d8cffb8f2)
(gen_random_uuid(), 'f2f7620a-02cc-489b-86c7-fe3d8cffb8f2', 'Schönbrunn Palace gardens', 'Walk the grand Baroque gardens to the Gloriette for a postcard view over Vienna.', 'landmark', 1, 120, 14, true),
(gen_random_uuid(), 'f2f7620a-02cc-489b-86c7-fe3d8cffb8f2', 'Kunsthistorisches Museum', 'One of the world''s great art museums — Vermeer, Raphael, Cellini''s saltcellar.', 'landmark', 3, 150, 18, true),
(gen_random_uuid(), 'f2f7620a-02cc-489b-86c7-fe3d8cffb8f2', 'Coffee & Sachertorte at Café Central', 'Vienna''s grand coffeehouse — Freud and Trotsky drank here. So should you.', 'restaurant', 1, 60, 12, true),
(gen_random_uuid(), 'f2f7620a-02cc-489b-86c7-fe3d8cffb8f2', 'Naschmarkt stroll', 'Vienna''s open-air market — olives, cheeses, spices, and Saturday flea market.', 'activity', 1, 90, 10, true),
(gen_random_uuid(), 'f2f7620a-02cc-489b-86c7-fe3d8cffb8f2', 'Prater & the Riesenrad', 'Ride the 1897 giant Ferris wheel for a slow spin over the city''s oldest park.', 'hidden_gem', 1, 60, 5, true),

-- BANGKOK (a71500aa-2d19-463e-9569-5f89fd03976e)
(gen_random_uuid(), 'a71500aa-2d19-463e-9569-5f89fd03976e', 'Wat Pho reclining Buddha', 'The 46-metre gold Buddha barely fits inside the temple — it''s deliberately overwhelming.', 'landmark', 1, 90, 4, true),
(gen_random_uuid(), 'a71500aa-2d19-463e-9569-5f89fd03976e', 'Chao Phraya river boat', 'Take the express ferry between piers — cheap, fast, and the city looks different from water.', 'activity', 1, 60, 1, true),
(gen_random_uuid(), 'a71500aa-2d19-463e-9569-5f89fd03976e', 'Street food on Yaowarat (Chinatown)', 'Grilled pork skewers, oyster omelettes, and mango sticky rice after dark.', 'restaurant', 1, 90, 8, true),
(gen_random_uuid(), 'a71500aa-2d19-463e-9569-5f89fd03976e', 'Chatuchak Weekend Market', '15,000 stalls — vintage clothes, plants, ceramics, street food. Go early, stay hydrated.', 'activity', 2, 180, 10, true),
(gen_random_uuid(), 'a71500aa-2d19-463e-9569-5f89fd03976e', 'Rooftop bar at Vertigo', 'Open-air rooftop on the 61st floor of the Banyan Tree — city lights to the horizon.', 'hidden_gem', 2, 60, 20, true),

-- BALI (291684f8-34df-42c3-b993-711311f3a5a9)
(gen_random_uuid(), '291684f8-34df-42c3-b993-711311f3a5a9', 'Tanah Lot temple at sunset', 'Sea temple perched on a rock — the silhouette against the orange sky is iconic.', 'landmark', 1, 90, 4, true),
(gen_random_uuid(), '291684f8-34df-42c3-b993-711311f3a5a9', 'Tegallalang rice terraces', 'UNESCO-listed cascading rice paddies outside Ubud — walk between the paddies.', 'landmark', 2, 120, 3, true),
(gen_random_uuid(), '291684f8-34df-42c3-b993-711311f3a5a9', 'Ubud Monkey Forest', '700 long-tailed macaques roaming ancient temple ruins. Keep your sunglasses on.', 'activity', 1, 60, 4, true),
(gen_random_uuid(), '291684f8-34df-42c3-b993-711311f3a5a9', 'Warung lunch in Ubud', 'Nasi campur at a family warung — rice, tempeh, sambal, satay for €3.', 'restaurant', 1, 45, 3, true),
(gen_random_uuid(), '291684f8-34df-42c3-b993-711311f3a5a9', 'Mount Batur sunrise hike', '2-hour predawn hike to the active volcano rim — watch the sun rise above the clouds.', 'hidden_gem', 4, 240, 30, true),

-- SINGAPORE (9383a3e7-af90-4ceb-b938-5db4b2fd0b55)
(gen_random_uuid(), '9383a3e7-af90-4ceb-b938-5db4b2fd0b55', 'Gardens by the Bay', 'The Supertrees lit up at night are unlike anything else on earth.', 'landmark', 1, 90, 14, true),
(gen_random_uuid(), '9383a3e7-af90-4ceb-b938-5db4b2fd0b55', 'Marina Bay Sands SkyPark', 'The world''s most famous infinity pool — with the city skyline as the backdrop.', 'landmark', 1, 60, 20, true),
(gen_random_uuid(), '9383a3e7-af90-4ceb-b938-5db4b2fd0b55', 'Hawker Centre lunch at Lau Pa Sat', 'Michelin-recommended stalls in an 1894 Victorian cast-iron market. Chicken rice is mandatory.', 'restaurant', 1, 45, 6, true),
(gen_random_uuid(), '9383a3e7-af90-4ceb-b938-5db4b2fd0b55', 'Little India & Chinatown contrast', 'Walk between two living cultural enclaves within 20 minutes of each other.', 'hidden_gem', 1, 120, 0, true),
(gen_random_uuid(), '9383a3e7-af90-4ceb-b938-5db4b2fd0b55', 'Singapore Night Safari', 'World''s first nocturnal zoo — tram through darkness past free-roaming animals.', 'activity', 2, 150, 40, true),

-- LISBON (091bc293-0c19-432e-bd5c-576a4c726592)
(gen_random_uuid(), '091bc293-0c19-432e-bd5c-576a4c726592', 'Belém Tower & Jerónimos Monastery', 'Portugal''s golden age condensed into two Manueline masterpieces on the river.', 'landmark', 1, 90, 12, true),
(gen_random_uuid(), '091bc293-0c19-432e-bd5c-576a4c726592', 'Alfama & São Jorge Castle', 'Portugal''s oldest district — fado from open windows, laundry on lines, river views.', 'landmark', 2, 120, 10, true),
(gen_random_uuid(), '091bc293-0c19-432e-bd5c-576a4c726592', 'Pastéis de Belém tasting', 'The original pastel de nata, recipe unchanged since 1837 — eat at least two.', 'restaurant', 1, 30, 4, true),
(gen_random_uuid(), '091bc293-0c19-432e-bd5c-576a4c726592', 'Tram 28 ride', 'The vintage yellow tram that climbs through Alfama''s impossible streets.', 'activity', 1, 45, 3, true),
(gen_random_uuid(), '091bc293-0c19-432e-bd5c-576a4c726592', 'LX Factory Sunday market', 'Industrial complex turned creative hub — vinyl, vintage, food trucks, plant shops.', 'hidden_gem', 1, 90, 0, true),

-- BUDAPEST (d39669bc-c88c-4488-9103-7be8dc93a3cc)
(gen_random_uuid(), 'd39669bc-c88c-4488-9103-7be8dc93a3cc', 'Fisherman''s Bastion at sunrise', 'Neo-Gothic terraces over the Danube — deserted at 6am, magical at sunrise.', 'hidden_gem', 2, 60, 5, true),
(gen_random_uuid(), 'd39669bc-c88c-4488-9103-7be8dc93a3cc', 'Széchenyi thermal baths', 'Soak in 38°C mineral water in a Neo-Baroque palace. Bring a towel and stay 2 hours.', 'activity', 1, 150, 18, true),
(gen_random_uuid(), 'd39669bc-c88c-4488-9103-7be8dc93a3cc', 'Hungarian Parliament building', 'The largest parliament building in Europe — lit up at night it''s otherworldly.', 'landmark', 1, 60, 8, true),
(gen_random_uuid(), 'd39669bc-c88c-4488-9103-7be8dc93a3cc', 'Szimpla Kert ruin bar', 'The original ruin bar — mismatched furniture in a crumbling courtyard, always alive.', 'restaurant', 1, 120, 10, true),
(gen_random_uuid(), 'd39669bc-c88c-4488-9103-7be8dc93a3cc', 'Great Market Hall', 'Three-storey 1897 market — paprika, lángos, embroidery, and the city''s best goulash.', 'activity', 1, 60, 8, true),

-- ISTANBUL (6a9feb91-dfe2-45b6-a006-27c428a07fc1)
(gen_random_uuid(), '6a9feb91-dfe2-45b6-a006-27c428a07fc1', 'Hagia Sophia', 'Church, mosque, museum — 1500 years of history compressed into one building.', 'landmark', 1, 90, 0, true),
(gen_random_uuid(), '6a9feb91-dfe2-45b6-a006-27c428a07fc1', 'Grand Bazaar', '4000 shops, 60 streets, zero orientation — the world''s oldest shopping mall since 1461.', 'activity', 2, 120, 0, true),
(gen_random_uuid(), '6a9feb91-dfe2-45b6-a006-27c428a07fc1', 'Bosphorus ferry crossing', 'The cheapest way to cross from Europe to Asia — €0.80, 25 minutes, unforgettable.', 'activity', 1, 60, 1, true),
(gen_random_uuid(), '6a9feb91-dfe2-45b6-a006-27c428a07fc1', 'Simit & çay on the Golden Horn', 'Sesame bread ring and tea at a waterfront stall — the quintessential Istanbul morning.', 'restaurant', 1, 30, 2, true),
(gen_random_uuid(), '6a9feb91-dfe2-45b6-a006-27c428a07fc1', 'Balat colourful streets', 'Faded pastel houses in Istanbul''s Greek quarter — film photographers come here.', 'hidden_gem', 2, 90, 0, true),

-- BERLIN extension (6f372820-6620-4a08-8579-aa222e04352f — already has 3 quests)
(gen_random_uuid(), '6f372820-6620-4a08-8579-aa222e04352f', 'East Side Gallery', 'The longest surviving stretch of the Berlin Wall — 105 murals by artists from 21 countries.', 'landmark', 1, 60, 0, true),
(gen_random_uuid(), '6f372820-6620-4a08-8579-aa222e04352f', 'Currywurst at Curry 36', 'Kreuzberg''s cult sausage stand — the queue is the review.', 'restaurant', 1, 20, 5, true),
(gen_random_uuid(), '6f372820-6620-4a08-8579-aa222e04352f', 'Mauerpark Sunday flea market', 'Vinyl, vintage, karaoke circle, BBQ smoke — Berlin at its most alive on Sunday afternoon.', 'hidden_gem', 1, 120, 0, true),
(gen_random_uuid(), '6f372820-6620-4a08-8579-aa222e04352f', 'Museum Island', 'Five world-class museums on a Spree island — the Pergamon Altar alone justifies the trip.', 'landmark', 3, 180, 19, true),

-- KYOTO (e690cc97-ef06-4bb9-a1ed-20901ffa50ea)
(gen_random_uuid(), 'e690cc97-ef06-4bb9-a1ed-20901ffa50ea', 'Fushimi Inari torii gates', '10,000 vermillion gates climbing a sacred mountain — keep going past the tourist crowd.', 'landmark', 2, 150, 0, true),
(gen_random_uuid(), 'e690cc97-ef06-4bb9-a1ed-20901ffa50ea', 'Arashiyama bamboo grove', 'Walk the ethereal bamboo tunnel at 6am before the coaches arrive.', 'landmark', 1, 60, 0, true),
(gen_random_uuid(), 'e690cc97-ef06-4bb9-a1ed-20901ffa50ea', 'Traditional tea ceremony', 'Sit on tatami, watch the ritual, drink matcha, eat wagashi — be present.', 'activity', 1, 90, 25, true),
(gen_random_uuid(), 'e690cc97-ef06-4bb9-a1ed-20901ffa50ea', 'Nishiki Market street food', 'The "kitchen of Kyoto" — tofu skewers, pickled vegetables, tamagoyaki.', 'restaurant', 1, 60, 10, true),
(gen_random_uuid(), 'e690cc97-ef06-4bb9-a1ed-20901ffa50ea', 'Philosopher''s Path', 'A canal-side walk through 500 cherry trees — transcendent in spring, beautiful always.', 'hidden_gem', 1, 90, 0, true),

-- SEOUL (b8656573-c3a7-485c-80cd-23584f51bf8b)
(gen_random_uuid(), 'b8656573-c3a7-485c-80cd-23584f51bf8b', 'Gyeongbokgung Palace', '14th-century royal palace with ceremonial guard change — rent a hanbok for free entry.', 'landmark', 1, 90, 3, true),
(gen_random_uuid(), 'b8656573-c3a7-485c-80cd-23584f51bf8b', 'Bukchon Hanok Village', '600-year-old traditional village of wooden houses among modern Seoul — photograph everything.', 'hidden_gem', 2, 90, 0, true),
(gen_random_uuid(), 'b8656573-c3a7-485c-80cd-23584f51bf8b', 'Myeongdong street food', 'Tornado potatoes, tteokbokki, Korean corn dogs — the snack capital of Korea.', 'restaurant', 1, 90, 12, true),
(gen_random_uuid(), 'b8656573-c3a7-485c-80cd-23584f51bf8b', 'N Seoul Tower lock padlock', 'Take the cable car up Namsan, add your padlock to the love locks fence.', 'landmark', 1, 60, 12, true),
(gen_random_uuid(), 'b8656573-c3a7-485c-80cd-23584f51bf8b', 'Hongdae indie scene', 'Korea''s university arts district after dark — live music spilling from every doorway.', 'activity', 2, 120, 15, true);
