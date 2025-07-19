
-- First, let's create a security definer function to check if a user is an admin
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  );
$$;

-- Create a function to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND is_super_admin = true
  );
$$;

-- Drop existing problematic policies on admin_users
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Create new policies using the security definer functions
CREATE POLICY "Authenticated users can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Update other table policies to use the new functions
DROP POLICY IF EXISTS "Super admins can manage eligible voters" ON public.eligible_voters_2025;
CREATE POLICY "Super admins can manage eligible voters" 
  ON public.eligible_voters_2025 
  FOR ALL 
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage candidates" ON public.candidates;
CREATE POLICY "Admins can manage candidates" 
  ON public.candidates 
  FOR ALL 
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage name variations" ON public.name_variations;
CREATE POLICY "Admins can manage name variations" 
  ON public.name_variations 
  FOR ALL 
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update nominations" ON public.nominations;
DROP POLICY IF EXISTS "Admins can view all nominations" ON public.nominations;
CREATE POLICY "Admins can view all nominations" 
  ON public.nominations 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can update nominations" 
  ON public.nominations 
  FOR UPDATE 
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view nominations" ON public.nominations_2025;
CREATE POLICY "Admins can view nominations" 
  ON public.nominations_2025 
  FOR SELECT 
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view voter submissions" ON public.voter_submissions_2025;
CREATE POLICY "Admins can view voter submissions" 
  ON public.voter_submissions_2025 
  FOR SELECT 
  USING (public.is_admin());
