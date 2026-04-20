-- ============================================================
-- Premier Beauty Clinic — SQL Fixes Part 3
-- Run in Supabase SQL Editor (once only)
-- ============================================================

-- Stores intake form responses submitted at appointment booking.
-- Visible to practitioners in DashboardAppointments popup.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS form_responses jsonb DEFAULT '{}';

-- Stores skin concern images managed from the admin dashboard.
-- Used by the "What's Your Skin Concern?" section on the home page.
ALTER TABLE public.storefront_content
  ADD COLUMN IF NOT EXISTS skin_concerns jsonb DEFAULT '[]';

-- ============================================================
-- DONE
-- ============================================================
