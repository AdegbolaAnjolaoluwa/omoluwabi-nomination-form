
-- Create nominations table to store all nomination data
CREATE TABLE public.nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nominee_name TEXT NOT NULL,
  nominator_name TEXT NOT NULL,
  position TEXT NOT NULL,
  statement_of_purpose TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'merged', 'rejected'))
);

-- Create a normalized candidates table to track unique nominees
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canonical_name TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create name variations table for typo detection
CREATE TABLE public.name_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  variation_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.name_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for nominations (public can insert, admins can view all)
CREATE POLICY "Anyone can create nominations" 
  ON public.nominations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all nominations" 
  ON public.nominations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update nominations" 
  ON public.nominations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS policies for candidates (admins only)
CREATE POLICY "Admins can manage candidates" 
  ON public.candidates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS policies for name variations (admins only)
CREATE POLICY "Admins can manage name variations" 
  ON public.name_variations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS policies for admin users
CREATE POLICY "Admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- Function to calculate Levenshtein distance for typo detection
CREATE OR REPLACE FUNCTION public.levenshtein_distance(s1 TEXT, s2 TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  len1 INT := length(s1);
  len2 INT := length(s2);
  matrix INT[][];
  i INT;
  j INT;
  cost INT;
BEGIN
  -- Initialize matrix
  FOR i IN 0..len1 LOOP
    matrix[i][0] := i;
  END LOOP;
  
  FOR j IN 0..len2 LOOP
    matrix[0][j] := j;
  END LOOP;
  
  -- Fill matrix
  FOR i IN 1..len1 LOOP
    FOR j IN 1..len2 LOOP
      IF substring(s1, i, 1) = substring(s2, j, 1) THEN
        cost := 0;
      ELSE
        cost := 1;
      END IF;
      
      matrix[i][j] := LEAST(
        matrix[i-1][j] + 1,      -- deletion
        matrix[i][j-1] + 1,      -- insertion
        matrix[i-1][j-1] + cost  -- substitution
      );
    END LOOP;
  END LOOP;
  
  RETURN matrix[len1][len2];
END;
$$;

-- Function to find similar names
CREATE OR REPLACE FUNCTION public.find_similar_names(input_name TEXT, position_name TEXT)
RETURNS TABLE(candidate_id UUID, canonical_name TEXT, distance INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.canonical_name,
    public.levenshtein_distance(LOWER(input_name), LOWER(c.canonical_name)) as distance
  FROM public.candidates c
  WHERE 
    c.position = position_name
    AND public.levenshtein_distance(LOWER(input_name), LOWER(c.canonical_name)) <= 2
    AND public.levenshtein_distance(LOWER(input_name), LOWER(c.canonical_name)) > 0
  ORDER BY distance ASC
  LIMIT 5;
END;
$$;

-- Function to process nomination and handle name matching
CREATE OR REPLACE FUNCTION public.process_nomination(
  nominee_name_input TEXT,
  nominator_name_input TEXT,
  position_input TEXT,
  statement_input TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  similar_names RECORD;
  candidate_record RECORD;
  nomination_id UUID;
  result JSON;
BEGIN
  -- Insert the nomination first
  INSERT INTO public.nominations (nominee_name, nominator_name, position, statement_of_purpose)
  VALUES (nominee_name_input, nominator_name_input, position_input, statement_input)
  RETURNING id INTO nomination_id;
  
  -- Check if exact candidate exists
  SELECT * INTO candidate_record
  FROM public.candidates
  WHERE LOWER(canonical_name) = LOWER(nominee_name_input) AND position = position_input;
  
  IF candidate_record IS NOT NULL THEN
    -- Update vote count for existing candidate
    UPDATE public.candidates 
    SET vote_count = vote_count + 1, updated_at = now()
    WHERE id = candidate_record.id;
    
    result := json_build_object(
      'success', true,
      'nomination_id', nomination_id,
      'action', 'vote_added',
      'candidate_id', candidate_record.id,
      'canonical_name', candidate_record.canonical_name
    );
  ELSE
    -- Look for similar names
    SELECT * INTO similar_names
    FROM public.find_similar_names(nominee_name_input, position_input)
    LIMIT 1;
    
    IF similar_names IS NOT NULL THEN
      result := json_build_object(
        'success', true,
        'nomination_id', nomination_id,
        'action', 'similar_found',
        'suggestions', json_build_array(
          json_build_object(
            'candidate_id', similar_names.candidate_id,
            'canonical_name', similar_names.canonical_name,
            'distance', similar_names.distance
          )
        )
      );
    ELSE
      -- Create new candidate
      INSERT INTO public.candidates (canonical_name, position, vote_count)
      VALUES (nominee_name_input, position_input, 1)
      RETURNING id INTO candidate_record;
      
      result := json_build_object(
        'success', true,
        'nomination_id', nomination_id,
        'action', 'new_candidate',
        'candidate_id', candidate_record.id,
        'canonical_name', nominee_name_input
      );
    END IF;
  END IF;
  
  RETURN result;
END;
$$;
