-- ============================================
-- Backfill Script: Create Default Settings for Existing Trips
-- Version: 001
-- ============================================

-- This script creates default trip_settings for any existing trips
-- that don't have settings yet

BEGIN;

-- Insert default settings for trips that don't have them
INSERT INTO trip_settings (
    trip_id,
    timezone,
    currency,
    date_format,
    time_format,
    default_assignees,
    collaborators,
    preferences,
    notifications
)
SELECT
    t.id as trip_id,
    'UTC' as timezone,
    'USD' as currency,
    'MM/DD/YYYY' as date_format,
    '12h' as time_format,
    ARRAY['C', 'M'] as default_assignees,
    '[
        {"name": "Camille", "email": "camille@example.com", "role": "owner", "avatar": "C"},
        {"name": "Miguel", "email": "miguel@example.com", "role": "owner", "avatar": "M"}
    ]'::JSONB as collaborators,
    '{
        "theme": "system",
        "notifications_enabled": true,
        "auto_save": true
    }'::JSONB as preferences,
    '{
        "itinerary_changes": true,
        "budget_updates": true,
        "new_messages": true
    }'::JSONB as notifications
FROM trips t
WHERE NOT EXISTS (
    SELECT 1 FROM trip_settings ts WHERE ts.trip_id = t.id
);

-- Log the number of settings created
DO $$
DECLARE
    settings_created INTEGER;
BEGIN
    GET DIAGNOSTICS settings_created = ROW_COUNT;
    RAISE NOTICE 'Created default settings for % trips', settings_created;
END $$;

COMMIT;

-- ============================================
-- Verify the backfill
-- ============================================

-- Run this to verify all trips now have settings
-- SELECT
--     COUNT(t.id) as total_trips,
--     COUNT(ts.id) as trips_with_settings,
--     COUNT(t.id) - COUNT(ts.id) as missing_settings
-- FROM trips t
-- LEFT JOIN trip_settings ts ON t.id = ts.trip_id;
