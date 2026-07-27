-- Reality Kisumu Hub - Massive Kenyan Property Seed Data
-- Run this in your Supabase SQL Editor to instantly add ~50+ properties!

-- 1. DROP old tables to prevent schema conflicts from earlier versions
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;

-- 2. CREATE the correct properties table schema
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    price_usd NUMERIC NOT NULL,
    price_ksh NUMERIC NOT NULL,
    beds INTEGER,
    baths INTEGER,
    sqft INTEGER,
    type TEXT, 
    image_url TEXT NOT NULL,
    agent_phone TEXT DEFAULT '+254746632821',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE the user_favorites table
CREATE TABLE public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are viewable by everyone" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Users can manage their own favorites" ON public.user_favorites FOR ALL USING (auth.uid() = user_id);

-- 5. Insert Massive Catalog with ONLINE IMAGES
INSERT INTO public.properties (title, location, price_usd, price_ksh, beds, baths, sqft, type, image_url) VALUES 

-- NAIROBI REGION
('Muthaiga Golf View Estate', 'Muthaiga, Nairobi', 1850000, 240500000, 5, 5, 5200, 'Villa', 'https://loremflickr.com/800/600/mansion,house?lock=101'),
('Karen Leafy Suburb Mansion', 'Karen, Nairobi', 2100000, 273000000, 6, 6, 7100, 'Villa', 'https://loremflickr.com/800/600/mansion,house?lock=102'),
('Kilimani Smart Penthouse', 'Kilimani, Nairobi', 350000, 45500000, 3, 3, 2200, 'Apartment', 'https://loremflickr.com/800/600/penthouse,apartment?lock=103'),
('Westlands Executive Condo', 'Westlands, Nairobi', 280000, 36400000, 2, 2, 1450, 'Apartment', 'https://loremflickr.com/800/600/condo,interior?lock=104'),
('Kileleshwa Modern Duplex', 'Kileleshwa, Nairobi', 420000, 54600000, 4, 3, 2800, 'Apartment', 'https://loremflickr.com/800/600/apartment,house?lock=105'),
('Lavington Garden Townhouse', 'Lavington, Nairobi', 850000, 110500000, 4, 4, 3100, 'Villa', 'https://loremflickr.com/800/600/townhouse,garden?lock=106'),
('Upperhill Commercial Suite', 'Upperhill, Nairobi', 520000, 67600000, 0, 2, 4500, 'Commercial', 'https://loremflickr.com/800/600/office,building?lock=107'),
('Riverside Drive Riverfront Home', 'Riverside, Nairobi', 1150000, 149500000, 4, 4, 3600, 'Waterfront', 'https://loremflickr.com/800/600/riverfront,house?lock=108'),
('Runda Secure Family Home', 'Runda, Nairobi', 1650000, 214500000, 5, 5, 4800, 'Villa', 'https://loremflickr.com/800/600/mansion,house?lock=109'),
('Gigiri Diplomatic Residence', 'Gigiri, Nairobi', 2500000, 325000000, 7, 7, 8200, 'Villa', 'https://loremflickr.com/800/600/villa,mansion?lock=110'),
('Parklands Spacious Apartment', 'Parklands, Nairobi', 190000, 24700000, 3, 2, 1600, 'Apartment', 'https://loremflickr.com/800/600/apartment,balcony?lock=111'),
('Nairobi CBD Prime Retail Space', 'CBD, Nairobi', 850000, 110500000, 0, 4, 6000, 'Commercial', 'https://loremflickr.com/800/600/retail,building?lock=112'),
('Karen Half-Acre Plot', 'Karen, Nairobi', 400000, 52000000, 0, 0, 21780, 'Land', 'https://loremflickr.com/800/600/land,field,landscape?lock=113'),
('Kitisuru Scenic Villa', 'Kitisuru, Nairobi', 1450000, 188500000, 5, 4, 4200, 'Villa', 'https://loremflickr.com/800/600/scenic,villa?lock=114'),
('Nyari Estate Modern Home', 'Nyari, Nairobi', 1300000, 169000000, 4, 4, 3800, 'Villa', 'https://loremflickr.com/800/600/modern,home?lock=115'),

