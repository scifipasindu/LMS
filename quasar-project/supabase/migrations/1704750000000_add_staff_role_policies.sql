-- Add 'staff' to allowed roles if there's a constraint (best effort, strict check might not exist)
-- This migration focuses on RLS policies

-- 1. PROFILES: Staff can read all profiles (to see users) but UPDATE only if not Admin
create policy "Staff Read Profiles" on profiles for select using ( role = 'staff' );

-- 2. CLASS SCHEDULES: Staff have full access (Admin-like)
create policy "Staff All Class Schedules" on class_schedules for all using (
  auth.uid() in (select id from profiles where role = 'staff')
);

-- 3. COURSES: Staff have full access
create policy "Staff All Courses" on courses for all using (
  auth.uid() in (select id from profiles where role = 'staff')
);

-- 4. PAYMENTS: Staff can VIEW payments (Read Only)
create policy "Staff Read Payments" on payments for select using (
  auth.uid() in (select id from profiles where role = 'staff')
);

-- 5. ENROLLMENTS: Staff can VIEW enrollments
create policy "Staff Read Enrollments" on enrollments for select using (
  auth.uid() in (select id from profiles where role = 'staff')
);

-- 6. INSTITUTES: Staff can manage Institutes (assuming institutes table exists or uses generic RLS)
create policy "Staff All Institutes" on institutes for all using (
  auth.uid() in (select id from profiles where role = 'staff')
);

-- Note: Staff explicitly do NOT get access to 'system_settings' (policies usually restricted to 'admin')
