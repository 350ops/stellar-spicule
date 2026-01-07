-- ============================================
-- RBAC (Role-Based Access Control) Policies
-- For Trip Planning Application
-- ============================================

-- This script sets up fine-grained access control based on user roles
-- Roles: owner, editor, viewer
-- Stored in trip_settings.collaborators JSONB field

-- ============================================
-- Helper Functions
-- ============================================

-- Function to check if user is a collaborator with specific role
CREATE OR REPLACE FUNCTION is_trip_collaborator(
  p_trip_id UUID,
  p_user_email TEXT,
  p_required_role TEXT DEFAULT 'viewer'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_collaborators JSONB;
  v_collab JSONB;
  v_user_role TEXT;
BEGIN
  -- Get trip settings
  SELECT collaborators INTO v_collaborators
  FROM trip_settings
  WHERE trip_id = p_trip_id;

  -- If no settings, allow all (backward compatibility)
  IF v_collaborators IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check each collaborator
  FOR v_collab IN SELECT * FROM jsonb_array_elements(v_collaborators)
  LOOP
    IF v_collab->>'email' = p_user_email THEN
      v_user_role := v_collab->>'role';

      -- Check role hierarchy: owner > editor > viewer
      IF p_required_role = 'viewer' THEN
        RETURN v_user_role IN ('owner', 'editor', 'viewer');
      ELSIF p_required_role = 'editor' THEN
        RETURN v_user_role IN ('owner', 'editor');
      ELSIF p_required_role = 'owner' THEN
        RETURN v_user_role = 'owner';
      END IF;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIPS Table Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all access to trips" ON trips;

-- View trips (all collaborators)
CREATE POLICY "Collaborators can view trips"
  ON trips FOR SELECT
  USING (is_trip_collaborator(id, auth.email(), 'viewer'));

-- Update trips (owners and editors)
CREATE POLICY "Editors can update trips"
  ON trips FOR UPDATE
  USING (is_trip_collaborator(id, auth.email(), 'editor'));

-- Delete trips (owners only)
CREATE POLICY "Owners can delete trips"
  ON trips FOR DELETE
  USING (is_trip_collaborator(id, auth.email(), 'owner'));

-- Create trips (authenticated users)
CREATE POLICY "Authenticated users can create trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TRIP_DAYS Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to trip_days" ON trip_days;

CREATE POLICY "Collaborators can view trip days"
  ON trip_days FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

CREATE POLICY "Editors can manage trip days"
  ON trip_days FOR ALL
  USING (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- ============================================
-- ITINERARY_ITEMS Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to itinerary_items" ON itinerary_items;

CREATE POLICY "Collaborators can view itinerary items"
  ON itinerary_items FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

CREATE POLICY "Editors can manage itinerary items"
  ON itinerary_items FOR ALL
  USING (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- ============================================
-- NOTES Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to notes" ON notes;

-- View notes (all collaborators)
CREATE POLICY "Collaborators can view notes"
  ON notes FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

-- Create notes (editors)
CREATE POLICY "Editors can create notes"
  ON notes FOR INSERT
  WITH CHECK (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- Update notes (editors)
CREATE POLICY "Editors can update notes"
  ON notes FOR UPDATE
  USING (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- Delete notes (editors can delete their own, owners can delete all)
CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (
    is_trip_collaborator(trip_id, auth.email(), 'editor')
    AND (created_by = auth.email() OR is_trip_collaborator(trip_id, auth.email(), 'owner'))
  );

-- ============================================
-- EXPENSES Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to expenses" ON expenses;

-- View expenses (all collaborators)
CREATE POLICY "Collaborators can view expenses"
  ON expenses FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

-- Create expenses (editors)
CREATE POLICY "Editors can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- Update expenses (editors)
CREATE POLICY "Editors can update expenses"
  ON expenses FOR UPDATE
  USING (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- Delete expenses (editors)
CREATE POLICY "Editors can delete expenses"
  ON expenses FOR DELETE
  USING (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- ============================================
-- FILES Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to files" ON files;

-- View files (all collaborators)
CREATE POLICY "Collaborators can view files"
  ON files FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

-- Upload files (editors)
CREATE POLICY "Editors can upload files"
  ON files FOR INSERT
  WITH CHECK (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- Delete files (editors can delete their own, owners can delete all)
CREATE POLICY "Users can delete their own files"
  ON files FOR DELETE
  USING (
    is_trip_collaborator(trip_id, auth.email(), 'editor')
    AND (uploaded_by = auth.email() OR is_trip_collaborator(trip_id, auth.email(), 'owner'))
  );

-- ============================================
-- TRIP_SETTINGS Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to trip_settings" ON trip_settings;

-- View settings (all collaborators)
CREATE POLICY "Collaborators can view trip settings"
  ON trip_settings FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

-- Create settings (editors, when creating new trip)
CREATE POLICY "Editors can create trip settings"
  ON trip_settings FOR INSERT
  WITH CHECK (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- Update settings (owners only)
CREATE POLICY "Owners can update trip settings"
  ON trip_settings FOR UPDATE
  USING (is_trip_collaborator(trip_id, auth.email(), 'owner'));

-- Delete settings (owners only)
CREATE POLICY "Owners can delete trip settings"
  ON trip_settings FOR DELETE
  USING (is_trip_collaborator(trip_id, auth.email(), 'owner'));

-- ============================================
-- MAP_PINS Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to map_pins" ON map_pins;

CREATE POLICY "Collaborators can view map pins"
  ON map_pins FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

CREATE POLICY "Editors can manage map pins"
  ON map_pins FOR ALL
  USING (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- ============================================
-- ACTIVITIES Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow all access to activities" ON activities;

-- View activities (all collaborators)
CREATE POLICY "Collaborators can view activities"
  ON activities FOR SELECT
  USING (is_trip_collaborator(trip_id, auth.email(), 'viewer'));

-- Create activities (system/editors for logging)
CREATE POLICY "Editors can create activities"
  ON activities FOR INSERT
  WITH CHECK (is_trip_collaborator(trip_id, auth.email(), 'editor'));

-- ============================================
-- Storage Policies (for file uploads)
-- ============================================

-- Create bucket if doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-files', 'trip-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for trip-files bucket
CREATE POLICY "Collaborators can view files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'trip-files'
    AND EXISTS (
      SELECT 1 FROM files f
      WHERE f.storage_path = name
      AND is_trip_collaborator(f.trip_id, auth.email(), 'viewer')
    )
  );

CREATE POLICY "Editors can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trip-files'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Editors can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'trip-files'
    AND EXISTS (
      SELECT 1 FROM files f
      WHERE f.storage_path = name
      AND is_trip_collaborator(f.trip_id, auth.email(), 'editor')
      AND (f.uploaded_by = auth.email() OR is_trip_collaborator(f.trip_id, auth.email(), 'owner'))
    )
  );

-- ============================================
-- Audit Trigger for Sensitive Operations
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL,
  user_email TEXT,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (trip_id, user_email, table_name, operation, old_data)
    VALUES (OLD.trip_id, auth.email(), TG_TABLE_NAME, TG_OP, row_to_json(OLD)::JSONB);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (trip_id, user_email, table_name, operation, old_data, new_data)
    VALUES (NEW.trip_id, auth.email(), TG_TABLE_NAME, TG_OP, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_trip_settings_changes ON trip_settings;
CREATE TRIGGER audit_trip_settings_changes
  AFTER UPDATE OR DELETE ON trip_settings
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_expense_changes ON expenses;
CREATE TRIGGER audit_expense_changes
  AFTER UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_changes();

-- ============================================
-- Grant Permissions
-- ============================================

-- Grant execute on helper function to authenticated users
GRANT EXECUTE ON FUNCTION is_trip_collaborator TO authenticated;

-- ============================================
-- Migration Notes
-- ============================================

-- To migrate existing data to use RBAC:
-- 1. Run this script in Supabase SQL Editor
-- 2. Update trip_settings for existing trips with default collaborators
-- 3. Test with different user roles
-- 4. Monitor audit_log for any issues

-- Example: Set up collaborators for a trip
-- UPDATE trip_settings
-- SET collaborators = '[
--   {"name": "Camille", "email": "camille@example.com", "role": "owner"},
--   {"name": "Miguel", "email": "miguel@example.com", "role": "editor"}
-- ]'::JSONB
-- WHERE trip_id = 'your-trip-id';

COMMENT ON FUNCTION is_trip_collaborator IS 'Check if user has required role for trip access';
COMMENT ON TABLE audit_log IS 'Audit trail for sensitive data changes';
