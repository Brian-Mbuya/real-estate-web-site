-- Reality Kisumu Hub Database Schema
CREATE DATABASE IF NOT EXISTS real_estate;
USE real_estate;

CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    area VARCHAR(50),
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed properties
INSERT INTO properties (title, category, type, location, price, bedrooms, bathrooms, area, image_url, description) VALUES
('3 Bed Apartment in Kisumu', 'Apartment', 'Apartment', 'Ondiek Highway', 42000000.00, 3, 2, ' Anderson Park', 'images/p.webp', 'Anderson Park Residence Kisumu featuring Piped Gas, Swimming Pool, Gym'),
('1 Bed Apartment with En Suite', 'Apartment', 'Apartment', 'Ondiek Highway', 42000000.00, 1, 1, ' Anderson Park', 'images/p.webp', 'Anderson Park Residence Kisumu featuring Piped Gas, Swimming Pool, Gym'),
('2 Bed Apartment in Nubian', 'Apartment', 'Apartment', 'Nubian Estate', 23000000.00, 5, 5, 'Nubian Block', 'images/e.jpg', 'Strategically placed apartment building housing 9 units in Nubian Estate'),
('Residential Land at Riat', 'Land', 'Land', 'Riat', 2000000.00, 0, 0, '1/4 Acre', 'images/c.jpeg', 'Riat hills plot in Kisumu 6.5km from Kisumu International Airport'),
('Residential Land at Maseno', 'Land', 'Land', 'Maseno', 12000000.00, 0, 0, '1/4 Acre', 'images/u.jpg', 'Quarter acre plot fronting Siriba Road opposite Maseno University'),
('5 Bed Villa with Pool', 'Villa', 'Villa', 'Riat Hills', 48000000.00, 5, 5, '350 m²', 'images/RiatV.jpeg', 'Scandinavian inspired gated community overlooking Lake Victoria'),
('4 Bed House in Milimani', 'Bungalow', 'House', 'Milimani', 20000000.00, 4, 1, '101 m²', 'images/milimani/m6.jpg', 'Prime Milimani estate bungalow featuring tiled floors and ample parking'),
('10 Bed Multi-unit in Milimani', 'Multi-unit', 'House', 'Milimani', 300000000.00, 10, 10, '0.8 ha', 'images/milimani/suite.jpeg', 'Multi-unit investment property with 3 residential blocks in Milimani'),
('4 Bed House with Gym', 'Bungalow', 'House', 'Gem Yala', 23000000.00, 4, 4, '1.6 ha', 'images/dairy/3a4873e1-9856-459c-a240-e597e95665e9.webp', 'Big dairy farm with 4 bedroomed house, gym, and complete farming infrastructure');
