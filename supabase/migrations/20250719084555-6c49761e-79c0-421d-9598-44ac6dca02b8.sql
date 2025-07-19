
-- First, let's create the eligible voters table for 2025
CREATE TABLE public.eligible_voters_2025 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL UNIQUE,
  member_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to track who has already voted (one vote per person)
CREATE TABLE public.voter_submissions_2025 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_name TEXT NOT NULL UNIQUE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_voter_name FOREIGN KEY (voter_name) REFERENCES public.eligible_voters_2025(full_name)
);

-- Update the nominations table to match the new requirements
DROP TABLE IF EXISTS public.nominations CASCADE;
CREATE TABLE public.nominations_2025 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_name TEXT NOT NULL,
  president TEXT NOT NULL,
  tournament_director TEXT NOT NULL,
  hon_legal_adviser TEXT NOT NULL,
  secretary TEXT NOT NULL,
  hon_social_secretary TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_voter_name FOREIGN KEY (voter_name) REFERENCES public.eligible_voters_2025(full_name),
  CONSTRAINT unique_voter_submission UNIQUE (voter_name)
);

-- Update admin_users table to support name-based login instead of email
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS email;
ALTER TABLE public.admin_users ADD COLUMN admin_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.admin_users ADD COLUMN password_hash TEXT;

-- Create super admin record for Anjola Adegbola
INSERT INTO public.admin_users (admin_name, is_super_admin) 
VALUES ('Anjola Adegbola', true)
ON CONFLICT DO NOTHING;

-- Create regular admin records
INSERT INTO public.admin_users (admin_name, is_super_admin) 
VALUES 
  ('Babatunde Oluwafemi Adegbola', false),
  ('Sunday Oluyemi', false),
  ('Wilson Gbenro Olagbegi', false)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.eligible_voters_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_submissions_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominations_2025 ENABLE ROW LEVEL SECURITY;

-- RLS policies for eligible voters (admins can manage, voters can view their own info)
CREATE POLICY "Super admins can manage eligible voters" 
  ON public.eligible_voters_2025 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Eligible voters can view all eligible names for nominations" 
  ON public.eligible_voters_2025 
  FOR SELECT 
  USING (true);

-- RLS policies for voter submissions
CREATE POLICY "Admins can view voter submissions" 
  ON public.voter_submissions_2025 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Eligible voters can create their submission record" 
  ON public.voter_submissions_2025 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for nominations 2025
CREATE POLICY "Eligible voters can submit nominations" 
  ON public.nominations_2025 
  FOR INSERT 
  WITH CHECK (
    voter_name IN (SELECT full_name FROM public.eligible_voters_2025 WHERE is_active = true)
  );

CREATE POLICY "Admins can view all nominations" 
  ON public.nominations_2025 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Function to get nomination statistics
