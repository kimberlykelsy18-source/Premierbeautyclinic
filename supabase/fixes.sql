-- ============================================================
-- Premier Beauty Clinic — SQL Fixes
-- Run this entire file in the Supabase SQL editor (once only)
-- ============================================================


-- ============================================================
-- FIX 1: Trigger for handle_new_user
-- Creates a profile row automatically when a new auth user signs up.
-- Without this, customer signup breaks everything downstream.
-- ============================================================

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- FIX 2: get_sales_summary RPC function
-- Called by admin.js: supabase.rpc('get_sales_summary')
-- Returns last 30 days of daily revenue + order/appointment counts.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_sales_summary()
RETURNS TABLE (
  period        date,
  product_revenue     numeric,
  appointment_revenue numeric,
  total_revenue       numeric,
  order_count         bigint,
  appointment_count   bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH daily_orders AS (
    SELECT
      DATE(created_at)  AS day,
      SUM(total)        AS rev,
      COUNT(*)          AS cnt
    FROM public.orders
    WHERE status NOT IN ('cancelled', 'pending')
    GROUP BY DATE(created_at)
  ),
  daily_appointments AS (
    SELECT
      DATE(created_at)    AS day,
      SUM(deposit_amount) AS rev,
      COUNT(*)            AS cnt
    FROM public.appointments
    WHERE status NOT IN ('cancelled', 'pending')
    GROUP BY DATE(created_at)
  )
  SELECT
    COALESCE(o.day, a.day)   AS period,
    COALESCE(o.rev, 0)       AS product_revenue,
    COALESCE(a.rev, 0)       AS appointment_revenue,
    COALESCE(o.rev, 0) + COALESCE(a.rev, 0) AS total_revenue,
    COALESCE(o.cnt, 0)       AS order_count,
    COALESCE(a.cnt, 0)       AS appointment_count
  FROM daily_orders o
  FULL OUTER JOIN daily_appointments a ON o.day = a.day
  ORDER BY period DESC
  LIMIT 30;
END;
$$;

ALTER FUNCTION public.get_sales_summary() OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.get_sales_summary() TO anon;
GRANT EXECUTE ON FUNCTION public.get_sales_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_summary() TO service_role;


-- ============================================================
-- FIX 3: Add missing columns to services table
-- Needed for the Book page UI and dynamic intake forms.
-- ============================================================

-- Service thumbnail/hero images (array of URLs like products)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Hide/show services without deleting them
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Grouping label shown on Book page (e.g. 'Facial', 'Body', 'Waxing')
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category text;

-- Dynamic intake form fields per service.
-- Each element is: { "name": "skin_type", "label": "Skin Type", "type": "select", "options": ["dry","oily","combination"], "required": true }
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS form_fields jsonb DEFAULT '[]';


-- ============================================================
-- FIX 4: Clean up duplicate/overlapping RLS policies on orders
-- Two SELECT policies were doing the same thing.
-- ============================================================

DROP POLICY IF EXISTS "users can view own orders" ON public.orders;

-- The remaining "users_view_own_orders" policy covers the same case
-- plus session_id and null user_id for guest orders. That's sufficient.


-- ============================================================
-- FIX 5: Add GET /services endpoint support — public read RLS
-- Services need to be publicly readable (no auth) for the Book page.
-- ============================================================

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services public read" ON public.services
  FOR SELECT USING (is_active = true);


-- ============================================================
-- DONE — verify by checking:
--   SELECT * FROM public.services LIMIT 1;
--   SELECT * FROM public.get_sales_summary();
-- ============================================================
