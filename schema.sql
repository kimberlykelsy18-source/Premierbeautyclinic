


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_stock"("p_id" bigint, "qty" integer, "staff" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE products SET stock = stock + qty WHERE id = p_id;
  INSERT INTO inventory_logs (product_id, staff_id, quantity_change, reason)
  VALUES (p_id, staff, qty, 'Manual stock entry');
END;
$$;


ALTER FUNCTION "public"."add_stock"("p_id" bigint, "qty" integer, "staff" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, marketing_consent)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    false
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sales_summary"()
RETURNS TABLE (
  "period"              "date",
  "product_revenue"     numeric,
  "appointment_revenue" numeric,
  "total_revenue"       numeric,
  "order_count"         bigint,
  "appointment_count"   bigint
)
    LANGUAGE "plpgsql" SECURITY DEFINER
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
    COALESCE(o.day, a.day)                   AS period,
    COALESCE(o.rev, 0)                       AS product_revenue,
    COALESCE(a.rev, 0)                       AS appointment_revenue,
    COALESCE(o.rev, 0) + COALESCE(a.rev, 0) AS total_revenue,
    COALESCE(o.cnt, 0)                       AS order_count,
    COALESCE(a.cnt, 0)                       AS appointment_count
  FROM daily_orders o
  FULL OUTER JOIN daily_appointments a ON o.day = a.day
  ORDER BY period DESC
  LIMIT 30;
END;
$$;


ALTER FUNCTION "public"."get_sales_summary"() OWNER TO "postgres";


CREATE OR REPLACE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW EXECUTE PROCEDURE "public"."handle_new_user"();

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "service_id" bigint,
    "appointment_time" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'deposit_paid'::"text",
    "deposit_amount" numeric(10,2) NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "form_responses" "jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" bigint NOT NULL,
    "cart_id" "uuid",
    "product_id" bigint,
    "quantity" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


ALTER TABLE "public"."cart_items" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cart_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."carts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "parent_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


ALTER TABLE "public"."categories" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "customer_name" "text",
    "phone" "text",
    "address" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "tracking_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."deliveries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."delivery_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "status" "text" DEFAULT 'in_transit'::"text",
    "notes" "text",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."delivery_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'staff'::"text" NOT NULL,
    "permissions" "jsonb" DEFAULT '[]'::"jsonb",
    "phone" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_temporary_password" boolean DEFAULT false
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" bigint,
    "staff_id" "uuid",
    "quantity_change" integer NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."inventory_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" bigint NOT NULL,
    "order_id" "uuid",
    "product_id" bigint,
    "quantity" integer NOT NULL,
    "price_at_time" numeric(10,2) NOT NULL
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


ALTER TABLE "public"."order_items" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."order_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "total" numeric(10,2) NOT NULL,
    "subtotal" numeric(10,2) NOT NULL,
    "shipping_fee" numeric(10,2) DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text",
    "payment_method" "text" DEFAULT 'mpesa'::"text",
    "shipping_address" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "session_id" "text",
    "customer_email" "text"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "appointment_id" "uuid",
    "checkout_request_id" "text",
    "mpesa_receipt" "text",
    "amount" numeric(10,2) NOT NULL,
    "phone" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_ratings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" bigint,
    "user_id" "uuid",
    "rating" integer NOT NULL,
    "review_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_ratings_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."product_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "ingredients" "text"[],
    "skin_concerns" "text"[],
    "price" numeric(10,2) NOT NULL,
    "images" "text"[],
    "category_id" bigint,
    "stock" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "low_stock_threshold" integer DEFAULT 5
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."product_avg_ratings" AS
 SELECT "p"."id" AS "product_id",
    COALESCE("avg"("r"."rating"), (0)::numeric) AS "average_rating",
    "count"("r"."id") AS "rating_count"
   FROM ("public"."products" "p"
     LEFT JOIN "public"."product_ratings" "r" ON (("p"."id" = "r"."product_id")))
  GROUP BY "p"."id";


ALTER VIEW "public"."product_avg_ratings" OWNER TO "postgres";


ALTER TABLE "public"."products" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "addresses" "jsonb" DEFAULT '[]'::"jsonb",
    "skin_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "marketing_consent" boolean DEFAULT false,
    "role" "text" DEFAULT 'customer'::"text",
    "permissions" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "base_price" numeric(10,2) NOT NULL,
    "deposit_percentage" integer DEFAULT 20,
    "duration_minutes" integer,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "category" "text",
    "form_fields" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."services" OWNER TO "postgres";