-- KISUMU & WESTERN REGION
('The Royal Riat Villa', 'Riat Hills, Kisumu', 950000, 123500000, 5, 4, 3500, 'Villa', 'https://loremflickr.com/800/600/villa,hillside?lock=116'),
('Milimani Executive Bungalow', 'Milimani, Kisumu', 650000, 84500000, 3, 3, 2400, 'Villa', 'https://loremflickr.com/800/600/bungalow,house?lock=117'),
('Dunga Lakefront Retreat', 'Dunga, Kisumu', 820000, 106600000, 4, 3, 3100, 'Waterfront', 'https://loremflickr.com/800/600/lakehouse,waterfront?lock=118'),
('Kisumu CBD Office Tower', 'Oginga Odinga Rd, Kisumu', 1200000, 156000000, 0, 10, 12000, 'Commercial', 'https://loremflickr.com/800/600/office,tower?lock=119'),
('Kibos Prime Agricultural Land', 'Kibos, Kisumu', 150000, 19500000, 0, 0, 43560, 'Land', 'https://loremflickr.com/800/600/farm,land?lock=120'),
('Mamboleo Smart Apartment', 'Mamboleo, Kisumu', 95000, 12350000, 2, 1, 950, 'Apartment', 'https://loremflickr.com/800/600/apartment,modern?lock=121'),
('Nyamasaria Industrial Warehouse', 'Nyamasaria, Kisumu', 450000, 58500000, 0, 2, 8000, 'Commercial', 'https://loremflickr.com/800/600/warehouse,industrial?lock=122'),
('Kanyakwar Hillside Home', 'Kanyakwar, Kisumu', 520000, 67600000, 4, 3, 2600, 'Villa', 'https://loremflickr.com/800/600/hillside,home?lock=123'),
('Tom Mboya Estate Family House', 'Tom Mboya, Kisumu', 380000, 49400000, 3, 2, 1800, 'Villa', 'https://loremflickr.com/800/600/family,home?lock=124'),
('Impala Sanctuary Lodge', 'Impala Park, Kisumu', 2200000, 286000000, 8, 8, 10500, 'Waterfront', 'https://loremflickr.com/800/600/lodge,resort?lock=125'),
('Kakamega Forest Retreat', 'Kakamega', 410000, 53300000, 3, 2, 2200, 'Villa', 'https://loremflickr.com/800/600/forest,house?lock=126'),
('Bungoma Commercial Plaza', 'Bungoma CBD', 850000, 110500000, 0, 5, 9500, 'Commercial', 'https://loremflickr.com/800/600/plaza,commercial?lock=127'),
('Vihiga Serene Homestead', 'Vihiga', 250000, 32500000, 4, 2, 1900, 'Villa', 'https://loremflickr.com/800/600/homestead,house?lock=128'),