CREATE OR REPLACE FUNCTION public.get_nomination_stats()
RETURNS TABLE(
  position TEXT,
  nominee_name TEXT,
  nomination_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH position_counts AS (
    SELECT 'President' as position, president as nominee_name, COUNT(*) as nomination_count
    FROM public.nominations_2025 GROUP BY president
    UNION ALL
    SELECT 'Tournament Director' as position, tournament_director as nominee_name, COUNT(*) as nomination_count
    FROM public.nominations_2025 GROUP BY tournament_director
    UNION ALL
    SELECT 'Hon. Legal Adviser' as position, hon_legal_adviser as nominee_name, COUNT(*) as nomination_count
    FROM public.nominations_2025 GROUP BY hon_legal_adviser
    UNION ALL
    SELECT 'Secretary' as position, secretary as nominee_name, COUNT(*) as nomination_count
    FROM public.nominations_2025 GROUP BY secretary
    UNION ALL
    SELECT 'Hon. Social Secretary' as position, hon_social_secretary as nominee_name, COUNT(*) as nomination_count
    FROM public.nominations_2025 GROUP BY hon_social_secretary
  )
  SELECT pc.position, pc.nominee_name, pc.nomination_count
  FROM position_counts pc
  ORDER BY pc.position, pc.nomination_count DESC;
END;
$$;

-- Function to get top 9 nominees across all positions (Super Admin only)
CREATE OR REPLACE FUNCTION public.get_top_nominees()
RETURNS TABLE(
  nominee_name TEXT,
  total_nominations BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH all_nominations AS (
    SELECT president as nominee_name FROM public.nominations_2025
    UNION ALL
    SELECT tournament_director as nominee_name FROM public.nominations_2025
    UNION ALL
    SELECT hon_legal_adviser as nominee_name FROM public.nominations_2025
    UNION ALL
    SELECT secretary as nominee_name FROM public.nominations_2025
    UNION ALL
    SELECT hon_social_secretary as nominee_name FROM public.nominations_2025
  )
  SELECT an.nominee_name, COUNT(*) as total_nominations
  FROM all_nominations an
  GROUP BY an.nominee_name
  ORDER BY total_nominations DESC
  LIMIT 9;
END;
$$;

-- Insert the 61 eligible voters (placeholder data - you'll need to replace with actual names)
INSERT INTO public.eligible_voters_2025 (full_name, member_id) VALUES
  ('Anjola Adegbola', 'M001'),
  ('Babatunde Oluwafemi Adegbola', 'M002'),
  ('Sunday Oluyemi', 'M003'),
  ('Wilson Gbenro Olagbegi', 'M004'),
  ('Member Name 5', 'M005'),
  ('Member Name 6', 'M006'),
  ('Member Name 7', 'M007'),
  ('Member Name 8', 'M008'),
  ('Member Name 9', 'M009'),
  ('Member Name 10', 'M010'),
  ('Member Name 11', 'M011'),
  ('Member Name 12', 'M012'),
  ('Member Name 13', 'M013'),
  ('Member Name 14', 'M014'),
  ('Member Name 15', 'M015'),
  ('Member Name 16', 'M016'),
  ('Member Name 17', 'M017'),
  ('Member Name 18', 'M018'),
  ('Member Name 19', 'M019'),
  ('Member Name 20', 'M020'),
  ('Member Name 21', 'M021'),
  ('Member Name 22', 'M022'),
  ('Member Name 23', 'M023'),
  ('Member Name 24', 'M024'),
  ('Member Name 25', 'M025'),
  ('Member Name 26', 'M026'),
  ('Member Name 27', 'M027'),
  ('Member Name 28', 'M028'),
  ('Member Name 29', 'M029'),
  ('Member Name 30', 'M030'),
  ('Member Name 31', 'M031'),
  ('Member Name 32', 'M032'),
  ('Member Name 33', 'M033'),
  ('Member Name 34', 'M034'),
  ('Member Name 35', 'M035'),
  ('Member Name 36', 'M036'),
  ('Member Name 37', 'M037'),
  ('Member Name 38', 'M038'),
  ('Member Name 39', 'M039'),
  ('Member Name 40', 'M040'),
  ('Member Name 41', 'M041'),
  ('Member Name 42', 'M042'),
  ('Member Name 43', 'M043'),
  ('Member Name 44', 'M044'),
  ('Member Name 45', 'M045'),
  ('Member Name 46', 'M046'),
  ('Member Name 47', 'M047'),
  ('Member Name 48', 'M048'),
  ('Member Name 49', 'M049'),
  ('Member Name 50', 'M050'),
  ('Member Name 51', 'M051'),
  ('Member Name 52', 'M052'),
  ('Member Name 53', 'M053'),
  ('Member Name 54', 'M054'),
  ('Member Name 55', 'M055'),
  ('Member Name 56', 'M056'),
  ('Member Name 57', 'M057'),
  ('Member Name 58', 'M058'),
  ('Member Name 59', 'M059'),
  ('Member Name 60', 'M060'),
  ('Member Name 61', 'M061')
ON CONFLICT (full_name) DO NOTHING;
