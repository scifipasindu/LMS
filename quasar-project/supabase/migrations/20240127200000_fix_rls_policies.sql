-- Fix RLS for Class Schedules
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;

-- 1. READ: Allow everyone (authenticated) to view classes
-- Note: filtering is done on frontend, but RLS should allow access
DROP POLICY IF EXISTS "Enable read access for all users" ON class_schedules;
CREATE POLICY "Enable read access for all users" ON class_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. INSERT: Allow Admins and Teachers
DROP POLICY IF EXISTS "Enable insert for Admins and Teachers" ON class_schedules;
CREATE POLICY "Enable insert for Admins and Teachers" ON class_schedules
  FOR INSERT WITH CHECK (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'teacher')
    )
  );

-- 3. UPDATE/DELETE: Allow Admins and Teachers (own classes or all? Let's say all for simplicity/collaboration)
DROP POLICY IF EXISTS "Enable update/delete for Admins and Teachers" ON class_schedules;
CREATE POLICY "Enable update/delete for Admins and Teachers" ON class_schedules
  FOR ALL USING (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'teacher')
    )
  );

-- Fix RLS for Enrollments (so teachers can enroll students)
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert enrollments for Admins/Teachers" ON enrollments;
CREATE POLICY "Enable insert enrollments for Admins/Teachers" ON enrollments
  FOR INSERT WITH CHECK (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'teacher')
    )
  );

DROP POLICY IF EXISTS "Enable read enrollments for Admins/Teachers" ON enrollments;
CREATE POLICY "Enable read enrollments for Admins/Teachers" ON enrollments
  FOR SELECT USING (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'teacher')
    )
  );
  
-- Also allow students to see their own enrollments
DROP POLICY IF EXISTS "Enable read own enrollments" ON enrollments;
CREATE POLICY "Enable read own enrollments" ON enrollments
  FOR SELECT USING (
    auth.uid() = user_id
  );
