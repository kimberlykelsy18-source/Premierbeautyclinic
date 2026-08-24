import { lazy, type ComponentType } from 'react';
import { createBrowserRouter, useRouteError, Link } from 'react-router';
import { ArrowLeft, RefreshCw } from 'lucide-react';

// ── Layouts (eager — needed immediately for every route) ──────────────────────
import { Root } from './Root';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { SITE_LIVE } from './siteConfig';

// ── Chunk-reload helper ───────────────────────────────────────────────────────
// After a new Vercel deployment, old hashed chunk filenames no longer exist.
// If a dynamic import fails, reload once — the fresh HTML will reference the new chunks.
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err: unknown) => {
      const key = 'chunk_reload_v1';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        return new Promise<never>(() => {}); // page is reloading — never resolve
      }
      throw err;
    })
  );
}

// ── Route error element ───────────────────────────────────────────────────────
function RouteError() {
  const error = useRouteError() as { message?: string } | null;
  const isChunkError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed');

  function reload() {
    sessionStorage.removeItem('chunk_reload_v1');
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 bg-[#F2F1F8] flex flex-col items-center justify-center px-6 text-center z-50">
      <div className="w-16 h-16 rounded-full bg-[#6D4C91]/10 flex items-center justify-center mb-6">
        <RefreshCw className="w-7 h-7 text-[#6D4C91]" />
      </div>
      <h2 className="text-2xl font-serif italic mb-3">
        {isChunkError ? 'New version available' : 'Something went wrong'}
      </h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        {isChunkError
          ? 'The site was just updated. Refresh to load the latest version.'
          : 'An unexpected error occurred. Try refreshing the page.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reload}
          className="bg-[#6D4C91] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#5a3d7a] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <Link
          to="/"
          onClick={() => sessionStorage.removeItem('chunk_reload_v1')}
          className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  );
}

// ── Customer pages (lazy — each becomes its own JS chunk) ─────────────────────
const Home            = lazyWithRetry(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop            = lazyWithRetry(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetail   = lazyWithRetry(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Book            = lazyWithRetry(() => import('./pages/Book').then(m => ({ default: m.Book })));
const Cart            = lazyWithRetry(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout        = lazyWithRetry(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Login           = lazyWithRetry(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Account         = lazyWithRetry(() => import('./pages/Account').then(m => ({ default: m.Account })));
const FAQ             = lazyWithRetry(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const PrivacyPolicy   = lazyWithRetry(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService  = lazyWithRetry(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const ResetPassword   = lazyWithRetry(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const OrderSuccess    = lazyWithRetry(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const TreatmentDetail = lazyWithRetry(() => import('./pages/TreatmentDetail').then(m => ({ default: m.TreatmentDetail })));
const Services        = lazyWithRetry(() => import('./pages/Treatments').then(m => ({ default: m.Services })));
const Routines        = lazyWithRetry(() => import('./pages/Routines').then(m => ({ default: m.Routines })));
const SkinConcernPage = lazyWithRetry(() => import('./pages/SkinConcernPage').then(m => ({ default: m.SkinConcernPage })));
const NotFound        = lazyWithRetry(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const ComingSoon      = lazyWithRetry(() => import('./pages/ComingSoon').then(m => ({ default: m.ComingSoon })));

// ── Dashboard pages (lazy — only loaded when staff navigates to /staff) ───────
const DashboardLogin        = lazyWithRetry(() => import('./pages/DashboardLogin').then(m => ({ default: m.DashboardLogin })));
const DashboardOverview     = lazyWithRetry(() => import('./pages/dashboard/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const DashboardOrders       = lazyWithRetry(() => import('./pages/dashboard/DashboardOrders').then(m => ({ default: m.DashboardOrders })));
const DashboardAppointments = lazyWithRetry(() => import('./pages/dashboard/DashboardAppointments').then(m => ({ default: m.DashboardAppointments })));
const DashboardInventory    = lazyWithRetry(() => import('./pages/dashboard/DashboardInventory').then(m => ({ default: m.DashboardInventory })));
const DashboardCustomers    = lazyWithRetry(() => import('./pages/dashboard/DashboardCustomers').then(m => ({ default: m.DashboardCustomers })));
const DashboardServices     = lazyWithRetry(() => import('./pages/dashboard/DashboardServices').then(m => ({ default: m.DashboardServices })));
const DashboardReviews      = lazyWithRetry(() => import('./pages/dashboard/DashboardReviews').then(m => ({ default: m.DashboardReviews })));
const DashboardShipping     = lazyWithRetry(() => import('./pages/dashboard/DashboardShipping').then(m => ({ default: m.DashboardShipping })));
const DashboardSettings     = lazyWithRetry(() => import('./pages/dashboard/DashboardSettings').then(m => ({ default: m.DashboardSettings })));

export const router = createBrowserRouter([
  // ── Staff / Admin portal ──────────────────────────────────────────────────
  {
    path: '/staff/login',
    Component: DashboardLogin,
    ErrorBoundary: RouteError,
  },
  {
    path: '/staff',
    Component: DashboardLayout,
    ErrorBoundary: RouteError,
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
  // While SITE_LIVE is false (final client payment pending), every customer
  // path renders the ComingSoon page instead. Flip the flag in siteConfig.ts
  // to restore the routes below — nothing else needs to change.
  {
    path: '/',
    Component: Root,
    ErrorBoundary: RouteError,
    children: SITE_LIVE
      ? [
          { index: true,                Component: Home           },
          { path: 'shop',               Component: Shop           },
          { path: 'shop/:id',           Component: ProductDetail  },
          { path: 'book',               Component: Book           },
          { path: 'services',            Component: Services        },
          { path: 'routines',           Component: Routines        },
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
        ]
      : [
          { index: true, Component: ComingSoon },
          { path: '*',   Component: ComingSoon },
        ],
  },
]);
