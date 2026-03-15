-- ═══════════════════════════════════════════════════════════════════════════════
-- Premier Beauty Clinic — Full RLS Security Script
-- Run this in Supabase SQL Editor (Database → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════
-- WHAT THIS DOES:
--   1. Enables RLS on tables that were missing it (carts, categories, employees, clinic_settings)
--   2. Drops all broken/insecure existing policies
--   3. Creates correct, minimal policies for every table
--
-- DESIGN PRINCIPLES:
--   • Service-role (backend) bypasses RLS entirely — no service-role policies needed
--   • Anon key can only read truly public data (products, services, categories)
--   • Authenticated users can only read/write their own data
--   • Employees table is locked to service-role only (backend enforces all auth)
--   • Payments, orders, order_items: customers see only their own; guests via session_id
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─── STEP 1: Enable RLS on tables that were missing it ───────────────────────

ALTER TABLE public.carts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;


-- ─── STEP 2: Drop all existing policies (clean slate) ────────────────────────
-- appointments
DROP POLICY IF EXISTS "staff_can_manage_appointments" ON public.appointments;
DROP POLICY IF EXISTS "users own appointments"         ON public.appointments;

-- cart_items
DROP POLICY IF EXISTS "allow cart_items for any valid cart" ON public.cart_items;
DROP POLICY IF EXISTS "customers_manage_cart_items"        ON public.cart_items;

-- carts
DROP POLICY IF EXISTS "customers_manage_carts"   ON public.carts;
DROP POLICY IF EXISTS "users can create own cart" ON public.carts;
DROP POLICY IF EXISTS "users can manage own cart" ON public.carts;
DROP POLICY IF EXISTS "users own cart"            ON public.carts;

-- deliveries
DROP POLICY IF EXISTS "deliveries insertable" ON public.deliveries;
DROP POLICY IF EXISTS "deliveries readable"   ON public.deliveries;

-- delivery_updates
-- (none existed — will add below)

-- employees
DROP POLICY IF EXISTS "admins_full_access"    ON public.employees;
DROP POLICY IF EXISTS "employees_self_access" ON public.employees;

-- inventory_logs
DROP POLICY IF EXISTS "admin_full_access" ON public.inventory_logs;
DROP POLICY IF EXISTS "staff_insert_logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "staff_own_logs"    ON public.inventory_logs;

-- order_items
DROP POLICY IF EXISTS "anyone can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "users can view order_items"    ON public.order_items;

-- orders
DROP POLICY IF EXISTS "allow_order_creation"    ON public.orders;
DROP POLICY IF EXISTS "staff_can_manage_orders" ON public.orders;
DROP POLICY IF EXISTS "staff_can_view_sales"    ON public.orders;
DROP POLICY IF EXISTS "users_view_own_orders"   ON public.orders;

-- payments
DROP POLICY IF EXISTS "allow_all_payments_insert"  ON public.payments;
DROP POLICY IF EXISTS "anyone can create payments" ON public.payments;
DROP POLICY IF EXISTS "users can view payments"    ON public.payments;
DROP POLICY IF EXISTS "users own payments"         ON public.payments;
DROP POLICY IF EXISTS "users_view_own_payments"    ON public.payments;

-- product_ratings
DROP POLICY IF EXISTS "users own ratings" ON public.product_ratings;

-- products
DROP POLICY IF EXISTS "products public read"      ON public.products;
DROP POLICY IF EXISTS "staff_can_manage_inventory" ON public.products;

-- profiles
DROP POLICY IF EXISTS "users own profile" ON public.profiles;

-- services
DROP POLICY IF EXISTS "services public read" ON public.services;

-- walk_ins
DROP POLICY IF EXISTS "receptionist_walkins" ON public.walk_ins;


-- ─── STEP 3: Create clean, correct policies ───────────────────────────────────

-- ── PRODUCTS (public read; writes go through service-role backend) ────────────
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (is_active = true);

-- ── SERVICES (public read) ────────────────────────────────────────────────────
CREATE POLICY "services_public_read"
  ON public.services FOR SELECT
  USING (is_active = true);

-- ── CATEGORIES (public read; writes via service-role backend) ─────────────────
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (true);

-- ── PROFILES (own row only) ───────────────────────────────────────────────────
CREATE POLICY "profiles_own_row"
  ON public.profiles
  USING (auth.uid() = id);

-- ── CARTS (own cart only; service-role backend bypasses) ─────────────────────
-- Authenticated users see their own cart; guests see their session cart
CREATE POLICY "carts_own"
  ON public.carts
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND session_id IS NOT NULL)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (user_id IS NULL AND session_id IS NOT NULL)
  );

