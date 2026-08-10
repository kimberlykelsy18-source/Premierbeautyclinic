-- ── Add a size/volume field to products (e.g. "100ml", "50g", "30 capsules") ──
-- Displayed next to the product name across the storefront. Nullable — existing
-- products show no size until an admin fills it in via the dashboard.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size TEXT;
