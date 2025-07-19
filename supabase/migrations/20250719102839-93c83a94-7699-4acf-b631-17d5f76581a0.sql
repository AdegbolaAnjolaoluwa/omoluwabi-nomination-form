
-- First, let's make sure we have all admin users properly inserted into the admin_users table
-- This will handle the case where they might not exist yet

INSERT INTO public.admin_users (email, is_super_admin) 
VALUES 
  ('anjola@example.com', true),
  ('babatunde@example.com', false),
  ('sunday@example.com', false),
  ('wilson@example.com', false)
ON CONFLICT (email) DO UPDATE SET
  is_super_admin = EXCLUDED.is_super_admin;

-- Let's also create a view that shows all admin users with their details
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
    id,
    email,
    is_super_admin,
    created_at,
    CASE 
        WHEN email = 'anjola@example.com' THEN 'Anjola Adegbola'
        WHEN email = 'babatunde@example.com' THEN 'Babatunde Oluwafemi Adegbola'
        WHEN email = 'sunday@example.com' THEN 'Sunday Oluyemi'
        WHEN email = 'wilson@example.com' THEN 'Wilson Gbenro Olagbegi'
        ELSE 'Unknown Admin'
    END as full_name
FROM public.admin_users;
