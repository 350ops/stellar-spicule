-- Seed data for HyperSpace Trip Planner
-- This creates a sample Japan trip with all the itinerary data

-- First, create the trip
INSERT INTO trips (id, name, description, start_date, end_date, cover_image)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Japan Adventure 2026',
    'A 9-day journey through Japan - Osaka, Kyoto, Nara, and Tokyo',
    '2026-01-18',
    '2026-01-26',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop'
);

-- Create the days
INSERT INTO days (id, trip_id, date, day_label, location, sort_order) VALUES
('d0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2026-01-18', 'Day 1', 'Arrive Osaka', 1),
('d0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '2026-01-19', 'Day 2', 'Osaka (Full Day)', 2),
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '2026-01-20', 'Day 3', 'Osaka → Kyoto', 3),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '2026-01-21', 'Day 4', 'Kyoto (Temples & Bamboo)', 4),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '2026-01-22', 'Day 5', 'Nara Day Trip', 5),
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '2026-01-23', 'Day 6', 'Kyoto → Tokyo', 6),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '2026-01-24', 'Day 7', 'Tokyo (Shibuya & Harajuku)', 7),
('d0000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', '2026-01-25', 'Day 8', 'Tokyo (Asakusa & Akihabara)', 8),
('d0000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', '2026-01-26', 'Day 9', 'Tokyo → Home', 9);

-- Day 1: Arrive Osaka
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, flight_number, carrier, arrival_location, sort_order) VALUES
('d0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '11:30 AM', 'Arrive Kansai Airport', 'Arrival', 'KIX Terminal 1', 'confirmed', NULL, 'Immigration & customs ~45 mins. Pick up Pocket WiFi at arrivals. Get ICOCA cards from JR counter.', ARRAY['C', 'M'], 'JL 060', 'Japan Airlines', 'KIX', 1),
('d0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1:00 PM', 'Nankai Rapi:t to Namba', 'Train', 'KIX → Namba', 'confirmed', '40m', 'Stylish limited express train to central Osaka. Reserved seats in futuristic blue train.', ARRAY['C', 'M'], NULL, NULL, NULL, 2),
('d0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2:00 PM', 'Check-in: The St. Regis Osaka', 'Hotel', 'Midosuji, Osaka', 'confirmed', NULL, 'Luxury hotel on Midosuji Boulevard. Grand Deluxe Room, 20th floor. 2 nights. Butler service included.', ARRAY['C', 'M'], NULL, NULL, NULL, 3),
('d0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4:00 PM', 'Explore Shinsaibashi & Amerikamura', 'Sightseeing', 'Shinsaibashi, Osaka', 'idea', '2h', 'Osaka''s premier shopping arcade. American Village for vintage clothing and street fashion.', ARRAY['C', 'M'], NULL, NULL, NULL, 4),
('d0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '7:00 PM', 'Dinner at Dotonbori', 'Food', 'Dotonbori, Osaka', 'booked', NULL, 'Iconic neon-lit food street! Try takoyaki at Kukuru, okonomiyaki at Mizuno (est. 1945), and end with gyoza at Chao Chao.', ARRAY['C', 'M'], NULL, NULL, NULL, 5);

-- Day 2: Osaka Full Day
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, confirmation_number, sort_order) VALUES
('d0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '9:00 AM', 'Osaka Castle', 'Sightseeing', 'Chuo-ku, Osaka', 'confirmed', '2h', 'Historic castle surrounded by moat and park. ¥600 entry to main tower. Great views from 8th floor observation deck.', ARRAY['C', 'M'], NULL, 1),
('d0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '11:30 AM', 'Kuromon Market', 'Food', 'Nipponbashi, Osaka', 'confirmed', '1h 30m', 'Osaka''s Kitchen - 170+ years old! Fresh seafood, grilled wagyu skewers, and uni. Arrive hungry!', ARRAY['C', 'M'], NULL, 2),
('d0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '1:30 PM', 'Shinsekai District', 'Sightseeing', 'Shinsekai, Osaka', 'idea', '2h', 'Retro neighborhood with Tsutenkaku Tower. Try kushikatsu (deep-fried skewers) - no double-dipping!', ARRAY['C', 'M'], NULL, 3),
('d0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '4:00 PM', 'Spa World', 'Activity', 'Shinsekai, Osaka', 'idea', '3h', 'Huge onsen theme park with baths from around the world. Zones rotate by gender daily. ¥1,500 entry.', ARRAY['C', 'M'], NULL, 4),
('d0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '7:30 PM', 'Dinner at Ajinoya', 'Food', 'Namba, Osaka', 'booked', NULL, 'Best okonomiyaki in Osaka since 1965. Try the specialty mix with pork and squid. Cash only.', ARRAY['C', 'M'], 'AJIN-1901', 5);

-- Day 3: Osaka to Kyoto
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, price, confirmation_number, booking_url, sort_order) VALUES
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '9:30 AM', 'Train to Kyoto', 'Train', 'Osaka → Kyoto', 'confirmed', '30m', 'JR Special Rapid from Osaka Station. Frequent departures every 15 mins.', ARRAY['C', 'M'], '¥570 × 2', NULL, NULL, 1),
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '10:30 AM', 'Check-in: The Machiya Residence', 'Airbnb', 'Gion, Kyoto', 'confirmed', NULL, 'Renovated 100-year-old machiya townhouse. Traditional tatami rooms, private garden. Walking distance to Gion. 3 nights. Host: Yuki-san.', ARRAY['C', 'M'], '¥28,000/night', 'ABNB-MACH-2026', 'https://airbnb.com/rooms/87654321', 2),
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '12:00 PM', 'Lunch at Gion Nanba', 'Food', 'Gion, Kyoto', 'booked', NULL, 'Famous soba restaurant in a traditional townhouse. Try the cold soba with tempura.', ARRAY['C', 'M'], NULL, 'NANBA-2001', NULL, 3),
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '2:00 PM', 'Walk through Gion District', 'Sightseeing', 'Gion, Kyoto', 'confirmed', '2h', 'Explore geisha district. Walk Hanamikoji Street. Might spot a geiko (geisha) or maiko (apprentice).', ARRAY['C', 'M'], NULL, NULL, NULL, 4),
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '4:30 PM', 'Yasaka Shrine', 'Sightseeing', 'Gion, Kyoto', 'idea', '1h', 'Beautiful shrine at the end of Shijo street. Free entry. Great at dusk with lanterns lit.', ARRAY['C', 'M'], NULL, NULL, NULL, 5),
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '7:00 PM', 'Dinner at Gion Karyo', 'Food', 'Gion, Kyoto', 'booked', NULL, 'Traditional kaiseki dinner in private tatami room. Multi-course seasonal menu.', ARRAY['C', 'M'], '¥15,000/person', 'KARYO-2001', NULL, 6);

