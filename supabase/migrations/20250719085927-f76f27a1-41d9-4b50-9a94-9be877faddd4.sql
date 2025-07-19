
-- Create the eligible_voters_2025 table
CREATE TABLE public.eligible_voters_2025 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  member_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the voter_submissions_2025 table
CREATE TABLE public.voter_submissions_2025 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_name TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the nominations_2025 table
CREATE TABLE public.nominations_2025 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_name TEXT NOT NULL,
  president TEXT NOT NULL,
  tournament_director TEXT NOT NULL,
  hon_legal_adviser TEXT NOT NULL,
  secretary TEXT NOT NULL,
  hon_social_secretary TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.eligible_voters_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_submissions_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominations_2025 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for eligible_voters_2025
CREATE POLICY "Anyone can view active eligible voters" 
  ON public.eligible_voters_2025 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Super admins can manage eligible voters" 
  ON public.eligible_voters_2025 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_super_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_super_admin = true
  ));

-- Create RLS policies for voter_submissions_2025
CREATE POLICY "Anyone can insert voter submissions" 
  ON public.voter_submissions_2025 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view voter submissions" 
  ON public.voter_submissions_2025 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create RLS policies for nominations_2025
CREATE POLICY "Anyone can insert nominations" 
  ON public.nominations_2025 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view nominations" 
  ON public.nominations_2025 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Insert the initial list of eligible voters
INSERT INTO public.eligible_voters_2025 (full_name, member_id) VALUES
('Prof Bola Afolabi', '001'),
('Mrs. Lola Afolabi', '002'),
('HRH Adetayo Haastrup', '003'),
('Dr Sunday Oluyemi', '004'),
('Dr Bolarin Aliyu-Faniyan', '005'),
('Mr. Olalere Babasola', '006'),
('Mrs. Modupe Akinkugbe', '007'),
('HRM Dr. ASK Makinde', '008'),
('Prince Aderinwale Folorusho', '009'),
('Prof Tejudeen Sikiru', '010'),
('Arc Olamilekan Adegbite', '011'),
('Mr. Olusola Babalola', '012'),
('Engr. Olaniyan Bamidele', '013'),
('Chief Dare Bello', '014'),
('Mrs. Oluwatoyin Ilori', '015'),
('Chief Oluwole Aina', '016'),
('Chief (Mrs) Omotayo Aina', '017'),
('Barr. Adekunle Olusegun Adeyemi', '018'),
('Arc Adeyinka Olukayode Ajibade', '019'),
('Mrs. Bose Olafisoye', '020'),
('Mr. Aragbaiye Ade-Young', '021'),
('Prof. Dibu Ojerinde', '022'),
('Mr. Dayo Alao Felix', '023'),
('Senator Olasunkanmi Akinlabi', '024'),
('Mr. Toyin Elegbede', '025'),
('Hon. Gbenga Onigbogi', '026'),
('Dr. (Mrs.) Bola Onigbogi', '027'),
('Dr. Boboye Oyeyemi', '028'),
('Dr. Banjo Obaleye', '029'),
('Prince Adetunji Adeyeye', '030'),
('Mr. Gbenga Olaleye', '031'),
('Bar Ayodeji Olanrewaju Alonge', '032'),
('Mr. Oluwole Owoeye', '033'),
('Mrs. Folasade Olateju', '034'),
('Adebowale Olateju', '035'),
('Bar. Monsuru Olumuyiwa Lawal', '036'),
('Mrs. Abisola Aridunu Niyi-ladipo', '037'),
('Chief Taiwo Adeoluwa', '038'),
('Mr. Segun Adigun', '039'),
('Mr. Olubodun Festus Gbenga', '040'),
('Mr. Laide Mohammed', '041'),
('Dr. Dayo Isreal', '042'),
('Barrister Tola Atoyebi (SAN)', '043'),
('Labode Sowunmi', '044'),
('Engr. Obiniyi Bamidele Johnson', '045'),
('Engr. Muyiwa Oguntoye', '046'),
('Chief Hakeem Akintoye', '047'),
('Bar. Yemi Ayodeji Ayeni', '048'),
('Dr. Lanre Phillips', '049'),
('Mr. Aremu Gabriel Olusegun', '050'),
('Prince Wilson Gbenro Olagbegi', '051'),
('Mr Thomas O Sunday', '052'),
('Mr Adewale Adewusi', '053'),
('Mr Adegbola B.O.S.', '054'),
('Yeye Folake Omoniyi', '055'),
('Mr Abimbola Ajinibi', '056'),
('Mr Okeniyi Adekunle Kamal', '057'),
('Mr Henry Morakinyo', '058'),
('Mr Sola Adebayo', '059'),
('Mr Olusola Ephraim', '060'),
('Ladele Opeyemi Emmanuel', '061'),
('Mr. Babatunde Ojerinde', '062');
