# Premier Beauty Clinic — User Type Flow

> **For the frontend designer.**
> This document explains every user type in the system, what they can do, which pages they see, and how the full journey works from entry to completion.

---

## Overview: Two Separate Apps

The project is split into **two independent web apps** that run on different ports and build to different folders.

| App | URL | Who uses it | Vite config |
|-----|-----|-------------|-------------|
| **Store** | `localhost:5173` | Customers (guests + logged-in) | `vite.config.ts` |
| **Dashboard** | `localhost:5174` | Staff & Admin | `vite.dashboard.config.ts` |

Both apps share the same backend API (`localhost:3000`) and the same Supabase database.

---

## User Types

There are **4 user types** in total:

| # | Type | Where they log in | Role value |
|---|------|-------------------|------------|
| 1 | **Guest** | Doesn't log in | — |
| 2 | **Customer** | Store app `/login` | `customer` |
| 3 | **Staff / Employee** | Dashboard app `/login` | `staff` (or custom role) |
| 4 | **Admin** | Dashboard app `/login` | `admin` |

---

---

# USER TYPE 1 — Guest (Unauthenticated)

Guests arrive at the Store app without an account. They can browse and add to cart, but cannot check out or book appointments.

## Pages they can visit

```
/ (Home)
/shop
/shop/:id (Product Detail)
/cart
/book  (steps 1 & 2 only — step 3 requires login)
/login (redirected here if they try to do something protected)
/faq
/privacy
/terms
/reset-password
```

## Guest Journey

### 1. Landing on the Home page (`/`)
- Sees the **hero section** with two CTAs: "Shop Collection" → `/shop` and "Book Consultation" → `/book`
- Sees a **featured products grid** (4 products pulled live from `GET /products`)
- Sees the **services section** with a link to `/book`
- Sees a **newsletter subscribe form** at the bottom (currently UI-only, not wired to backend)
- The **Navbar** and **Footer** are always visible (set in `Root.tsx`)
- A **WhatsApp floating button** is always visible in the bottom corner

### 2. Browsing the Shop (`/shop`)
- Product grid loads from `GET /products`
- Each product card shows image, category, name, price, and stock status (In Stock / Low Stock)
- Hovering a card reveals a **Quick Add** button that adds the item to cart
- Clicking the card goes to `/shop/:id` (Product Detail)
- Guest can add items to cart — cart is tracked by a **session ID** stored in localStorage (`x-session-id` header sent to backend)

### 3. Product Detail (`/shop/:id`)
- Full product info: images gallery, description, price, stock
- Add to cart button
- Related products section

### 4. Cart (`/cart`)
- Shows all items in cart (from local state + synced with backend via session ID)
- Quantity controls (+ / −), remove item, clear cart
- Subtotal displayed
- "Proceed to Checkout" button → `/checkout`
- Guest **can** reach checkout but must fill shipping info

### 5. Checkout — Guest path (`/checkout`)
- **Step 1: Shipping** — guest fills name, email, phone, county, city, street address
- Shipping fee is calculated based on county selected
- **Step 2: Payment** — guest selects M-Pesa or Card
  - M-Pesa: enters phone number, gets STK push
  - Card: UI shown (Visa/Mastercard fields — PesaPal integration pending)
- Guest **does not need to log in** to complete an order, but their order won't appear in an account history

### 6. Booking (`/book`) — Partial access
- **Step 1:** Select a service (loaded from `GET /services`)
- **Step 2:** Select date (next 6 Mon–Sat) and time slot (booked slots are greyed out via `GET /services/:id/availability`)
- **Step 3:** Requires login — a banner appears saying "Login Required" with a link to `/login`

---

---

# USER TYPE 2 — Customer (Logged In)

Customers create an account in the Store app. Once logged in, they get a JWT token stored in localStorage. All protected API calls use `Authorization: Bearer <token>`.

## Additional pages unlocked

```
/account   (order history, appointment history, profile settings)
/book      (all 3 steps — can complete a booking)
/checkout  (orders linked to their profile)
```

## Auth Flow

### Signing Up (`/login` → signup tab)
1. Customer fills: Full Name, Email, Phone, Password, Confirm Password
2. Frontend calls `POST /auth/signup`
3. On success, a **Terms & Conditions modal** appears
4. Customer clicks **Accept** → they are logged in, redirected to `/`
5. Token + user data saved to localStorage

### Logging In (`/login` → login tab)
1. Customer enters email + password
2. Frontend calls `POST /auth/login`
3. On success, token + user saved, redirected to `/`
4. If they were mid-checkout or booking, they are sent back to where they came from

