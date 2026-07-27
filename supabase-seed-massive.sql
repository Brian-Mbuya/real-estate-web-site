-- Reality Kisumu Hub - Massive Kenyan Property Seed Data
-- Run this in your Supabase SQL Editor to instantly add ~50+ properties!

INSERT INTO public.properties (title, location, price_usd, price_ksh, beds, baths, sqft, type, image_url) VALUES 

-- NAIROBI REGION
('Muthaiga Golf View Estate', 'Muthaiga, Nairobi', 1850000, 240500000, 5, 5, 5200, 'Villa', 'images/p1.webp'),
('Karen Leafy Suburb Mansion', 'Karen, Nairobi', 2100000, 273000000, 6, 6, 7100, 'Villa', 'images/luxury.jpg'),
('Kilimani Smart Penthouse', 'Kilimani, Nairobi', 350000, 45500000, 3, 3, 2200, 'Apartment', 'images/c.jpeg'),
('Westlands Executive Condo', 'Westlands, Nairobi', 280000, 36400000, 2, 2, 1450, 'Apartment', 'images/makasembo.webp'),
('Kileleshwa Modern Duplex', 'Kileleshwa, Nairobi', 420000, 54600000, 4, 3, 2800, 'Apartment', 'images/RiatV.jpeg'),
('Lavington Garden Townhouse', 'Lavington, Nairobi', 850000, 110500000, 4, 4, 3100, 'Villa', 'images/e4.jpg'),
('Upperhill Commercial Suite', 'Upperhill, Nairobi', 520000, 67600000, 0, 2, 4500, 'Commercial', 'images/p4.webp'),
('Riverside Drive Riverfront Home', 'Riverside, Nairobi', 1150000, 149500000, 4, 4, 3600, 'Waterfront', 'images/luxury.jpg'),
('Runda Secure Family Home', 'Runda, Nairobi', 1650000, 214500000, 5, 5, 4800, 'Villa', 'images/p1.webp'),
('Gigiri Diplomatic Residence', 'Gigiri, Nairobi', 2500000, 325000000, 7, 7, 8200, 'Villa', 'images/RiatV.jpeg'),
('Parklands Spacious Apartment', 'Parklands, Nairobi', 190000, 24700000, 3, 2, 1600, 'Apartment', 'images/makasembo.webp'),
('Nairobi CBD Prime Retail Space', 'CBD, Nairobi', 850000, 110500000, 0, 4, 6000, 'Commercial', 'images/c.jpeg'),
('Karen Half-Acre Plot', 'Karen, Nairobi', 400000, 52000000, 0, 0, 21780, 'Land', 'images/p4.webp'),
('Kitisuru Scenic Villa', 'Kitisuru, Nairobi', 1450000, 188500000, 5, 4, 4200, 'Villa', 'images/e4.jpg'),
('Nyari Estate Modern Home', 'Nyari, Nairobi', 1300000, 169000000, 4, 4, 3800, 'Villa', 'images/luxury.jpg'),

-- KISUMU & WESTERN REGION
('The Royal Riat Villa', 'Riat Hills, Kisumu', 950000, 123500000, 5, 4, 3500, 'Villa', 'images/RiatV.jpeg'),
('Milimani Executive Bungalow', 'Milimani, Kisumu', 650000, 84500000, 3, 3, 2400, 'Villa', 'images/makasembo.webp'),
('Dunga Lakefront Retreat', 'Dunga, Kisumu', 820000, 106600000, 4, 3, 3100, 'Waterfront', 'images/p4.webp'),
('Kisumu CBD Office Tower', 'Oginga Odinga Rd, Kisumu', 1200000, 156000000, 0, 10, 12000, 'Commercial', 'images/c.jpeg'),
('Kibos Prime Agricultural Land', 'Kibos, Kisumu', 150000, 19500000, 0, 0, 43560, 'Land', 'images/p1.webp'),
('Mamboleo Smart Apartment', 'Mamboleo, Kisumu', 95000, 12350000, 2, 1, 950, 'Apartment', 'images/makasembo.webp'),
('Nyamasaria Industrial Warehouse', 'Nyamasaria, Kisumu', 450000, 58500000, 0, 2, 8000, 'Commercial', 'images/e4.jpg'),
('Kanyakwar Hillside Home', 'Kanyakwar, Kisumu', 520000, 67600000, 4, 3, 2600, 'Villa', 'images/luxury.jpg'),
('Tom Mboya Estate Family House', 'Tom Mboya, Kisumu', 380000, 49400000, 3, 2, 1800, 'Villa', 'images/RiatV.jpeg'),
('Impala Sanctuary Lodge', 'Impala Park, Kisumu', 2200000, 286000000, 8, 8, 10500, 'Waterfront', 'images/p4.webp'),
('Kakamega Forest Retreat', 'Kakamega', 410000, 53300000, 3, 2, 2200, 'Villa', 'images/p1.webp'),
('Bungoma Commercial Plaza', 'Bungoma CBD', 850000, 110500000, 0, 5, 9500, 'Commercial', 'images/c.jpeg'),
('Vihiga Serene Homestead', 'Vihiga', 250000, 32500000, 4, 2, 1900, 'Villa', 'images/makasembo.webp'),