ALTER TABLE "public"."services" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."services_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."walk_ins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_name" "text" NOT NULL,
    "phone" "text",
    "service_id" bigint,
    "deposit_paid" numeric(10,2) DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."walk_ins" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE ("cart_id", "product_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."delivery_updates"
    ADD CONSTRAINT "delivery_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_logs"
    ADD CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_ratings"
    ADD CONSTRAINT "product_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_ratings"
    ADD CONSTRAINT "product_ratings_product_id_user_id_key" UNIQUE ("product_id", "user_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."walk_ins"
    ADD CONSTRAINT "walk_ins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."delivery_updates"
    ADD CONSTRAINT "delivery_updates_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."delivery_updates"
    ADD CONSTRAINT "delivery_updates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_logs"
    ADD CONSTRAINT "inventory_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."inventory_logs"
    ADD CONSTRAINT "inventory_logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."product_ratings"
    ADD CONSTRAINT "product_ratings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_ratings"
    ADD CONSTRAINT "product_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."walk_ins"
    ADD CONSTRAINT "walk_ins_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."walk_ins"
    ADD CONSTRAINT "walk_ins_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



-- ─── Payment failure reason ───────────────────────────────────────────────────
-- Stores the ResultDesc from M-Pesa when a payment fails (e.g. "Request cancelled by user")
-- Run in Supabase SQL Editor if not already applied.
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS failure_reason text;

-- ─── Walk-in payment link ─────────────────────────────────────────────────────
-- Links a payments row to a walk_in row so the M-Pesa callback can mark the
-- walk-in as paid. Run in Supabase SQL Editor if not already applied.
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS walk_in_id UUID REFERENCES public.walk_ins(id);

-- ─── Walk-in appointment time ─────────────────────────────────────────────────
-- Stores the scheduled time when the receptionist sets a future slot for a walk-in.
ALTER TABLE public.walk_ins ADD COLUMN IF NOT EXISTS appointment_time TIMESTAMP WITH TIME ZONE;

-- ─── Practitioner assignment ──────────────────────────────────────────────────
-- Records which expert/practitioner was assigned to an appointment or walk-in.
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS practitioner TEXT;
ALTER TABLE public.walk_ins     ADD COLUMN IF NOT EXISTS practitioner TEXT;

-- ─── Walk-in email ─────────────────────────────────────────────────────────────
-- Customer email for booking confirmations and payment receipts.
ALTER TABLE public.walk_ins ADD COLUMN IF NOT EXISTS email TEXT;

-- ─── Clinic Settings ─────────────────────────────────────────────────────────
-- Single-row table (id is always 1) that stores admin-editable clinic config.
-- Run this in Supabase SQL Editor if the table does not already exist.

CREATE TABLE IF NOT EXISTS "public"."clinic_settings" (
    "id"                        integer DEFAULT 1 NOT NULL,
    "clinic_name"               "text" DEFAULT 'Premier Beauty Clinic'::"text",
    "support_email"             "text" DEFAULT 'support@premierbeauty.com'::"text",
    "currency"                  "text" DEFAULT 'KES'::"text",
    "timezone"                  "text" DEFAULT 'Africa/Nairobi'::"text",
    "default_deposit_percentage" integer DEFAULT 20,
    "updated_at"                timestamp with time zone DEFAULT "now"(),
    "updated_by"                "uuid",
    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "clinic_settings_single_row" CHECK (("id" = 1))
);

ALTER TABLE "public"."clinic_settings" OWNER TO "postgres";

-- Seed the default row so GET /admin/settings always finds something
INSERT INTO "public"."clinic_settings" ("id", "clinic_name", "support_email", "currency", "timezone", "default_deposit_percentage")
VALUES (1, 'Premier Beauty Clinic', 'support@premierbeauty.com', 'KES', 'Africa/Nairobi', 20)
ON CONFLICT ("id") DO NOTHING;

GRANT ALL ON TABLE "public"."clinic_settings" TO "anon";
GRANT ALL ON TABLE "public"."clinic_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_settings" TO "service_role";



CREATE POLICY "admin_full_access" ON "public"."inventory_logs" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "admins_full_access" ON "public"."employees" USING ((EXISTS ( SELECT 1
   FROM "public"."employees" "employees_1"
  WHERE (("employees_1"."id" = "auth"."uid"()) AND ("employees_1"."role" = 'admin'::"text")))));



CREATE POLICY "allow cart_items for any valid cart" ON "public"."cart_items" USING (true) WITH CHECK (true);



CREATE POLICY "allow_all_payments_insert" ON "public"."payments" FOR INSERT WITH CHECK (true);



CREATE POLICY "allow_order_creation" ON "public"."orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "anyone can create payments" ON "public"."payments" FOR INSERT WITH CHECK (true);



CREATE POLICY "anyone can insert order_items" ON "public"."order_items" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customers_manage_cart_items" ON "public"."cart_items" USING ((EXISTS ( SELECT 1
   FROM "public"."carts"
  WHERE (("carts"."id" = "cart_items"."cart_id") AND ("carts"."user_id" = "auth"."uid"()))))) WITH CHECK (true);