### Forgot Password
1. Customer clicks "Forgot Password?" on the login form
2. Enters their email, submits
3. Frontend calls `POST /auth/forgot-password`
4. Supabase sends a recovery email with a magic link pointing to `/reset-password`
5. Customer clicks the link, lands on `/reset-password`
6. Reads the `access_token` from the URL hash, shows a new password form
7. Submits → calls `POST /auth/update-password` with recovery token as Bearer
8. Password is changed, customer is redirected to login

## Customer Journey (logged in)

### Booking an Appointment (`/book`) — Full flow
- **Step 1:** Choose a service card (price + duration shown)
- **Step 2:** Choose date and time (booked slots are strikethrough + disabled)
- **Step 3:** Details prefilled from their profile (name, email, phone)
  - If the service has a **deposit %**, an M-Pesa STK push is triggered on "Book & Pay"
  - If **no deposit**, booking is confirmed instantly (no payment)
  - Frontend polls `GET /payment/status/:checkoutRequestId` every 3 seconds until paid/failed/timeout (max 2 min)
  - On success → redirected to `/account`

### Shopping & Checkout
- Same as guest, but:
  - Shipping address is **pre-filled** from their saved profile
  - On successful order, the shipping address is **saved back** to their profile via `PATCH /profile`
  - Order appears in their `/account` history

### Account Page (`/account`)
Has **four tabs:**

| Tab | What it shows |
|-----|---------------|
| **Orders** | List of past orders with short ID (ORD-A001…), status badge, items, total, reorder button |
| **Appointments** | List of booked appointments with status (pending / confirmed / completed), service name, date/time |
| **Profile** | Edit full name + phone — saved via `PATCH /profile`. Toggle marketing emails consent. |
| **Security** | Change password form → calls `POST /auth/update-password`. Delete account button → calls `DELETE /account`. |

> **Note:** Appointment reschedule/cancel is NOT implemented. Customers see a "contact us" message.

---

---

# USER TYPE 3 — Staff / Employee

Staff are invited by admins. They only access the **Dashboard app** at `localhost:5174`.

## How they get access
1. Admin goes to Dashboard → Settings → Staff tab
2. Fills in employee name, email, and role (`staff` / `finance`)
3. Selects which permissions to grant (e.g. view_orders, view_appointments, complete_appointment, create_walkin)
4. Frontend calls `POST /admin/invite-employee`
5. Backend creates the employee account with a **random temporary password** and sends an invite email
6. The email contains a link to the dashboard login page

## First Login — Forced Password Reset
1. Staff goes to Dashboard login (`/login` on dashboard app)
2. Enters email + temporary password → calls `POST /employee/login`
3. If `requiresPasswordReset` is true on their account, a **modal overlay** blocks the entire dashboard
4. They must set a new password (min 6 chars) before accessing anything
5. Calls `POST /auth/update-password` with their current token
6. Modal dismisses, they land on the Overview

## Dashboard Navigation (Staff)

```
/ (Overview)
/orders
/appointments
/inventory
```

> **Customers** and **Settings** tabs are hidden or inaccessible to non-admin roles.

## What Staff Can Do

### Overview (`/`)
- **Stats cards:** Today's revenue, total orders, upcoming appointments, new customers (30-day count)
- **Recent Activity panel:** Last 5 orders + last 5 appointments in a live feed (from `GET /admin/recent-activity`)
- **Sales chart** (from `GET /admin/sales`)
- Skeleton loaders shown while data fetches

### Orders (`/orders`)
- Table of all orders (from `GET /admin/orders`)
- Short order ID format: ORD-A001, ORD-A002…
- Status badges: Pending / Processing / Shipped / Delivered / Cancelled
- Status can be updated via dropdown → calls `PATCH /admin/orders/:id/status`
- "Mark as Delivered" button → calls `POST /admin/orders/:id/deliver`
- **Export Orders** button → downloads a CSV of the current orders list

### Appointments (`/appointments`)
- Unified grid showing **both online bookings and walk-ins together**
- **Purple "Online" badge** on customer-booked appointments
- **Teal "Walk-in" badge** on walk-ins created by staff
- Click any card → opens a detail popup
- **"Mark Complete" button** on appointment cards → calls `POST /admin/appointments/:id/complete`
- **"New Walk-in" button** → opens a 3-step walk-in creation modal:
  - Step 1: Customer email
  - Step 2: Choose service (price shown in dropdown), date, time, practitioner
  - Step 3: Read-only payment summary
  - **Payment logic:**
    - Appointment is **today** → full price STK push sent to customer
    - Appointment is **future + service has deposit** → deposit STK push sent
    - Appointment is **future + no deposit** → email sent only, no payment now
  - Submits to `POST /admin/walkin`