-- Day 4: Kyoto Temples & Bamboo
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, confirmation_number, price, sort_order) VALUES
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '6:30 AM', 'Fushimi Inari Shrine (Sunrise)', 'Sightseeing', 'Fushimi, Kyoto', 'confirmed', '2h', 'Famous 10,000 vermillion torii gates. Go early to avoid crowds! Hike to the top takes ~2 hours. Free entry.', ARRAY['C', 'M'], NULL, NULL, 1),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '9:30 AM', 'Breakfast at Vermillion Cafe', 'Food', 'Near Fushimi Inari', 'idea', NULL, 'Cute cafe with Inari views. Great coffee and Japanese breakfast set.', ARRAY['C', 'M'], NULL, NULL, 2),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '11:00 AM', 'Kinkaku-ji (Golden Pavilion)', 'Sightseeing', 'Kita, Kyoto', 'confirmed', '1h', 'Iconic gold-leaf covered temple reflected in the pond. Entry: ¥500. Can get crowded midday.', ARRAY['C', 'M'], NULL, NULL, 3),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '1:00 PM', 'Lunch at Shoraian', 'Food', 'Arashiyama, Kyoto', 'booked', NULL, 'Beautiful riverside tofu restaurant. River views from tatami seating.', ARRAY['C', 'M'], 'SHORA-2101', '¥3,500/person', 4),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '2:30 PM', 'Arashiyama Bamboo Grove', 'Sightseeing', 'Arashiyama, Kyoto', 'confirmed', '1h', 'Iconic bamboo forest path. Walk to Tenryu-ji Temple gardens (¥500).', ARRAY['C', 'M'], NULL, NULL, 5),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '4:00 PM', 'Monkey Park Iwatayama', 'Activity', 'Arashiyama, Kyoto', 'idea', '1h 30m', 'Hilltop park with wild Japanese macaques. 20-min uphill walk. ¥550 entry. Great city views.', ARRAY['C', 'M'], NULL, NULL, 6),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '7:00 PM', 'Dinner at Pontocho Alley', 'Food', 'Pontocho, Kyoto', 'idea', NULL, 'Atmospheric narrow alley along Kamo River. Many restaurants with riverside seating.', ARRAY['C', 'M'], NULL, NULL, 7);

