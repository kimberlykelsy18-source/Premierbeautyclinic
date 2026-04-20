-- ── fixes5.sql — Run in Supabase SQL Editor ───────────────────────────────────

-- 1. Generate slugs for any services that have null or empty slug
UPDATE public.services
SET slug = lower(
  regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- 2. Ensure slug column has a unique index (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key ON public.services(slug);

-- 3. Drop and recreate service_avg_ratings view to ensure FK is recognised by PostgREST
DROP VIEW IF EXISTS public.service_avg_ratings;
CREATE OR REPLACE VIEW public.service_avg_ratings AS
SELECT
  s.id AS service_id,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,1) AS average_rating,
  COUNT(r.id) AS rating_count
FROM public.services s
LEFT JOIN public.reviews r ON r.service_id = s.id AND r.status = 'approved'
GROUP BY s.id;

GRANT SELECT ON public.service_avg_ratings TO anon;
GRANT SELECT ON public.service_avg_ratings TO authenticated;
GRANT SELECT ON public.service_avg_ratings TO service_role;
