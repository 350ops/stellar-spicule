-- Supabase Schema for Trip Planner
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    cover_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip days table
CREATE TABLE IF NOT EXISTS trip_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    day_label TEXT NOT NULL,
    location TEXT,
    day_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itinerary items table
CREATE TABLE IF NOT EXISTS itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_id UUID NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'idea',
    assignees TEXT[] DEFAULT '{}',
    duration TEXT,
    description TEXT,
    confirmation_number TEXT,
    carrier TEXT,
    flight_number TEXT,
    departure_time TEXT,
    arrival_time TEXT,
    departure_location TEXT,
    arrival_location TEXT,
    seat_class TEXT,
    price TEXT,
    booking_url TEXT,
    notes TEXT,
    item_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Map pins table
CREATE TABLE IF NOT EXISTS map_pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    type TEXT NOT NULL,
    day TEXT,
    notes TEXT,
    linked_item_id UUID REFERENCES itinerary_items(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table (for activity feed)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_days_order ON trip_days(trip_id, day_order);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day_id ON itinerary_items(day_id);
CREATE INDEX IF NOT EXISTS idx_map_pins_trip_id ON map_pins(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Enable Row Level Security (optional - can be configured based on auth needs)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes - adjust for production)
CREATE POLICY "Allow all access to trips" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to trip_days" ON trip_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to itinerary_items" ON itinerary_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to map_pins" ON map_pins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_days;
ALTER PUBLICATION supabase_realtime ADD TABLE itinerary_items;
ALTER PUBLICATION supabase_realtime ADD TABLE map_pins;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_items_updated_at
    BEFORE UPDATE ON itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

