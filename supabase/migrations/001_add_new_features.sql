-- ============================================
-- Migration: Add New Features (Notes, Settings, Expenses, Files)
-- Version: 001
-- Date: 2026-01-07
-- ============================================

-- This migration adds support for:
-- - Collaborative notes
-- - Trip settings and preferences
-- - Expense tracking and budget management
-- - File uploads and management

BEGIN;

-- ============================================
-- Notes Table
-- ============================================

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    color TEXT,
    icon TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_by TEXT,
    last_edited_by TEXT,
    note_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT notes_title_not_empty CHECK (char_length(title) > 0)
);

-- Indexes for notes
CREATE INDEX IF NOT EXISTS idx_notes_trip_id ON notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_notes_order ON notes(trip_id, note_order);
CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(trip_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(trip_id, category);

-- ============================================
-- Trip Settings Table
-- ============================================

CREATE TABLE IF NOT EXISTS trip_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE UNIQUE,
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h',
    default_assignees TEXT[] DEFAULT '{}',
    collaborators JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT trip_settings_unique_trip_id UNIQUE (trip_id),
    CONSTRAINT trip_settings_valid_time_format CHECK (time_format IN ('12h', '24h')),
    CONSTRAINT trip_settings_valid_currency CHECK (char_length(currency) = 3)
);

-- Indexes for trip_settings
CREATE INDEX IF NOT EXISTS idx_trip_settings_trip_id ON trip_settings(trip_id);

-- ============================================
-- Expenses Table
-- ============================================

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    paid_by TEXT NOT NULL,
    split_with TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    payment_method TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT expenses_positive_amount CHECK (amount > 0),
    CONSTRAINT expenses_valid_currency CHECK (char_length(currency) = 3),
    CONSTRAINT expenses_description_not_empty CHECK (char_length(description) > 0),
    CONSTRAINT expenses_valid_category CHECK (category IN (
        'Flights', 'Hotel', 'Transport', 'Food', 'Activities', 'Shopping', 'Other'
    ))
);

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(trip_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(trip_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(trip_id, paid_by);

-- ============================================
-- Files Table
-- ============================================

CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    uploaded_by TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT files_name_not_empty CHECK (char_length(name) > 0),
    CONSTRAINT files_positive_size CHECK (file_size IS NULL OR file_size > 0),
    CONSTRAINT files_valid_category CHECK (category IN ('images', 'documents', 'other'))
);

-- Indexes for files
CREATE INDEX IF NOT EXISTS idx_files_trip_id ON files(trip_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(trip_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(trip_id, category);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(trip_id, uploaded_by);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Temporary permissive policies (replace with RBAC later)
CREATE POLICY "Enable all access for authenticated users - notes"
    ON notes FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users - trip_settings"
    ON trip_settings FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users - expenses"
    ON expenses FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users - files"
    ON files FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Realtime Subscriptions
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE files;

-- ============================================
-- Triggers for Updated At
-- ============================================

-- Notes trigger
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trip Settings trigger
CREATE TRIGGER update_trip_settings_updated_at
    BEFORE UPDATE ON trip_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Expenses trigger
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE notes IS 'Collaborative notes for trip planning';
COMMENT ON TABLE trip_settings IS 'Trip-wide settings and collaborator management';
COMMENT ON TABLE expenses IS 'Expense tracking with automatic split calculations';
COMMENT ON TABLE files IS 'File storage metadata for uploaded documents and images';

COMMENT ON COLUMN notes.is_favorite IS 'Star/favorite flag for quick access';
COMMENT ON COLUMN notes.note_order IS 'Custom sort order for notes';
COMMENT ON COLUMN trip_settings.collaborators IS 'JSONB array of collaborator objects with roles';
COMMENT ON COLUMN expenses.split_with IS 'Array of user names to split expense with';
COMMENT ON COLUMN files.storage_path IS 'Path in Supabase Storage bucket';

-- ============================================
-- Version Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_migrations (version, description)
VALUES ('001', 'Add notes, trip_settings, expenses, and files tables')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================
-- Rollback Script (save separately as needed)
-- ============================================

-- To rollback this migration:
-- BEGIN;
-- DROP TABLE IF EXISTS files CASCADE;
-- DROP TABLE IF EXISTS expenses CASCADE;
-- DROP TABLE IF EXISTS trip_settings CASCADE;
-- DROP TABLE IF EXISTS notes CASCADE;
-- DELETE FROM schema_migrations WHERE version = '001';
-- COMMIT;
