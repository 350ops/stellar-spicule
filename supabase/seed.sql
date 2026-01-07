-- Seed data for Trip Planner Demo
-- Run this after schema.sql to populate with sample Japan trip data

-- Insert the demo trip
INSERT INTO trips (id, name, description, start_date, end_date)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Japan Adventure 2026',
    'An amazing 9-day journey through Japan with Camille and Miguel',
    '2026-01-18',
    '2026-01-26'
) ON CONFLICT (id) DO NOTHING;

-- Insert trip days
INSERT INTO trip_days (id, trip_id, date, day_label, location, day_order) VALUES
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Jan 18', 'Day 1', 'Arrive Osaka', 0),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Jan 19', 'Day 2', 'Osaka (Full Day)', 1),
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Jan 20', 'Day 3', 'Osaka → Kyoto', 2),
    ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Jan 21', 'Day 4', 'Kyoto (Temples & Bamboo)', 3),
    ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Jan 22', 'Day 5', 'Nara Day Trip', 4),
    ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'Jan 23', 'Day 6', 'Kyoto → Tokyo', 5),
    ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000001', 'Jan 24', 'Day 7', 'Tokyo (Shibuya & Harajuku)', 6),
    ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000001', 'Jan 25', 'Day 8', 'Tokyo (Asakusa & Akihabara)', 7),
    ('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000001', 'Jan 26', 'Day 9', 'Tokyo → Home', 8)
ON CONFLICT (id) DO NOTHING;

-- Insert itinerary items for Day 1
INSERT INTO itinerary_items (trip_id, day_id, time, title, type, location, status, assignees, description, item_order, confirmation_number, carrier, flight_number, arrival_location) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', '11:30 AM', 'Arrive Kansai Airport', 'Arrival', 'KIX Terminal 1', 'confirmed', ARRAY['C', 'M'], 'Immigration & customs ~45 mins. Pick up Pocket WiFi at arrivals. Get ICOCA cards from JR counter.', 0, NULL, 'Japan Airlines', 'JL 060', 'KIX'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', '1:00 PM', 'Nankai Rapi:t to Namba', 'Train', 'KIX → Namba', 'confirmed', ARRAY['C', 'M'], 'Stylish limited express train to central Osaka. Reserved seats in futuristic blue train.', 1, 'RAPIT-1801', NULL, NULL, NULL),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', '2:00 PM', 'Check-in: The St. Regis Osaka', 'Hotel', 'Midosuji, Osaka', 'confirmed', ARRAY['C', 'M'], 'Luxury hotel on Midosuji Boulevard. Grand Deluxe Room, 20th floor. 2 nights. Butler service included.', 2, 'STR-2026-1801', NULL, NULL, NULL),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', '4:00 PM', 'Explore Shinsaibashi & Amerikamura', 'Sightseeing', 'Shinsaibashi, Osaka', 'idea', ARRAY['C', 'M'], 'Osaka''s premier shopping arcade. American Village for vintage clothing and street fashion.', 3, NULL, NULL, NULL, NULL),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', '7:00 PM', 'Dinner at Dotonbori', 'Food', 'Dotonbori, Osaka', 'booked', ARRAY['C', 'M'], 'Iconic neon-lit food street! Try takoyaki at Kukuru, okonomiyaki at Mizuno (est. 1945), and end with gyoza at Chao Chao.', 4, NULL, NULL, NULL, NULL);

-- Insert itinerary items for Day 2
INSERT INTO itinerary_items (trip_id, day_id, time, title, type, location, status, assignees, description, item_order) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', '9:00 AM', 'Osaka Castle', 'Sightseeing', 'Chuo-ku, Osaka', 'confirmed', ARRAY['C', 'M'], 'Historic castle surrounded by moat and park. ¥600 entry to main tower. Great views from 8th floor observation deck.', 0),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', '11:30 AM', 'Kuromon Market', 'Food', 'Nipponbashi, Osaka', 'confirmed', ARRAY['C', 'M'], 'Osaka''s Kitchen - 170+ years old! Fresh seafood, grilled wagyu skewers, and uni. Arrive hungry!', 1),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', '1:30 PM', 'Shinsekai District', 'Sightseeing', 'Shinsekai, Osaka', 'idea', ARRAY['C', 'M'], 'Retro neighborhood with Tsutenkaku Tower. Try kushikatsu (deep-fried skewers) - no double-dipping!', 2),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', '4:00 PM', 'Spa World', 'Activity', 'Shinsekai, Osaka', 'idea', ARRAY['C', 'M'], 'Huge onsen theme park with baths from around the world. Zones rotate by gender daily. ¥1,500 entry.', 3),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', '7:30 PM', 'Dinner at Ajinoya', 'Food', 'Namba, Osaka', 'booked', ARRAY['C', 'M'], 'Best okonomiyaki in Osaka since 1965. Try the specialty mix with pork and squid. Cash only.', 4);