CREATE POLICY "customers_manage_carts" ON "public"."carts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."deliveries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deliveries insertable" ON "public"."deliveries" FOR INSERT WITH CHECK (true);



CREATE POLICY "deliveries readable" ON "public"."deliveries" FOR SELECT USING (true);



ALTER TABLE "public"."delivery_updates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "employees_self_access" ON "public"."employees" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."inventory_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "products public read" ON "public"."products" FOR SELECT USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "receptionist_walkins" ON "public"."walk_ins" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['receptionist'::"text", 'admin'::"text"])));



CREATE POLICY "staff_can_manage_appointments" ON "public"."appointments" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'receptionist'::"text"])));



CREATE POLICY "staff_can_manage_inventory" ON "public"."products" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'stock_manager'::"text"])));



CREATE POLICY "staff_can_manage_orders" ON "public"."orders" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'receptionist'::"text", 'finance'::"text"])));



CREATE POLICY "staff_can_view_sales" ON "public"."orders" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'finance'::"text"])));



CREATE POLICY "staff_insert_logs" ON "public"."inventory_logs" FOR INSERT WITH CHECK (("staff_id" = "auth"."uid"()));



CREATE POLICY "staff_own_logs" ON "public"."inventory_logs" FOR SELECT USING ((("staff_id" = "auth"."uid"()) OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text")));



CREATE POLICY "users can create own cart" ON "public"."carts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users can manage own cart" ON "public"."carts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can view order_items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND (("auth"."uid"() = "orders"."user_id") OR ("orders"."session_id" IS NOT NULL))))));



CREATE POLICY "users can view payments" ON "public"."payments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "payments"."order_id") AND (("auth"."uid"() = "orders"."user_id") OR ("orders"."session_id" IS NOT NULL))))));



CREATE POLICY "users own appointments" ON "public"."appointments" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users own cart" ON "public"."carts" USING ((("auth"."uid"() = "user_id") OR ("session_id" IS NOT NULL)));



CREATE POLICY "users own payments" ON "public"."payments" USING (("auth"."uid"() IN ( SELECT "orders"."user_id"
   FROM "public"."orders"
  WHERE ("orders"."id" = "payments"."order_id")
UNION
 SELECT "appointments"."user_id"
   FROM "public"."appointments"
  WHERE ("appointments"."id" = "payments"."appointment_id"))));



CREATE POLICY "users own profile" ON "public"."profiles" USING (("auth"."uid"() = "id"));



CREATE POLICY "users own ratings" ON "public"."product_ratings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users_view_own_orders" ON "public"."orders" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("session_id" IS NOT NULL) OR ("user_id" IS NULL)));



CREATE POLICY "users_view_own_payments" ON "public"."payments" FOR SELECT USING (true);



ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "services public read" ON "public"."services" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."walk_ins" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."add_stock"("p_id" bigint, "qty" integer, "staff" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_stock"("p_id" bigint, "qty" integer, "staff" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_stock"("p_id" bigint, "qty" integer, "staff" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


GRANT EXECUTE ON FUNCTION "public"."get_sales_summary"() TO "anon";
GRANT EXECUTE ON FUNCTION "public"."get_sales_summary"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."get_sales_summary"() TO "service_role";


















GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cart_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cart_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cart_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."carts" TO "anon";
GRANT ALL ON TABLE "public"."carts" TO "authenticated";
GRANT ALL ON TABLE "public"."carts" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."deliveries" TO "anon";
GRANT ALL ON TABLE "public"."deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."deliveries" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_updates" TO "anon";
GRANT ALL ON TABLE "public"."delivery_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."delivery_updates" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_logs" TO "anon";
GRANT ALL ON TABLE "public"."inventory_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_logs" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."product_ratings" TO "anon";
GRANT ALL ON TABLE "public"."product_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."product_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."product_avg_ratings" TO "anon";
GRANT ALL ON TABLE "public"."product_avg_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."product_avg_ratings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."walk_ins" TO "anon";
GRANT ALL ON TABLE "public"."walk_ins" TO "authenticated";
GRANT ALL ON TABLE "public"."walk_ins" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































