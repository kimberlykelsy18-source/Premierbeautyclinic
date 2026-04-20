import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

// ── Layouts (eager — needed immediately for every route) ──────────────────────
import { Root } from './Root';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';

// ── Customer pages (lazy — each becomes its own JS chunk) ─────────────────────
const Home            = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop            = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetail   = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Book            = lazy(() => import('./pages/Book').then(m => ({ default: m.Book })));
const Cart            = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout        = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Login           = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Account         = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const FAQ             = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService  = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const ResetPassword   = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const OrderSuccess    = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const TreatmentDetail = lazy(() => import('./pages/TreatmentDetail').then(m => ({ default: m.TreatmentDetail })));
const Services        = lazy(() => import('./pages/Treatments').then(m => ({ default: m.Services })));
const SkinConcernPage = lazy(() => import('./pages/SkinConcernPage').then(m => ({ default: m.SkinConcernPage })));
const NotFound        = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// ── Dashboard pages (lazy — only loaded when staff navigates to /staff) ───────
const DashboardLogin        = lazy(() => import('./pages/DashboardLogin').then(m => ({ default: m.DashboardLogin })));
const DashboardOverview     = lazy(() => import('./pages/dashboard/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const DashboardOrders       = lazy(() => import('./pages/dashboard/DashboardOrders').then(m => ({ default: m.DashboardOrders })));
const DashboardAppointments = lazy(() => import('./pages/dashboard/DashboardAppointments').then(m => ({ default: m.DashboardAppointments })));
const DashboardInventory    = lazy(() => import('./pages/dashboard/DashboardInventory').then(m => ({ default: m.DashboardInventory })));
const DashboardCustomers    = lazy(() => import('./pages/dashboard/DashboardCustomers').then(m => ({ default: m.DashboardCustomers })));
const DashboardServices     = lazy(() => import('./pages/dashboard/DashboardServices').then(m => ({ default: m.DashboardServices })));
const DashboardReviews      = lazy(() => import('./pages/dashboard/DashboardReviews').then(m => ({ default: m.DashboardReviews })));
const DashboardShipping     = lazy(() => import('./pages/dashboard/DashboardShipping').then(m => ({ default: m.DashboardShipping })));
const DashboardSettings     = lazy(() => import('./pages/dashboard/DashboardSettings').then(m => ({ default: m.DashboardSettings })));

export const router = createBrowserRouter([
  // ── Staff / Admin portal ──────────────────────────────────────────────────
  {
    path: '/staff/login',
    Component: DashboardLogin,
  },
  {
    path: '/staff',
    Component: DashboardLayout,
    children: [
      { index: true,          Component: DashboardOverview     },
      { path: 'orders',       Component: DashboardOrders       },
      { path: 'appointments', Component: DashboardAppointments },
      { path: 'inventory',    Component: DashboardInventory    },
      { path: 'customers',    Component: DashboardCustomers    },
      { path: 'reviews',      Component: DashboardReviews      },
      { path: 'services',     Component: DashboardServices     },
      { path: 'shipping',     Component: DashboardShipping     },
      { path: 'settings',     Component: DashboardSettings     },
    ],
  },

  // ── Customer store ────────────────────────────────────────────────────────
  {
    path: '/',
    Component: Root,
    children: [
      { index: true,                Component: Home           },
      { path: 'shop',               Component: Shop           },
      { path: 'shop/:id',           Component: ProductDetail  },
      { path: 'book',               Component: Book           },
      { path: 'services',            Component: Services        },
      { path: 'services/:slug',     Component: TreatmentDetail },
      { path: 'treatments',         Component: Services        },
      { path: 'treatments/:slug',   Component: TreatmentDetail },
      { path: 'skin-concern/:slug', Component: SkinConcernPage },
      { path: 'cart',               Component: Cart           },
      { path: 'checkout',           Component: Checkout       },
      { path: 'login',              Component: Login          },
      { path: 'account',            Component: Account        },
      { path: 'faq',                Component: FAQ            },
      { path: 'privacy',            Component: PrivacyPolicy  },
      { path: 'terms',              Component: TermsOfService },
      { path: 'reset-password',     Component: ResetPassword  },
      { path: 'order-success',      Component: OrderSuccess   },
      { path: '*',                  Component: NotFound       },
    ],
  },
]);
