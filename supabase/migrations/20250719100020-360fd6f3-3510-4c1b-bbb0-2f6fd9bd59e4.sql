
-- Create admin_users table if it doesn't exist and populate it with the current admin users
INSERT INTO public.admin_users (email, is_super_admin) 
VALUES 
  ('anjola@example.com', true),
  ('babatunde@example.com', false),
  ('sunday@example.com', false),
  ('wilson@example.com', false)
ON CONFLICT (email) DO NOTHING;

-- Create a function to handle admin authentication
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email text, admin_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record record;
  auth_result json;
BEGIN
  -- Simple password check (in production, use proper hashing)
  IF admin_password != 'admin2025' THEN
    RETURN json_build_object('success', false, 'error', 'Invalid credentials');
  END IF;
  
  -- Check if admin exists
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE email = admin_email;
  
  IF admin_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Admin not found');
  END IF;
  
  -- Return success with admin data
  RETURN json_build_object(
    'success', true,
    'admin', json_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'is_super_admin', admin_record.is_super_admin
    )
  );
END;
$$;

-- Create a function to check if current session user is admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = current_setting('app.current_admin_email', true)
  );
$$;

-- Update the is_admin function to work with session
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    current_user_is_admin(),
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = user_uuid
    )
  );
$$;