-- Day 5: Nara Day Trip
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, price, sort_order) VALUES
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '8:30 AM', 'Train to Nara', 'Train', 'Kyoto → Nara', 'confirmed', '45m', 'JR Nara Line from Kyoto Station. Every 15-20 minutes.', ARRAY['C', 'M'], '¥720 × 2', 1),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '9:30 AM', 'Nara Park & Deer', 'Sightseeing', 'Nara', 'confirmed', '2h', '1,200+ friendly deer roam freely! Buy shika senbei (deer crackers) for ¥200. Bow to the deer, they bow back!', ARRAY['C', 'M'], NULL, 2),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '11:30 AM', 'Todai-ji Temple', 'Sightseeing', 'Nara', 'confirmed', '1h 30m', 'Houses the world''s largest bronze Buddha. Entry: ¥600. Try crawling through the pillar hole for enlightenment!', ARRAY['C', 'M'], NULL, 3),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '1:30 PM', 'Lunch at Mellow Cafe', 'Food', 'Nara', 'idea', NULL, 'Cozy cafe near Nara Park. Great desserts and light lunch options.', ARRAY['C', 'M'], NULL, 4),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '3:00 PM', 'Kasuga Grand Shrine', 'Sightseeing', 'Nara', 'idea', '1h', 'Shinto shrine famous for hundreds of bronze and stone lanterns. Beautiful forest path approach.', ARRAY['C', 'M'], NULL, 5),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '5:00 PM', 'Return to Kyoto', 'Train', 'Nara → Kyoto', 'confirmed', '45m', 'JR Nara Line back to Kyoto.', ARRAY['C', 'M'], '¥720 × 2', 6),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '7:00 PM', 'Dinner at Nishiki Market Area', 'Food', 'Kyoto', 'idea', NULL, 'Explore ''Kyoto''s Kitchen'' - covered market with food stalls. Try matcha desserts, pickles, and street food.', ARRAY['C', 'M'], NULL, 7);

-- Day 6: Kyoto to Tokyo
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, confirmation_number, price, carrier, booking_url, sort_order) VALUES
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '8:00 AM', 'Tea Ceremony Experience', 'Activity', 'Gion, Kyoto', 'booked', '1h 30m', 'Traditional tea ceremony at En teahouse. Learn matcha preparation and etiquette. English explanation provided.', ARRAY['C', 'M'], 'EN-230126', '¥4,500/person', NULL, NULL, 1),
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '10:30 AM', 'Kiyomizu-dera Temple', 'Sightseeing', 'Higashiyama, Kyoto', 'confirmed', '1h 30m', 'Famous wooden temple on hillside with panoramic views. Walk through Ninenzaka and Sannenzaka historic streets. Entry: ¥400.', ARRAY['C', 'M'], NULL, NULL, NULL, NULL, 2),
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '1:00 PM', 'Shinkansen to Tokyo', 'Train', 'Kyoto → Tokyo', 'confirmed', '2h 15m', 'Nozomi bullet train. Reserved seats in car 8. Experience the 285 km/h speed!', ARRAY['C', 'M'], NULL, '¥14,170 × 2', 'JR Tokaido Shinkansen', NULL, 3),
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '4:00 PM', 'Check-in: Park Hyatt Tokyo', 'Hotel', 'Shinjuku, Tokyo', 'confirmed', NULL, 'Park Hyatt Tokyo (Lost in Translation hotel). Park Suite, 52nd floor. 3 nights. Globalist benefits: free breakfast.', ARRAY['C', 'M'], 'PHT-2026-2301', '¥89,000/night', NULL, 'https://hyatt.com', 4),
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '6:00 PM', 'Walk around Shinjuku', 'Sightseeing', 'Shinjuku, Tokyo', 'idea', '1h', 'Explore the neon-lit streets of Shinjuku. See the famous Godzilla head at Toho Cinemas.', ARRAY['C', 'M'], NULL, NULL, NULL, NULL, 5),
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '8:00 PM', 'Dinner at Omoide Yokocho', 'Food', 'Shinjuku, Tokyo', 'booked', NULL, 'Memory Lane yakitori alley near Shinjuku Station west exit. Try Asadachi for grilled chicken skewers. Cash only!', ARRAY['C', 'M'], NULL, NULL, NULL, NULL, 6);

