ALTER TABLE public.parent_articles ADD COLUMN IF NOT EXISTS about_grade TEXT;
ALTER TABLE public.parent_articles DROP CONSTRAINT IF EXISTS parent_articles_about_grade_check;
ALTER TABLE public.parent_articles ADD CONSTRAINT parent_articles_about_grade_check CHECK (about_grade IS NULL OR about_grade IN ('9','10','11','12','all'));