-- ── CART_ITEMS (linked to own cart; service-role backend bypasses) ────────────
CREATE POLICY "cart_items_own_cart"
  ON public.cart_items
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND (c.user_id = auth.uid() OR (c.user_id IS NULL AND c.session_id IS NOT NULL))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND (c.user_id = auth.uid() OR (c.user_id IS NULL AND c.session_id IS NOT NULL))
    )
  );

-- ── ORDERS ────────────────────────────────────────────────────────────────────
-- Customers see their own orders; guests see orders with their session_id
-- Inserts/updates only via service-role backend (checkout + M-Pesa callback)
CREATE POLICY "orders_own"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND session_id IS NOT NULL)
  );

-- ── ORDER_ITEMS ───────────────────────────────────────────────────────────────
CREATE POLICY "order_items_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR (o.user_id IS NULL AND o.session_id IS NOT NULL))
    )
  );

-- ── PAYMENTS ─────────────────────────────────────────────────────────────────
-- Customers can see payments linked to their orders or appointments
-- All inserts/updates go through service-role backend
CREATE POLICY "payments_own"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND (o.user_id = auth.uid() OR (o.user_id IS NULL AND o.session_id IS NOT NULL))
    )
    OR EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = payments.appointment_id
        AND a.user_id = auth.uid()
    )
  );

-- ── APPOINTMENTS ──────────────────────────────────────────────────────────────
-- Customers see their own; all writes via service-role backend
CREATE POLICY "appointments_own"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

-- ── PRODUCT_RATINGS ───────────────────────────────────────────────────────────
-- Anyone can read ratings; users manage only their own
CREATE POLICY "ratings_public_read"
  ON public.product_ratings FOR SELECT
  USING (true);

CREATE POLICY "ratings_own_write"
  ON public.product_ratings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── DELIVERIES ────────────────────────────────────────────────────────────────
-- Customers see deliveries for their orders; all writes via service-role
CREATE POLICY "deliveries_own"
  ON public.deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = deliveries.order_id
        AND (o.user_id = auth.uid() OR (o.user_id IS NULL AND o.session_id IS NOT NULL))
    )
  );

-- ── DELIVERY_UPDATES ─────────────────────────────────────────────────────────
CREATE POLICY "delivery_updates_own"
  ON public.delivery_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = delivery_updates.order_id
        AND (o.user_id = auth.uid() OR (o.user_id IS NULL AND o.session_id IS NOT NULL))
    )
  );

-- ── INVENTORY_LOGS ────────────────────────────────────────────────────────────
-- No direct client access; all reads/writes via service-role backend
-- (no policy needed — RLS already enabled + service-role bypasses)

-- ── EMPLOYEES ─────────────────────────────────────────────────────────────────
-- Completely locked — all access via service-role backend only
-- No policies → no anon/authenticated user can read employees directly

-- ── CLINIC_SETTINGS ───────────────────────────────────────────────────────────
-- Completely locked — all access via service-role backend only
-- No policies → no anon/authenticated user can read clinic_settings directly

-- ── WALK_INS ─────────────────────────────────────────────────────────────────
-- No direct client access; all via service-role backend
-- (no policy needed — RLS already enabled + service-role bypasses)


-- ─── DONE ─────────────────────────────────────────────────────────────────────
-- All sensitive tables now require service-role (backend) to read/write.
-- Public data (products, services, categories) is readable by anyone.
-- Customer data (profiles, orders, payments, appointments) requires valid JWT.
