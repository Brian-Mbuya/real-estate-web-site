-- ============================================================
-- Reality Kisumu Hub — Property Seed Data
-- ============================================================
-- Run this in the Supabase SQL Editor.
--
-- WHAT CHANGED FROM THE PREVIOUS VERSION
--
-- 1. Images. The old seed pointed at loremflickr.com, which serves a
--    RANDOM Flickr photo loosely matching a keyword tag (?lock=NNN only
--    pins which random result you get). Flickr tags are user-submitted
--    and noisy, so "mansion,house" legitimately returned a photo of a
--    flower. Every image below is a real local file in images/, matched
--    by hand to what the photo actually shows. They also work offline.
--
-- 2. Prices. Kisumu figures were 5-10x above market. Real 2026 ranges:
--    basic bungalows from ~KSh 3M, Riat Hills 3-4 bed KSh 8-18M,
--    Milimani up to ~KSh 50M, lakefront villas ~KSh 45M.
--
-- 3. Geography. The catalogue is now Kisumu County, matching the app's
--    name and its photo library. The old seed was mostly Nairobi and
--    Mombasa property illustrated with Kisumu pictures.
--
-- 4. Non-destructive. This no longer DROPs tables, so your RLS policies
--    and the user_favorites table survive. It only replaces the rows in
--    public.properties, and is safe to re-run.
--    Full schema lives in supabase-schema.sql — run that first.
--
-- 5. price_usd is COMPUTED from price_ksh below, so the two currencies
--    can never drift apart. Adjust USD_RATE if the rate moves.
-- ============================================================

