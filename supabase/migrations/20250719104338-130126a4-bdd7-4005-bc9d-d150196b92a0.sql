
-- Let's add some test nomination data to see if the dashboard displays it correctly
INSERT INTO public.nominations_2025 (voter_name, president, tournament_director, hon_legal_adviser, secretary, hon_social_secretary) VALUES
  ('Anjola Adegbola', 'Babatunde Oluwafemi Adegbola', 'Sunday Oluyemi', 'Wilson Gbenro Olagbegi', 'Anjola Adegbola', 'Babatunde Oluwafemi Adegbola'),
  ('Babatunde Oluwafemi Adegbola', 'Sunday Oluyemi', 'Wilson Gbenro Olagbegi', 'Anjola Adegbola', 'Babatunde Oluwafemi Adegbola', 'Sunday Oluyemi'),
  ('Sunday Oluyemi', 'Wilson Gbenro Olagbegi', 'Anjola Adegbola', 'Babatunde Oluwafemi Adegbola', 'Sunday Oluyemi', 'Wilson Gbenro Olagbegi');

-- Also add corresponding voter submission records
INSERT INTO public.voter_submissions_2025 (voter_name) VALUES
  ('Anjola Adegbola'),
  ('Babatunde Oluwafemi Adegbola'),
  ('Sunday Oluyemi');