-- Day 7: Tokyo Shibuya & Harajuku
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, confirmation_number, price, sort_order) VALUES
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '8:00 AM', 'Breakfast at New York Grill', 'Food', 'Park Hyatt, 52F', 'confirmed', NULL, 'Included with Globalist status. Amazing city views. Dress code: Smart casual.', ARRAY['C', 'M'], NULL, NULL, 1),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '10:00 AM', 'Meiji Shrine', 'Sightseeing', 'Harajuku, Tokyo', 'confirmed', '1h 30m', 'Tokyo''s most famous Shinto shrine. Walk through the torii gates in the forest. Write wishes on ema wooden plaques.', ARRAY['C', 'M'], NULL, NULL, 2),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '12:00 PM', 'Takeshita Street', 'Sightseeing', 'Harajuku, Tokyo', 'idea', '1h', 'Famous pedestrian shopping street. Try a rainbow cotton candy or crepe. Lots of kawaii shops and vintage stores.', ARRAY['C'], NULL, NULL, 3),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '1:30 PM', 'Lunch at Afuri Ramen', 'Food', 'Harajuku, Tokyo', 'idea', NULL, 'Famous yuzu shio ramen. Usually 20-30 min wait. Vegetarian options available.', ARRAY['C', 'M'], NULL, NULL, 4),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '3:00 PM', 'Shibuya Crossing', 'Sightseeing', 'Shibuya, Tokyo', 'confirmed', '30m', 'World''s busiest pedestrian crossing. Photo from Starbucks 2F or Shibuya Sky rooftop.', ARRAY['C', 'M'], NULL, NULL, 5),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '4:00 PM', 'Shibuya Sky Observation', 'Activity', 'Shibuya Scramble Square', 'booked', '1h 30m', '360° rooftop observation deck on 46th floor. Sunset time slot booked. Great for photos!', ARRAY['C', 'M'], 'SKY-2026-2401', '¥2,000 × 2', 6),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '7:00 PM', 'Dinner at Uobei Sushi', 'Food', 'Shibuya, Tokyo', 'idea', NULL, 'Fun conveyor belt sushi with bullet train delivery. Order via touchscreen. Budget: ¥2,500/person.', ARRAY['C', 'M'], NULL, NULL, 7);

-- Day 8: Tokyo Asakusa & Akihabara
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, confirmation_number, price, sort_order) VALUES
('d0000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', '9:00 AM', 'Senso-ji Temple', 'Sightseeing', 'Asakusa, Tokyo', 'confirmed', '2h', 'Tokyo''s oldest temple. Enter through Kaminarimon gate with giant red lantern. Nakamise shopping street for souvenirs.', ARRAY['C', 'M'], NULL, NULL, 1),
('d0000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', '11:30 AM', 'Kimono Rental Experience', 'Activity', 'Asakusa, Tokyo', 'booked', '4h', 'Wargo Asakusa kimono rental. Includes dressing, hair styling, accessories. Return by 5 PM.', ARRAY['C'], 'WARGO-2501', '¥6,500', 2),
('d0000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', '12:30 PM', 'Lunch at Asakusa Mugitoro', 'Food', 'Asakusa, Tokyo', 'booked', NULL, 'Traditional tororo (grated yam) specialty restaurant since 1929. Reservation for 2.', ARRAY['C', 'M'], 'MUG-250126', NULL, 3),
('d0000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', '3:00 PM', 'Akihabara Electric Town', 'Sightseeing', 'Akihabara, Tokyo', 'idea', '3h', 'Electronics and anime paradise. Visit Yodobashi Camera (8 floors!), Super Potato retro games, and maid cafes.', ARRAY['M'], NULL, NULL, 4),
('d0000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', '7:00 PM', 'Dinner at Gonpachi Nishi-Azabu', 'Food', 'Nishi-Azabu, Tokyo', 'booked', NULL, 'The ''Kill Bill'' restaurant. Traditional robatayaki. Reservation confirmed for 7 PM.', ARRAY['C', 'M'], 'GONP-2026-2501', '~¥8,000/person', 5);