### Inventory (`/inventory`)
- Product list from `GET /admin/inventory`
- Stock level, low stock threshold, restock button
- Add stock modal → calls `POST /admin/stock/add`

---

---

# USER TYPE 4 — Admin

Admin has all staff permissions **plus** access to Customers and Settings tabs.

## Additional pages

```
/customers
/settings
```

## What Admin Can Do (on top of Staff)

### Customers (`/customers`)
- Full customer list from `GET /admin/customers` (profiles joined with order counts)
- Stat cards: total customers, new this month, repeat customers, average orders
- Search/filter by name or email
- **Export CSV** button

### Settings (`/settings`)
Has **three tabs:**

| Tab | What it does |
|-----|--------------|
| **General** | Clinic name, address, phone, email, business hours — loaded from `GET /admin/settings`, saved via `PATCH /admin/settings` |
| **Payments** | M-Pesa paybill/till numbers, deposit percentage defaults — same GET/PATCH `/admin/settings` |
| **Staff** | Invite new employee form (name, email, role dropdown, permissions checkboxes) → `POST /admin/invite-employee`. List of current employees. |

---

---

# Payment Flows (How Money Works)

## M-Pesa (Live — fully implemented)

```
Customer/Staff triggers payment
        ↓
Backend calls Daraja API → STK Push sent to phone
        ↓
Customer enters M-Pesa PIN on their phone
        ↓
Safaricom sends callback to backend (via Supabase Edge Function)
        ↓
Backend updates payment status to 'paid'
Backend updates appointment status to 'confirmed' (or order to 'processing')
Backend sends confirmation email
        ↓
Frontend poll detects 'paid' status → shows success → redirects
```

## Card Payment (UI built, not yet live)
- Visa/Mastercard fields are shown in Checkout and Book pages
- Integration will use **PesaPal** — waiting for client to share API docs
- Do NOT implement until docs are received

---

---

# Auth Token & Session Flow

```
GUEST
  └── No token
  └── Uses x-session-id header (UUID generated on first visit, stored in localStorage)
  └── Cart tied to session ID on backend

CUSTOMER (logged in)
  └── JWT token from Supabase (via POST /auth/login or /auth/signup)
  └── Stored in localStorage as 'pb_token' and 'pb_user'
  └── Sent as: Authorization: Bearer <token>
  └── On app load, token restored from localStorage (auth restore)
  └── After restore, GET /profile is called to sync shipping_address and marketing_consent

STAFF / ADMIN (dashboard)
  └── JWT token from Supabase (via POST /employee/login)
  └── Same token storage pattern as customers
  └── Role checked in DashboardLayout: if role === 'customer' → redirect to /login
  └── Admin-only nav items hidden for non-admin roles
```

---

---

# Page Map Summary

## Store App (`:5173`)

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Home | No |
| `/shop` | Shop | No |
| `/shop/:id` | Product Detail | No |
| `/cart` | Cart | No |
| `/checkout` | Checkout | No (order not linked to account if guest) |
| `/book` | Book Appointment | Steps 1–2 No, Step 3 Yes |
| `/login` | Login / Signup / Forgot Password | No (redirects away if already logged in) |
| `/account` | Account (Orders, Appointments, Profile, Security) | Yes — redirects to `/login` |
| `/reset-password` | Reset Password (from email link) | No (uses URL token) |
| `/faq` | FAQ | No |
| `/privacy` | Privacy Policy | No |
| `/terms` | Terms of Service | No |

## Dashboard App (`:5174`)

| Route | Page | Who can access |
|-------|------|----------------|
| `/login` | Dashboard Login | Anyone (redirects away if already logged in) |
| `/` | Overview | Staff + Admin |
| `/orders` | Orders | Staff + Admin |
| `/appointments` | Appointments + Walk-ins | Staff + Admin |
| `/inventory` | Inventory | Staff + Admin |
| `/customers` | Customer list | Admin only |
| `/settings` | Clinic settings + Staff management | Admin only |

---

---

# Global UI Elements (always visible in Store app)

- **Navbar** — Logo, nav links (Home, Shop, Book), cart icon with item count, account icon
- **Footer** — Clinic info, links, socials
- **WhatsApp button** — Fixed bottom-right corner, links to WhatsApp chat
- **Toast notifications** — Sonner toasts for all success/error feedback
- **Loading states** — Skeleton placeholders used on all data-fetching pages

---

*Last updated: 2026-03-12*
