
-- Fix RLS policies for nominations_2025 and voter_submissions_2025 tables
-- The current policies might be too restrictive

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Admins can view nominations" ON public.nominations_2025;
DROP POLICY IF EXISTS "Anyone can insert nominations" ON public.nominations_2025;
DROP POLICY IF EXISTS "Admins can view voter submissions" ON public.voter_submissions_2025;
DROP POLICY IF EXISTS "Anyone can insert voter submissions" ON public.voter_submissions_2025;

-- Create proper policies for nominations_2025
CREATE POLICY "Admins can view all nominations_2025" 
  ON public.nominations_2025 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert nominations_2025" 
  ON public.nominations_2025 
  FOR INSERT 
  WITH CHECK (true);

-- Create proper policies for voter_submissions_2025  
CREATE POLICY "Admins can view all voter_submissions_2025" 
  ON public.voter_submissions_2025 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert voter_submissions_2025" 
  ON public.voter_submissions_2025 
  FOR INSERT 
  WITH CHECK (true);

-- Also ensure that the foreign key constraint doesn't prevent insertions
-- Remove the foreign key constraint that might be causing issues
ALTER TABLE public.voter_submissions_2025 DROP CONSTRAINT IF EXISTS fk_voter_name;
ALTER TABLE public.nominations_2025 DROP CONSTRAINT IF EXISTS fk_voter_name;

-- Add the foreign key constraints back but make them more flexible
ALTER TABLE public.voter_submissions_2025 
ADD CONSTRAINT fk_voter_name_2025 
FOREIGN KEY (voter_name) REFERENCES public.eligible_voters_2025(full_name) 
ON DELETE CASCADE;

ALTER TABLE public.nominations_2025 
ADD CONSTRAINT fk_voter_name_2025 
FOREIGN KEY (voter_name) REFERENCES public.eligible_voters_2025(full_name) 
ON DELETE CASCADE;
