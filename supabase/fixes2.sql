-- ============================================================
-- Premier Beauty Clinic — SQL Fixes Part 2
-- Run this in Supabase SQL Editor (once only)
-- ============================================================

-- Add brand column to products
-- This stores the product brand (e.g. 'CeraVe', 'La Roche-Posay', 'Premier')
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand text;

-- Add usage instructions column to products
-- Shown on the ProductDetail page under "How to Use" tab
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS usage_instructions text;

-- ============================================================
-- DONE
-- After running, go to Table Editor → products and you'll see
-- the new 'brand' and 'usage_instructions' columns.
-- ============================================================
