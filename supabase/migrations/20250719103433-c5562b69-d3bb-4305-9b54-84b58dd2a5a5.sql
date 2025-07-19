
-- First, let's check if the admin_users table exists and has the correct structure
-- Then ensure all admin users are properly inserted

-- Insert or update admin users to ensure they exist
INSERT INTO public.admin_users (email, is_super_admin) 
VALUES 
  ('anjola@example.com', true),
  ('babatunde@example.com', false),
  ('sunday@example.com', false),
  ('wilson@example.com', false)
ON CONFLICT (email) DO UPDATE SET
  is_super_admin = EXCLUDED.is_super_admin;

-- Verify the data was inserted correctly
SELECT * FROM public.admin_users ORDER BY email;
