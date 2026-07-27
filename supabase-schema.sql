-- Supabase Database Schema for Reality Kisumu Hub
-- Run this script in the Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    phone TEXT DEFAULT '+254746632821',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Villa, Apartment, Waterfront, Bungalow
    price NUMERIC NOT NULL,
    price_formatted TEXT NOT NULL,
    specs TEXT NOT NULL,
    beds INTEGER DEFAULT 0,
    baths INTEGER DEFAULT 0,
    sqft INTEGER DEFAULT 0,
    address TEXT NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT NOT NULL,
    agent_name TEXT DEFAULT 'Support Agent',
    agent_phone TEXT DEFAULT '+254746632821',
    agent_img TEXT DEFAULT 'images/u.jpg',
    is_new BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. User Favorites Table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, property_id)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Profiles: Everyone can read, users can update own profile
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Properties: Everyone can read properties
CREATE POLICY "Public properties read" ON public.properties FOR SELECT USING (true);

-- Favorites: Users can manage their own favorites
CREATE POLICY "User read own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User insert own favorite" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User delete own favorite" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- 7. Enable Realtime Subscriptions on Properties & Favorites
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_favorites;

-- 8. Seed Initial Sample Properties
INSERT INTO public.properties (title, category, price, price_formatted, specs, beds, address, location, image_url, agent_name, agent_phone, agent_img)
VALUES 
('3 Bed Apartment in Kisumu', 'Villa', 1250000, '$1,250,000', '4 Beds | 3 Baths | 2,500 Sq Ft', 4, '123 Maple Drive, Beverly Hills, CA', 'Beverly Hills', 'images/luxury.jpg', 'Sarah Jenkins', '+254746632821', 'images/u.jpg'),
('Modern City Apartment', 'Apartment', 890000, '$890,000', '3 Beds | 2 Baths | 1,800 Sq Ft', 3, '456 Oak Street, Austin, TX', 'Austin', 'images/e4.jpg', 'Elena Vance', '+254746632821', 'images/u4.jpg'),
('5 Bed Villa with Lake Views', 'Waterfront', 1450000, '$1,450,000', '5 Beds | 4 Baths | 3,200 Sq Ft', 5, '789 Riat Hills Ridge, Kisumu', 'Riat Hills', 'images/riat6.jpeg', 'Amina Otieno', '+254746632821', 'images/u5.jpg'),
('Cozy Milimani Bungalow', 'Villa', 650000, '$650,000', '2 Beds | 2 Baths | 1,400 Sq Ft', 2, '102 Milimani Heights, Kisumu', 'Milimani', 'images/makasembo.webp', 'David Ochieng', '+254746632821', 'images/u6.jpg')
ON CONFLICT DO NOTHING;