-- MOMBASA & COASTAL REGION
('Nyali Beachfront Mansion', 'Nyali, Mombasa', 2500000, 325000000, 6, 6, 7500, 'Waterfront', 'images/luxury.jpg'),
('Diani Ocean View Villa', 'Diani Beach, Kwale', 1850000, 240500000, 5, 5, 5200, 'Villa', 'images/e4.jpg'),
('English Point Marina Penthouse', 'English Point, Mombasa', 1200000, 156000000, 3, 3, 2800, 'Waterfront', 'images/c.jpeg'),
('Watamu Coastal Retreat', 'Watamu, Kilifi', 950000, 123500000, 4, 4, 3400, 'Villa', 'images/RiatV.jpeg'),
('Vipingo Ridge Golf Estate', 'Vipingo, Kilifi', 1650000, 214500000, 5, 4, 4800, 'Villa', 'images/p1.webp'),
('Malindi Swahili Style Home', 'Malindi, Kilifi', 680000, 88400000, 4, 3, 3100, 'Villa', 'images/p4.webp'),
('Shanzu Sea Breeze Apartment', 'Shanzu, Mombasa', 220000, 28600000, 2, 2, 1400, 'Apartment', 'images/makasembo.webp'),
('Bamburi Holiday Condo', 'Bamburi, Mombasa', 150000, 19500000, 2, 1, 1100, 'Apartment', 'images/c.jpeg'),
('Mtwapa Creek View House', 'Mtwapa, Kilifi', 520000, 67600000, 3, 3, 2600, 'Waterfront', 'images/e4.jpg'),
('Kilifi Creek Acre Plot', 'Kilifi', 350000, 45500000, 0, 0, 43560, 'Land', 'images/luxury.jpg'),
('Lamu Island Heritage House', 'Lamu Island', 750000, 97500000, 4, 3, 2800, 'Waterfront', 'images/RiatV.jpeg'),
('Galgala Private Beach Plot', 'Diani, Kwale', 1200000, 156000000, 0, 0, 87120, 'Land', 'images/p4.webp'),

-- RIFT VALLEY (NAKURU, ELDORET, NAIVASHA)
('Lake Naivasha Shoreline Lodge', 'Lake Naivasha', 1950000, 253500000, 6, 6, 6800, 'Waterfront', 'images/p1.webp'),
('Great Rift Valley Golf Resort Home', 'Naivasha', 1250000, 162500000, 4, 4, 4200, 'Villa', 'images/luxury.jpg'),
('Nakuru Milimani Executive House', 'Milimani, Nakuru', 550000, 71500000, 4, 3, 2900, 'Villa', 'images/RiatV.jpeg'),
('Elgon View Mansion', 'Elgon View, Eldoret', 820000, 106600000, 5, 4, 3800, 'Villa', 'images/e4.jpg'),
('Eldoret CBD Commercial Block', 'Eldoret CBD', 2100000, 273000000, 0, 8, 18000, 'Commercial', 'images/c.jpeg'),
('Lake Elementaita Boutique Villa', 'Elementaita', 720000, 93600000, 3, 3, 2500, 'Waterfront', 'images/makasembo.webp'),
('Gilgil Farmhouse Estate', 'Gilgil', 950000, 123500000, 5, 4, 4500, 'Villa', 'images/p4.webp'),
('Nakuru Section 58 Apartment', 'Section 58, Nakuru', 110000, 14300000, 2, 1, 950, 'Apartment', 'images/c.jpeg'),
('Naivasha 5 Acre Farm Plot', 'Naivasha', 350000, 45500000, 0, 0, 217800, 'Land', 'images/p1.webp'),
('Eldoret Kapsoya Family Home', 'Kapsoya, Eldoret', 280000, 36400000, 3, 2, 1800, 'Villa', 'images/RiatV.jpeg'),
('Bomet Green Highlands Farm', 'Bomet', 150000, 19500000, 0, 0, 87120, 'Land', 'images/luxury.jpg'),

