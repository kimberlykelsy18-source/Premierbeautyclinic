-- ── Reviews system ────────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reviews (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id       INTEGER     REFERENCES products(id) ON DELETE CASCADE,
  -- service_id added as BIGINT by features.sql (services.id is BIGINT)
  reviewer_name    TEXT        NOT NULL,
  reviewer_email   TEXT,
  rating           INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            TEXT        NOT NULL,
  body             TEXT        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'approved', 'rejected')),
  is_verified_purchase BOOLEAN DEFAULT false,
  staff_note       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "read_approved_reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- Anyone can submit a review (backend validates, status defaults to 'pending')
CREATE POLICY "insert_reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Service role client handles admin actions server-side (bypasses RLS)