-- MOMBASA & COASTAL REGION
('Nyali Beachfront Mansion', 'Nyali, Mombasa', 2500000, 325000000, 6, 6, 7500, 'Waterfront', 'https://loremflickr.com/800/600/beach,mansion?lock=129'),
('Diani Ocean View Villa', 'Diani Beach, Kwale', 1850000, 240500000, 5, 5, 5200, 'Villa', 'https://loremflickr.com/800/600/ocean,villa?lock=130'),
('English Point Marina Penthouse', 'English Point, Mombasa', 1200000, 156000000, 3, 3, 2800, 'Waterfront', 'https://loremflickr.com/800/600/penthouse,marina?lock=131'),
('Watamu Coastal Retreat', 'Watamu, Kilifi', 950000, 123500000, 4, 4, 3400, 'Villa', 'https://loremflickr.com/800/600/coastal,retreat?lock=132'),
('Vipingo Ridge Golf Estate', 'Vipingo, Kilifi', 1650000, 214500000, 5, 4, 4800, 'Villa', 'https://loremflickr.com/800/600/golf,estate?lock=133'),
('Malindi Swahili Style Home', 'Malindi, Kilifi', 680000, 88400000, 4, 3, 3100, 'Villa', 'https://loremflickr.com/800/600/swahili,house?lock=134'),
('Shanzu Sea Breeze Apartment', 'Shanzu, Mombasa', 220000, 28600000, 2, 2, 1400, 'Apartment', 'https://loremflickr.com/800/600/beach,apartment?lock=135'),
('Bamburi Holiday Condo', 'Bamburi, Mombasa', 150000, 19500000, 2, 1, 1100, 'Apartment', 'https://loremflickr.com/800/600/holiday,condo?lock=136'),
('Mtwapa Creek View House', 'Mtwapa, Kilifi', 520000, 67600000, 3, 3, 2600, 'Waterfront', 'https://loremflickr.com/800/600/creek,house?lock=137'),
('Kilifi Creek Acre Plot', 'Kilifi', 350000, 45500000, 0, 0, 43560, 'Land', 'https://loremflickr.com/800/600/land,coastal?lock=138'),
('Lamu Island Heritage House', 'Lamu Island', 750000, 97500000, 4, 3, 2800, 'Waterfront', 'https://loremflickr.com/800/600/heritage,house?lock=139'),
('Galgala Private Beach Plot', 'Diani, Kwale', 1200000, 156000000, 0, 0, 87120, 'Land', 'https://loremflickr.com/800/600/beach,plot?lock=140'),

-- RIFT VALLEY (NAKURU, ELDORET, NAIVASHA)
('Lake Naivasha Shoreline Lodge', 'Lake Naivasha', 1950000, 253500000, 6, 6, 6800, 'Waterfront', 'https://loremflickr.com/800/600/lodge,lake?lock=141'),
('Great Rift Valley Golf Resort Home', 'Naivasha', 1250000, 162500000, 4, 4, 4200, 'Villa', 'https://loremflickr.com/800/600/golf,resort,home?lock=142'),
('Nakuru Milimani Executive House', 'Milimani, Nakuru', 550000, 71500000, 4, 3, 2900, 'Villa', 'https://loremflickr.com/800/600/executive,house?lock=143'),
('Elgon View Mansion', 'Elgon View, Eldoret', 820000, 106600000, 5, 4, 3800, 'Villa', 'https://loremflickr.com/800/600/mansion,view?lock=144'),
('Eldoret CBD Commercial Block', 'Eldoret CBD', 2100000, 273000000, 0, 8, 18000, 'Commercial', 'https://loremflickr.com/800/600/commercial,building?lock=145'),
('Lake Elementaita Boutique Villa', 'Elementaita', 720000, 93600000, 3, 3, 2500, 'Waterfront', 'https://loremflickr.com/800/600/boutique,villa?lock=146'),
('Gilgil Farmhouse Estate', 'Gilgil', 950000, 123500000, 5, 4, 4500, 'Villa', 'https://loremflickr.com/800/600/farmhouse,estate?lock=147'),
('Nakuru Section 58 Apartment', 'Section 58, Nakuru', 110000, 14300000, 2, 1, 950, 'Apartment', 'https://loremflickr.com/800/600/apartment,living?lock=148'),
('Naivasha 5 Acre Farm Plot', 'Naivasha', 350000, 45500000, 0, 0, 217800, 'Land', 'https://loremflickr.com/800/600/farm,land,green?lock=149'),
('Eldoret Kapsoya Family Home', 'Kapsoya, Eldoret', 280000, 36400000, 3, 2, 1800, 'Villa', 'https://loremflickr.com/800/600/family,home,house?lock=150'),
('Bomet Green Highlands Farm', 'Bomet', 150000, 19500000, 0, 0, 87120, 'Land', 'https://loremflickr.com/800/600/highlands,farm?lock=151');
