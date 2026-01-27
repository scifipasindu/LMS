-- Add 'expires_at' column to class_schedules
ALTER TABLE class_schedules ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE NULL;

-- Comment: If expires_at is NULL, the class never expires (manual delete only).
-- If set, the class should be hidden from the list after this time.