-- Insert itinerary items for Day 3
INSERT INTO itinerary_items (trip_id, day_id, time, title, type, location, status, assignees, description, item_order) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', '9:30 AM', 'Train to Kyoto', 'Train', 'Osaka → Kyoto', 'confirmed', ARRAY['C', 'M'], 'JR Special Rapid from Osaka Station. Frequent departures every 15 mins.', 0),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', '10:30 AM', 'Check-in: The Machiya Residence', 'Airbnb', 'Gion, Kyoto', 'confirmed', ARRAY['C', 'M'], 'Renovated 100-year-old machiya townhouse. Traditional tatami rooms, private garden. Walking distance to Gion. 3 nights.', 1),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', '12:00 PM', 'Lunch at Gion Nanba', 'Food', 'Gion, Kyoto', 'booked', ARRAY['C', 'M'], 'Famous soba restaurant in a traditional townhouse. Try the cold soba with tempura.', 2),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', '2:00 PM', 'Walk through Gion District', 'Sightseeing', 'Gion, Kyoto', 'confirmed', ARRAY['C', 'M'], 'Explore geisha district. Walk Hanamikoji Street. Might spot a geiko (geisha) or maiko (apprentice).', 3),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', '4:30 PM', 'Yasaka Shrine', 'Sightseeing', 'Gion, Kyoto', 'idea', ARRAY['C', 'M'], 'Beautiful shrine at the end of Shijo street. Free entry. Great at dusk with lanterns lit.', 4),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', '7:00 PM', 'Dinner at Gion Karyo', 'Food', 'Gion, Kyoto', 'booked', ARRAY['C', 'M'], 'Traditional kaiseki dinner in private tatami room. Multi-course seasonal menu.', 5);

-- Insert itinerary items for Day 4
INSERT INTO itinerary_items (trip_id, day_id, time, title, type, location, status, assignees, description, item_order) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '6:30 AM', 'Fushimi Inari Shrine (Sunrise)', 'Sightseeing', 'Fushimi, Kyoto', 'confirmed', ARRAY['C', 'M'], 'Famous 10,000 vermillion torii gates. Go early to avoid crowds! Hike to the top takes ~2 hours. Free entry.', 0),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '9:30 AM', 'Breakfast at Vermillion Cafe', 'Food', 'Near Fushimi Inari', 'idea', ARRAY['C', 'M'], 'Cute cafe with Inari views. Great coffee and Japanese breakfast set.', 1),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '11:00 AM', 'Kinkaku-ji (Golden Pavilion)', 'Sightseeing', 'Kita, Kyoto', 'confirmed', ARRAY['C', 'M'], 'Iconic gold-leaf covered temple reflected in the pond. Entry: ¥500. Can get crowded midday.', 2),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '1:00 PM', 'Lunch at Shoraian', 'Food', 'Arashiyama, Kyoto', 'booked', ARRAY['C', 'M'], 'Beautiful riverside tofu restaurant. River views from tatami seating.', 3),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '2:30 PM', 'Arashiyama Bamboo Grove', 'Sightseeing', 'Arashiyama, Kyoto', 'confirmed', ARRAY['C', 'M'], 'Iconic bamboo forest path. Walk to Tenryu-ji Temple gardens (¥500).', 4),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '4:00 PM', 'Monkey Park Iwatayama', 'Activity', 'Arashiyama, Kyoto', 'idea', ARRAY['C', 'M'], 'Hilltop park with wild Japanese macaques. 20-min uphill walk. ¥550 entry. Great city views.', 5),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '7:00 PM', 'Dinner at Pontocho Alley', 'Food', 'Pontocho, Kyoto', 'idea', ARRAY['C', 'M'], 'Atmospheric narrow alley along Kamo River. Many restaurants with riverside seating.', 6);

-- Insert some sample activities
INSERT INTO activities (trip_id, user_name, action, target, created_at) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Camille', 'confirmed reservation at', 'Gion Karyo', NOW() - INTERVAL '5 minutes'),
    ('00000000-0000-0000-0000-000000000001', 'Miguel', 'added', 'Fushimi Inari Shrine', NOW() - INTERVAL '23 minutes'),
    ('00000000-0000-0000-0000-000000000001', 'AI Assistant', 'suggested adding', 'Arashiyama Bamboo Grove', NOW() - INTERVAL '45 minutes'),
    ('00000000-0000-0000-0000-000000000001', 'Camille', 'booked', 'The Machiya Residence', NOW() - INTERVAL '1 hour'),
    ('00000000-0000-0000-0000-000000000001', 'Miguel', 'updated notes for', 'St. Regis Osaka', NOW() - INTERVAL '2 hours');

