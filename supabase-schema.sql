-- Supabase Database Schema for Reality Kisumu Hub
-- Massive DB Expansion (Booking.com Style)
-- Run this script in the Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    price_usd NUMERIC NOT NULL,
    price_ksh NUMERIC NOT NULL,
    beds INTEGER,
    baths INTEGER,
    sqft INTEGER,
    type TEXT, -- e.g. Villa, Apartment, Waterfront, Commercial, Land
    image_url TEXT NOT NULL,
    agent_phone TEXT DEFAULT '+254746632821',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Favorites Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Properties are universally readable
CREATE POLICY "Properties are viewable by everyone" ON public.properties
    FOR SELECT USING (true);

-- Profiles are viewable/editable by the owner
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Favorites are strictly isolated to the logged-in user
CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 6. Realtime Configuration
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties, public.user_favorites;

-- 7. CLEAR EXISTING DATA FOR SEEDING
TRUNCATE TABLE public.properties CASCADE;

-- 8. MASSIVE SEED DATA (Booking.com style catalog expansion)
INSERT INTO public.properties (title, location, price_usd, price_ksh, beds, baths, sqft, type, image_url) VALUES 
-- Villas (Luxury & Standalone)
('The Royal Riat Villa', 'Riat Hills, Kisumu', 1450000, 188500000, 5, 4, 3200, 'Villa', 'images/RiatV.jpeg'),
('Beverly Hills Mansion', 'Beverly Hills, CA', 3250000, 422500000, 6, 7, 8500, 'Villa', 'images/luxury.jpg'),
('Milimani Executive Villa', 'Milimani, Kisumu', 850000, 110500000, 4, 3, 2800, 'Villa', 'images/makasembo.webp'),
('Nyali Beachfront Villa', 'Nyali, Mombasa', 1200000, 156000000, 5, 5, 4000, 'Villa', 'images/e4.jpg'),
('Karen Leafy Suburb Home', 'Karen, Nairobi', 950000, 123500000, 4, 4, 3100, 'Villa', 'images/p1.webp'),
('Malibu Ocean View Villa', 'Malibu, CA', 4150000, 539500000, 5, 6, 6200, 'Villa', 'images/luxury.jpg'),
('Diani Serenity Villa', 'Diani Beach, Kwale', 1100000, 143000000, 4, 4, 3500, 'Villa', 'images/e4.jpg'),
('Muthaiga Diplomatic Residence', 'Muthaiga, Nairobi', 2100000, 273000000, 6, 5, 5200, 'Villa', 'images/p4.webp'),
('Kitisuru Modern Villa', 'Kitisuru, Nairobi', 1350000, 175500000, 5, 5, 4100, 'Villa', 'images/RiatV.jpeg'),

-- City Apartments
('Kisumu Heights Apartment', 'CBD, Kisumu', 120000, 15600000, 2, 2, 950, 'Apartment', 'images/c.jpeg'),
('Kilimani Skyline Penthouse', 'Kilimani, Nairobi', 350000, 45500000, 3, 3, 2100, 'Apartment', 'images/makasembo.webp'),
('Westlands Executive Suite', 'Westlands, Nairobi', 280000, 36400000, 2, 2, 1400, 'Apartment', 'images/c.jpeg'),
('Kileleshwa Smart Apartment', 'Kileleshwa, Nairobi', 210000, 27300000, 2, 2, 1200, 'Apartment', 'images/makasembo.webp'),
('New York Central Penthouse', 'Manhattan, NY', 2500000, 325000000, 3, 3, 2800, 'Apartment', 'images/luxury.jpg'),
('London Canary Wharf Flat', 'Canary Wharf, London', 1150000, 149500000, 2, 2, 1100, 'Apartment', 'images/p1.webp'),
('Mombasa CBD Apartment', 'Mombasa CBD', 95000, 12350000, 2, 1, 850, 'Apartment', 'images/c.jpeg'),
('Dubai Marina Condo', 'Marina, Dubai', 850000, 110500000, 2, 2, 1600, 'Apartment', 'images/e4.jpg'),
('Downtown Toronto Condo', 'Toronto, ON', 720000, 93600000, 2, 1, 950, 'Apartment', 'images/makasembo.webp'),
('Upperhill Corporate Apartment', 'Upperhill, Nairobi', 310000, 40300000, 3, 2, 1800, 'Apartment', 'images/p4.webp'),

-- Waterfront Homes
('Dunga Lakefront Retreat', 'Dunga, Kisumu', 650000, 84500000, 3, 2, 2200, 'Waterfront', 'images/p4.webp'),
('Vipingo Ridge Ocean Home', 'Vipingo, Kilifi', 1850000, 240500000, 5, 5, 4800, 'Waterfront', 'images/e4.jpg'),
('Miami Biscayne Bay House', 'Miami, FL', 5200000, 676000000, 6, 7, 7100, 'Waterfront', 'images/luxury.jpg'),
('Lamu Island Swahili House', 'Lamu Island', 420000, 54600000, 4, 3, 2500, 'Waterfront', 'images/RiatV.jpeg'),
('Naivasha Lakeview Lodge', 'Lake Naivasha', 890000, 115700000, 4, 4, 3200, 'Waterfront', 'images/p1.webp'),
('Watamu Beach House', 'Watamu, Kilifi', 1350000, 175500000, 5, 4, 3900, 'Waterfront', 'images/e4.jpg'),
('Sydney Harbour View Home', 'Sydney, AUS', 4500000, 585000000, 4, 4, 4100, 'Waterfront', 'images/luxury.jpg'),

-- Commercial / Land
('Kisumu CBD Office Space', 'Oginga Odinga Rd, Kisumu', 450000, 58500000, 0, 2, 3500, 'Commercial', 'images/c.jpeg'),
('Westlands Business Tower', 'Waiyaki Way, Nairobi', 12000000, 1560000000, 0, 20, 45000, 'Commercial', 'images/p4.webp'),
('Kibos Prime Land Plot', 'Kibos, Kisumu', 85000, 11050000, 0, 0, 10890, 'Land', 'images/p1.webp'),
('Runda Half Acre Plot', 'Runda, Nairobi', 450000, 58500000, 0, 0, 21780, 'Land', 'images/RiatV.jpeg');

-- Add text search index for fast filtering
CREATE INDEX IF NOT EXISTS properties_search_idx ON public.properties USING GIN (to_tsvector('english', title || ' ' || location || ' ' || type));