-- ---------- 1. Table (created only if missing) ----------
CREATE TABLE IF NOT EXISTS public.properties (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title       TEXT NOT NULL,
    location    TEXT NOT NULL,
    price_usd   NUMERIC NOT NULL,
    price_ksh   NUMERIC NOT NULL,
    beds        INTEGER,
    baths       INTEGER,
    sqft        INTEGER,
    type        TEXT,
    image_url   TEXT NOT NULL,
    agent_phone TEXT DEFAULT '+254746632821',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------- 2. Row Level Security ----------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone"
    ON public.properties FOR SELECT USING (true);

-- ---------- 3. Clear existing rows ----------
-- DELETE rather than DROP so policies, grants and foreign keys survive.
DELETE FROM public.properties;

-- ---------- 4. Insert catalogue ----------
-- Types in use: Villa | Apartment | Waterfront | Commercial | Land
-- (these must match the filter options in house.html)
--
-- Land areas: 1/8 acre = 5,445 sqft · 1/4 = 10,890 · 1/2 = 21,780 · 1 acre = 43,560

INSERT INTO public.properties
    (title, location, price_ksh, price_usd, beds, baths, sqft, type, image_url)
SELECT
    title,
    location,
    price_ksh,
    ROUND(price_ksh / 129.0)  AS price_usd,   -- USD_RATE: KSh per USD
    beds, baths, sqft, type, image_url
FROM (VALUES

    -- ══ MILIMANI — Kisumu's established upmarket suburb ══
    ('Milimani Bougainvillea Bungalow',   'Milimani, Kisumu',            28000000::numeric, 4, 3,  2400, 'Villa',      'images/milimani/s6.jpeg'),
    ('Milimani Palm Garden Residence',    'Milimani, Kisumu',            26000000::numeric, 3, 3,  2100, 'Villa',      'images/milimani/s4.jpeg'),
    ('Milimani Colonial Family Home',     'Milimani, Kisumu',            24000000::numeric, 3, 2,  1950, 'Villa',      'images/milimani/s.jpeg'),
    ('Milimani Red Roof Villa',           'Milimani, Kisumu',            34000000::numeric, 4, 4,  2800, 'Villa',      'images/milimani/suite.jpeg'),
    ('Milimani Courtyard Townhouse',      'Milimani, Kisumu',            38000000::numeric, 4, 4,  3000, 'Villa',      'images/milimani/m6.jpg'),
    ('Milimani Fitted-Kitchen Apartment', 'Milimani, Kisumu',             9500000::numeric, 2, 1,  1050, 'Apartment',  'images/milimani/m4.webp'),
    ('Milimani Serviced Two-Bedroom',     'Milimani, Kisumu',            11000000::numeric, 2, 2,  1200, 'Apartment',  'images/milimani/m5.webp'),
    ('Milimani Executive Studio Suite',   'Milimani, Kisumu',             6500000::numeric, 1, 1,   700, 'Apartment',  'images/p6.webp'),
    ('Milimani Walled Development Plot',  'Milimani, Kisumu',            12000000::numeric, 0, 0, 10890, 'Land',       'images/milimani/m.jpg'),

    -- ══ RIAT HILLS — ridge above the city, lake views ══
    ('Riat Hills Lake View Pool Villa',   'Riat Hills, Kisumu',          42000000::numeric, 5, 4,  3600, 'Waterfront', 'images/riat5.webp'),
    ('Riat Escarpment Lake View Home',    'Riat Hills, Kisumu',          21000000::numeric, 4, 3,  2500, 'Waterfront', 'images/riat6.jpeg'),
    ('Riat Hills Modern Interior Home',   'Riat Hills, Kisumu',          14000000::numeric, 3, 2,  1800, 'Villa',      'images/riat4.webp'),
    ('Riat Hills Ridge View Plot',        'Riat Hills, Kisumu',           4500000::numeric, 0, 0,  5445, 'Land',       'images/c.jpeg'),

    -- ══ LAKEFRONT — Dunga & Hippo Point ══
    ('Dunga Lakefront Retreat',           'Dunga Beach, Kisumu',         45000000::numeric, 4, 4,  3200, 'Waterfront', 'images/luxury.jpg'),
    ('Hippo Point Lake View Residence',   'Hippo Point, Kisumu',         32000000::numeric, 3, 3,  2400, 'Waterfront', 'images/p5.webp'),

    -- ══ SUBURBAN KISUMU ══
    ('Mamboleo Paved-Drive Bungalow',     'Mamboleo, Kisumu',             8500000::numeric, 3, 2,  1500, 'Villa',      'images/dairy/d.jpeg'),
    ('Mamboleo Garden Bungalow',          'Mamboleo, Kisumu',             9200000::numeric, 3, 2,  1650, 'Villa',      'images/dairy/d6.jpeg'),
    ('Kanyakwar Hillside Home',           'Kanyakwar, Kisumu',           13000000::numeric, 4, 3,  2000, 'Villa',      'images/u4.jpg'),
    ('Kanyakwar Family Residence',        'Kanyakwar, Kisumu',           10500000::numeric, 3, 2,  1700, 'Villa',      'images/u6.jpg'),
    ('Tom Mboya Estate House',            'Tom Mboya Estate, Kisumu',     7800000::numeric, 3, 2,  1450, 'Villa',      'images/u.jpg'),
    ('Nyalenda Starter Home',             'Nyalenda, Kisumu',             4200000::numeric, 2, 1,   900, 'Villa',      'images/u5.jpg'),
    ('Lolwe Estate Maisonette',           'Lolwe Estate, Kisumu',        16000000::numeric, 4, 3,  2200, 'Villa',      'images/e7.webp'),

    -- ══ APARTMENTS & OFF-PLAN ══
    ('Makasembo Furnished Apartment',     'Makasembo, Kisumu',            8900000::numeric, 2, 2,  1100, 'Apartment',  'images/makasembo.webp'),
    ('Lumumba Heights Off-Plan',          'Lumumba Estate, Kisumu',       7500000::numeric, 2, 1,   950, 'Apartment',  'images/lumumba.png'),
    ('Lakeview Heights Towers',           'Mamboleo, Kisumu',            13500000::numeric, 3, 2,  1400, 'Apartment',  'images/p.webp'),
    ('Greenpark Residences Off-Plan',     'Riat, Kisumu',                 9800000::numeric, 2, 2,  1150, 'Apartment',  'images/p4.webp'),

    -- ══ COMMERCIAL & INCOME PROPERTY ══
    ('Kisumu CBD Retail Arcade',          'Oginga Odinga St, Kisumu',    35000000::numeric, 0, 6,  7000, 'Commercial', 'images/dairy/d4.jpeg'),
    ('Kondele Mixed-Use Block',           'Kondele, Kisumu',             26000000::numeric, 0, 10, 6400, 'Commercial', 'images/e4.jpg'),
    ('Migosi Rental Apartment Block',     'Migosi, Kisumu',              22000000::numeric, 0, 8,  5200, 'Commercial', 'images/e.jpg'),
    ('Nyamasaria Apartment Block',        'Nyamasaria, Kisumu',          19000000::numeric, 0, 6,  4800, 'Commercial', 'images/e5.jpg'),
    ('Manyatta Rental Units',             'Manyatta, Kisumu',            15000000::numeric, 0, 6,  4000, 'Commercial', 'images/e6.jpg'),

    -- ══ LAND & PLOTS ══
    ('Otonglo Mature Compound',           'Otonglo, Kisumu',              5500000::numeric, 0, 0, 21780, 'Land',       'images/dairy/d7.jpeg'),
    ('Kibos Agricultural Acre',           'Kibos, Kisumu',                3800000::numeric, 0, 0, 43560, 'Land',       'images/c5.jpeg'),
    ('Kibos Roadside Development Plot',   'Kibos, Kisumu',                2900000::numeric, 0, 0, 10890, 'Land',       'images/c4.jpeg')

) AS t(title, location, price_ksh, beds, baths, sqft, type, image_url);

-- ---------- 5. Verify ----------
-- Expect 34 rows, and every image_url pointing at a file in images/.
SELECT type,
       COUNT(*)                                  AS listings,
       'KSh ' || TO_CHAR(MIN(price_ksh), 'FM999,999,999') AS cheapest,
       'KSh ' || TO_CHAR(MAX(price_ksh), 'FM999,999,999') AS priciest
FROM public.properties
GROUP BY type
ORDER BY type;
