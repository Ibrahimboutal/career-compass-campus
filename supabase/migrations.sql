
-- Function to get employer by user_id
CREATE OR REPLACE FUNCTION public.get_employer_by_user_id(user_id_param UUID)
RETURNS SETOF public.employers
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.employers WHERE user_id = user_id_param;
$$;

-- Function to get employer by id
CREATE OR REPLACE FUNCTION public.get_employer_by_id(employer_id_param UUID)
RETURNS SETOF public.employers
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.employers WHERE id = employer_id_param;
$$;

-- Function to create a new employer
CREATE OR REPLACE FUNCTION public.create_employer(
  user_id_param UUID,
  company_name_param TEXT,
  industry_param TEXT DEFAULT NULL,
  company_size_param TEXT DEFAULT NULL,
  website_param TEXT DEFAULT NULL,
  company_description_param TEXT DEFAULT NULL,
  logo_url_param TEXT DEFAULT NULL
)
RETURNS public.employers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_employer public.employers;
BEGIN
  INSERT INTO public.employers (
    user_id,
    company_name,
    industry,
    company_size,
    website,
    company_description,
    logo_url
  ) VALUES (
    user_id_param,
    company_name_param,
    industry_param,
    company_size_param,
    website_param,
    company_description_param,
    logo_url_param
  )
  RETURNING * INTO new_employer;
  
  RETURN new_employer;
END;
$$;

-- Function to update an employer
CREATE OR REPLACE FUNCTION public.update_employer(
  employer_id_param UUID,
  company_name_param TEXT DEFAULT NULL,
  industry_param TEXT DEFAULT NULL,
  company_size_param TEXT DEFAULT NULL,
  website_param TEXT DEFAULT NULL,
  company_description_param TEXT DEFAULT NULL,
  logo_url_param TEXT DEFAULT NULL
)
RETURNS public.employers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_employer public.employers;
BEGIN
  UPDATE public.employers
  SET 
    company_name = COALESCE(company_name_param, company_name),
    industry = COALESCE(industry_param, industry),
    company_size = COALESCE(company_size_param, company_size),
    website = COALESCE(website_param, website),
    company_description = COALESCE(company_description_param, company_description),
    logo_url = COALESCE(logo_url_param, logo_url),
    updated_at = now()
  WHERE id = employer_id_param
  RETURNING * INTO updated_employer;
  
  RETURN updated_employer;
END;
$$;

-- Function to add notes column to applications table if it doesn't exist
CREATE OR REPLACE FUNCTION public.add_notes_column_to_applications()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if notes column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'applications' 
    AND column_name = 'notes'
    AND table_schema = 'public'
  ) THEN
    -- Add notes column if it doesn't exist
    EXECUTE 'ALTER TABLE public.applications ADD COLUMN notes TEXT DEFAULT NULL';
  END IF;
END;
$$;