-- Day 9: Tokyo to Home
INSERT INTO itinerary_items (day_id, trip_id, time, title, type, location, status, duration, description, assignees, price, flight_number, carrier, departure_time, arrival_time, departure_location, arrival_location, seat_class, confirmation_number, sort_order) VALUES
('d0000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', '7:30 AM', 'Tsukiji Outer Market Breakfast', 'Food', 'Tsukiji, Tokyo', 'idea', NULL, 'Final Japanese breakfast! Fresh sushi, tamagoyaki (egg), and matcha at the historic outer market.', ARRAY['C', 'M'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
('d0000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', '10:00 AM', 'Last-minute Shopping at Ginza', 'Activity', 'Ginza, Tokyo', 'idea', '1h 30m', 'Final souvenirs at Ginza Six, Itoya stationery, or Don Quijote. Tax-free shopping with passport.', ARRAY['C', 'M'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2),
('d0000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', '12:00 PM', 'Hotel Checkout', 'Hotel', 'Park Hyatt Tokyo', 'info', NULL, 'Leave luggage with concierge for airport transfer.', ARRAY['C', 'M'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3),
('d0000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', '1:30 PM', 'Narita Express to Airport', 'Train', 'Shinjuku → NRT', 'confirmed', '1h 20m', 'N''EX from Shinjuku Station to Narita Airport. Allow 3 hours before flight.', ARRAY['C', 'M'], '¥3,250 × 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4),
('d0000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', '5:55 PM', 'Flight Home - JL 006', 'Departure', 'NRT Terminal 2', 'confirmed', '12h 50m', 'Japan Airlines direct to JFK. Arrives same day 5:45 PM EST. Sayonara, Japan!', ARRAY['C', 'M'], '$2,847 × 2', 'JL 006', 'Japan Airlines', '5:55 PM', '5:45 PM (same day)', 'NRT', 'JFK', 'Premium Economy', 'JALTYO2026CM', 5);

-- Insert some saved places
INSERT INTO places (trip_id, name, location, image, tag, notes) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'teamLab Borderless', 'Azabudai Hills, Tokyo', 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2070&auto=format&fit=crop', 'Art', 'Immersive digital art museum. Book in advance! Allow 2-3 hours. ¥3,800 entry.'),
('550e8400-e29b-41d4-a716-446655440000', 'Fushimi Inari Shrine', 'Kyoto', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=2070&auto=format&fit=crop', 'Sightseeing', 'Go at sunrise to avoid crowds. 10,000 torii gates!'),
('550e8400-e29b-41d4-a716-446655440000', 'Omoide Yokocho', 'Shinjuku, Tokyo', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop', 'Food', 'Memory Lane yakitori alley. Cash only. Great for photos at night.'),
('550e8400-e29b-41d4-a716-446655440000', 'Arashiyama Bamboo Grove', 'Kyoto', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop', 'Nature', 'Best at early morning. Free entry. Rent a kimono nearby!'),
('550e8400-e29b-41d4-a716-446655440000', 'Tsukiji Outer Market', 'Tsukiji, Tokyo', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2069&auto=format&fit=crop', 'Food', 'Opens early AM. Fresh sushi breakfast, tamagoyaki, and street food.'),
('550e8400-e29b-41d4-a716-446655440000', 'Kinkaku-ji Temple', 'Kyoto', 'https://images.unsplash.com/photo-1490761668535-35497054764d?q=80&w=2070&auto=format&fit=crop', 'Sightseeing', 'Golden Pavilion. ¥500 entry. Most photogenic in morning light.');

-- Insert some initial activities
INSERT INTO activities (trip_id, user_name, action, target, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Camille', 'confirmed reservation at', 'Gion Karyo', NOW() - INTERVAL '5 minutes'),
('550e8400-e29b-41d4-a716-446655440000', 'Miguel', 'added', 'Shibuya Sky tickets', NOW() - INTERVAL '23 minutes'),
('550e8400-e29b-41d4-a716-446655440000', 'AI Agent', 'found better price for', 'Narita Express tickets', NOW() - INTERVAL '45 minutes'),
('550e8400-e29b-41d4-a716-446655440000', 'Camille', 'booked tea ceremony at', 'En Teahouse Gion', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440000', 'Miguel', 'updated notes for', 'Park Hyatt Tokyo', NOW() - INTERVAL '2 hours');