-- CENTRAL & MT. KENYA REGION
('Nanyuki View Lodge', 'Nanyuki', 850000, 110500000, 4, 4, 3200, 'Villa', 'images/p4.webp'),
('Mount Kenya Wildlife Estate', 'Nanyuki', 1200000, 156000000, 5, 4, 4600, 'Villa', 'images/e4.jpg'),
('Meru Milimani Luxury Home', 'Milimani, Meru', 480000, 62400000, 4, 3, 2700, 'Villa', 'images/makasembo.webp'),
('Nyeri Outspan Area House', 'Nyeri', 320000, 41600000, 3, 2, 2100, 'Villa', 'images/c.jpeg'),
('Thika Greens Golf Villa', 'Thika', 680000, 88400000, 4, 4, 3400, 'Villa', 'images/RiatV.jpeg'),
('Kikuyu Lifestyle Apartment', 'Kikuyu, Kiambu', 160000, 20800000, 2, 2, 1200, 'Apartment', 'images/p1.webp'),
('Tatu City Smart Apartment', 'Tatu City, Ruiru', 280000, 36400000, 3, 2, 1600, 'Apartment', 'images/makasembo.webp'),
('Nanyuki 10 Acre Ranch', 'Nanyuki', 850000, 110500000, 0, 0, 435600, 'Land', 'images/luxury.jpg'),
('Isinya Prime Plots', 'Isinya, Kajiado', 45000, 5850000, 0, 0, 5445, 'Land', 'images/e4.jpg'),
('Machakos Hill View Villa', 'Machakos', 350000, 45500000, 3, 2, 2400, 'Villa', 'images/p4.webp'),

-- GLOBAL LUXURY LISTINGS (International Flavour)
('Dubai Marina Skyline Penthouse', 'Marina, Dubai, UAE', 4500000, 585000000, 4, 5, 5100, 'Apartment', 'images/luxury.jpg'),
('Palm Jumeirah Beachfront Villa', 'Palm Jumeirah, Dubai', 8500000, 1105000000, 6, 7, 8500, 'Waterfront', 'images/e4.jpg'),
('Manhattan Central Park Condo', 'Manhattan, New York, USA', 3200000, 416000000, 3, 3, 2400, 'Apartment', 'images/p1.webp'),
('London Mayfair Townhouse', 'Mayfair, London, UK', 5100000, 663000000, 4, 4, 3200, 'Villa', 'images/c.jpeg'),
('Cape Town Camps Bay Villa', 'Camps Bay, Cape Town, SA', 2100000, 273000000, 5, 5, 4800, 'Waterfront', 'images/RiatV.jpeg'),
('Sydney Harbour View Mansion', 'Sydney, Australia', 6500000, 845000000, 5, 6, 6200, 'Waterfront', 'images/luxury.jpg'),
('Paris Eiffel Tower View Suite', 'Paris, France', 1800000, 234000000, 2, 2, 1500, 'Apartment', 'images/p4.webp'),
('Maldives Private Water Villa', 'Male, Maldives', 3800000, 494000000, 3, 4, 3500, 'Waterfront', 'images/makasembo.webp'),
('Monaco Grand Casino Penthouse', 'Monte Carlo, Monaco', 9500000, 1235000000, 4, 4, 4100, 'Apartment', 'images/e4.jpg'),
('Tokyo Shibuya Smart Apartment', 'Shibuya, Tokyo, Japan', 1400000, 182000000, 2, 1, 1100, 'Apartment', 'images/c.jpeg');
