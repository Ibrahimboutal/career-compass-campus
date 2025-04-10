
-- Function to get employer by id
CREATE OR REPLACE FUNCTION public.get_employer_by_id(employer_id_param UUID)
RETURNS SETOF public.employers
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.employers WHERE id = employer_id_param;
$$;
