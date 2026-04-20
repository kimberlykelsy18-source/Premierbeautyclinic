import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

import { DashboardLayout } from './pages/dashboard/DashboardLayout';

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
const NotFound              = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

export const dashboardRouter = createBrowserRouter([
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
  { path: '*', Component: NotFound },
]);
