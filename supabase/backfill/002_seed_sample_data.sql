-- ============================================
-- Backfill Script: Seed Sample Data for Testing
-- Version: 002
-- ============================================

-- This script populates sample notes, expenses, and files for testing
-- Only runs if trip exists and tables are empty

BEGIN;

-- Sample data will be added for a specific trip
-- Replace 'YOUR_TRIP_ID' with actual trip ID or use a variable

DO $$
DECLARE
    v_trip_id UUID;
    v_note_id1 UUID;
    v_note_id2 UUID;
    v_note_id3 UUID;
BEGIN
    -- Get the first trip (or specify one)
    SELECT id INTO v_trip_id FROM trips LIMIT 1;

    IF v_trip_id IS NULL THEN
        RAISE NOTICE 'No trips found. Skipping sample data seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding sample data for trip: %', v_trip_id;

    -- ============================================
    -- Sample Notes
    -- ============================================

    IF NOT EXISTS (SELECT 1 FROM notes WHERE trip_id = v_trip_id) THEN
        -- Packing List Note
        INSERT INTO notes (id, trip_id, title, content, category, is_favorite, note_order, created_by)
        VALUES (
            uuid_generate_v4(),
            v_trip_id,
            'Packing List',
            E'# Packing List\n\n## Essentials\n- Passport\n- Travel insurance documents\n- Credit cards & cash\n- Phone & chargers\n\n## Clothing\n- Winter coat & layers\n- Comfortable walking shoes\n- Snow boots (for Niseko)\n- Formal outfit for nice restaurants\n\n## Electronics\n- Power adapter (Type A for Japan)\n- Camera & extra batteries\n- Portable charger\n\n## Other\n- Medications\n- Toiletries\n- JR Pass voucher',
            'planning',
            true,
            0,
            'Camille'
        ) RETURNING id INTO v_note_id1;

        -- Food Research Note
        INSERT INTO notes (id, trip_id, title, content, category, is_favorite, note_order, created_by)
        VALUES (
            uuid_generate_v4(),
            v_trip_id,
            'Food Research',
            E'# Must-Try Foods in Japan\n\n## Tokyo\n- Tsukiji Outer Market - fresh sushi breakfast\n- Omoide Yokocho - yakitori street\n- Ichiran Ramen - solo ramen experience\n- Nakameguro - trendy cafes\n\n## Kyoto\n- Nishiki Market - food hall\n- Kaiseki dinner - traditional multi-course\n- Matcha everything\n\n## Osaka\n- Dotonbori - street food heaven\n- Takoyaki & Okonomiyaki\n- Kushikatsu (fried skewers)',
            'food',
            true,
            1,
            'Miguel'
        ) RETURNING id INTO v_note_id2;

        -- Travel Insurance Note
        INSERT INTO notes (id, trip_id, title, content, category, is_favorite, note_order, created_by)
        VALUES (
            uuid_generate_v4(),
            v_trip_id,
            'Travel Insurance',
            E'# Travel Insurance Info\n\nProvider: World Nomads\nPolicy #: WN-2026-123456\n\nCoverage:\n- Medical: $100,000\n- Trip cancellation: $5,000\n- Baggage loss: $2,000\n- Emergency evacuation: $500,000\n\nEmergency Contact: +1-555-TRAVEL-HELP',
            'documents',
            false,
            2,
            'Camille'
        ) RETURNING id INTO v_note_id3;

        RAISE NOTICE 'Created % sample notes', 3;
    END IF;

    -- ============================================
    -- Sample Expenses
    -- ============================================

    IF NOT EXISTS (SELECT 1 FROM expenses WHERE trip_id = v_trip_id) THEN
        -- Flight expense
        INSERT INTO expenses (trip_id, category, description, amount, currency, paid_by, split_with, date, payment_method)
        VALUES (
            v_trip_id,
            'Flights',
            'JFK - NRT Roundtrip',
            2400.00,
            'USD',
            'Miguel',
            ARRAY['Miguel', 'Camille'],
            '2026-01-05',
            'Credit Card'
        );

        -- Hotel expense
        INSERT INTO expenses (trip_id, category, description, amount, currency, paid_by, split_with, date, payment_method)
        VALUES (
            v_trip_id,
            'Hotel',
            'Hyatt Regency (3 nights)',
            850.00,
            'USD',
            'Camille',
            ARRAY['Miguel', 'Camille'],
            '2026-01-10',
            'Credit Card'
        );

        -- Transport expense
        INSERT INTO expenses (trip_id, category, description, amount, currency, paid_by, split_with, date, payment_method)
        VALUES (
            v_trip_id,
            'Transport',
            'JR Pass (7 days)',
            600.00,
            'USD',
            'Camille',
            ARRAY['Miguel', 'Camille'],
            '2026-01-12',
            'Online'
        );

        -- Food expense
        INSERT INTO expenses (trip_id, category, description, amount, currency, paid_by, split_with, date, payment_method)
        VALUES (
            v_trip_id,
            'Food',
            'Dinner at Omoide Yokocho',
            120.00,
            'USD',
            'Miguel',
            ARRAY['Miguel', 'Camille'],
            '2026-01-18',
            'Cash'
        );

        RAISE NOTICE 'Created % sample expenses', 4;
    END IF;

    -- ============================================
    -- Sample Files Metadata
    -- ============================================

    IF NOT EXISTS (SELECT 1 FROM files WHERE trip_id = v_trip_id) THEN
        -- Flight confirmation
        INSERT INTO files (trip_id, name, file_type, file_size, storage_path, url, category, uploaded_by, description)
        VALUES (
            v_trip_id,
            'Flight Confirmation.pdf',
            'application/pdf',
            1228800,
            v_trip_id || '/flight-confirmation.pdf',
            '/files/flight-confirmation.pdf',
            'documents',
            'Miguel',
            'JFK to NRT flight confirmation'
        );

        -- Hotel booking
        INSERT INTO files (trip_id, name, file_type, file_size, storage_path, url, category, uploaded_by, description)
        VALUES (
            v_trip_id,
            'Hotel Booking.pdf',
            'application/pdf',
            870400,
            v_trip_id || '/hotel-booking.pdf',
            '/files/hotel-booking.pdf',
            'documents',
            'Camille',
            'Hyatt Regency booking confirmation'
        );

        -- Inspiration images
        INSERT INTO files (trip_id, name, file_type, file_size, storage_path, url, category, uploaded_by)
        VALUES
            (v_trip_id, 'Inspiration_1.jpg', 'image/jpeg', 3565158, v_trip_id || '/inspiration-1.jpg', '/files/inspiration-1.jpg', 'images', 'Camille'),
            (v_trip_id, 'Inspiration_2.jpg', 'image/jpeg', 2202010, v_trip_id || '/inspiration-2.jpg', '/files/inspiration-2.jpg', 'images', 'Miguel');

        -- Visa requirements
        INSERT INTO files (trip_id, name, file_type, file_size, storage_path, url, category, uploaded_by, description)
        VALUES (
            v_trip_id,
            'Visa Requirements.docx',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            15360,
            v_trip_id || '/visa-requirements.docx',
            '/files/visa-requirements.docx',
            'documents',
            'Camille',
            'Visa requirements for Japan'
        );

        RAISE NOTICE 'Created % sample file records', 5;
    END IF;

    RAISE NOTICE 'Sample data seeding complete for trip %', v_trip_id;
END $$;

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================

-- Verify data was created
-- SELECT
--     'Notes' as table_name,
--     COUNT(*) as record_count
-- FROM notes
-- UNION ALL
-- SELECT 'Expenses', COUNT(*) FROM expenses
-- UNION ALL
-- SELECT 'Files', COUNT(*) FROM files;
