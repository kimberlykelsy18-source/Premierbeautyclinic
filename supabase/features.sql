-- ============================================================
-- Premier Beauty Clinic — Features Migration
-- Run once in Supabase SQL Editor
-- ============================================================

-- ── 1. Fix reviews.service_id type (UUID → BIGINT to match services.id) ──────
-- Drop old column and re-add as BIGINT
ALTER TABLE public.reviews DROP COLUMN IF EXISTS service_id;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS service_id BIGINT REFERENCES services(id) ON DELETE CASCADE;

-- Grant access
GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;

-- ── 2. Promo Carousel table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promo_carousel (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  subtitle    TEXT,
  image_url   TEXT        NOT NULL,
  cta_text    TEXT        DEFAULT 'Shop Now',
  cta_link    TEXT        DEFAULT '/shop',
  is_active   BOOLEAN     DEFAULT true,
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.promo_carousel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_active_carousel" ON public.promo_carousel
  FOR SELECT USING (is_active = true);

GRANT ALL ON TABLE public.promo_carousel TO anon;
GRANT ALL ON TABLE public.promo_carousel TO authenticated;
GRANT ALL ON TABLE public.promo_carousel TO service_role;

-- ── 3. Service-Products junction table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_products (
  service_id  BIGINT  REFERENCES public.services(id) ON DELETE CASCADE,
  product_id  BIGINT  REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, product_id)
);

ALTER TABLE public.service_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_service_products" ON public.service_products
  FOR SELECT USING (true);

GRANT ALL ON TABLE public.service_products TO anon;
GRANT ALL ON TABLE public.service_products TO authenticated;
GRANT ALL ON TABLE public.service_products TO service_role;

-- ── 4. Add benefits + results_stat columns to services ────────────────────────
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS benefits     TEXT[]  DEFAULT '{}';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS results_stat TEXT;

-- ── 5. Product category groups + new sub-categories ──────────────────────────
-- Parent categories
INSERT INTO public.categories (name, slug) VALUES
  ('Fragrances',  'fragrances'),
  ('Body Care',   'body-care'),
  ('Wellness',    'wellness')
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories under Fragrances
INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Men''s Perfume',     'mens-perfume',        id FROM public.categories WHERE slug = 'fragrances'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Women''s Perfume',   'womens-perfume',      id FROM public.categories WHERE slug = 'fragrances'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Unisex Fragrance',   'unisex-fragrance',    id FROM public.categories WHERE slug = 'fragrances'
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories under Body Care
INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Body Scrubs',        'body-scrubs',         id FROM public.categories WHERE slug = 'body-care'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Body Lotion',        'body-lotion',         id FROM public.categories WHERE slug = 'body-care'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Body Oil',           'body-oil',            id FROM public.categories WHERE slug = 'body-care'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Body Wash',          'body-wash',           id FROM public.categories WHERE slug = 'body-care'
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories under Wellness
INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Health Supplements', 'health-supplements',  id FROM public.categories WHERE slug = 'wellness'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, parent_id)
  SELECT 'Vitamins & Minerals','vitamins-minerals',   id FROM public.categories WHERE slug = 'wellness'
ON CONFLICT (slug) DO NOTHING;

-- ── 6. products: add product_group to support non-skincare products ───────────
-- product_group: 'skincare' | 'fragrance' | 'body_care' | 'wellness' | 'starter_kits' | null
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_group TEXT;

-- ── 6b. Starter Kits category ─────────────────────────────────────────────────
INSERT INTO public.categories (name, slug) VALUES ('Starter Kits', 'starter-kits')
ON CONFLICT (slug) DO NOTHING;

-- ── 7. service_avg_ratings view ───────────────────────────────────────────────
CREATE OR REPLACE VIEW public.service_avg_ratings AS
SELECT
  s.id AS service_id,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,1) AS average_rating,
  COUNT(r.id) AS rating_count
FROM public.services s
LEFT JOIN public.reviews r ON r.service_id = s.id AND r.status = 'approved'
GROUP BY s.id;

GRANT ALL ON public.service_avg_ratings TO anon;
GRANT ALL ON public.service_avg_ratings TO authenticated;
GRANT ALL ON public.service_avg_ratings TO service_role;

-- ── 8. Seed promo_carousel with 3 starter slides ─────────────────────────────
INSERT INTO public.promo_carousel (title, subtitle, image_url, cta_text, cta_link, sort_order)
VALUES
  ('Glow Starter Kit',       'Complete your skincare routine — 3 steps, one bundle',          'https://images.unsplash.com/photo-1620916566398-39f1686edc5b?w=1080&q=80&auto=format&fit=crop', 'Shop Kits', '/shop',     0),
  ('Brightening Bundle',     'Clinically-proven for hyperpigmentation and dark spots',         'https://images.unsplash.com/photo-1570172619694-1b26a1e0a9b1?w=1080&q=80&auto=format&fit=crop', 'Shop Now',  '/shop',     1),
  ('Professional Treatments','Book a clinical session tailored to your skin concerns',         'https://images.unsplash.com/photo-1616394584738-fc6e612d71a9?w=1080&q=80&auto=format&fit=crop', 'Book Now',  '/services', 2)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================
