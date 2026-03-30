import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Book } from "./pages/Book";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Account } from "./pages/Account";
import { FAQ } from "./pages/FAQ";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { ResetPassword } from "./pages/ResetPassword";
import { OrderSuccess } from "./pages/OrderSuccess";
import { DashboardLogin } from "./pages/DashboardLogin";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { DashboardOrders } from "./pages/dashboard/DashboardOrders";
import { DashboardAppointments } from "./pages/dashboard/DashboardAppointments";
import { DashboardInventory } from "./pages/dashboard/DashboardInventory";
import { DashboardCustomers } from "./pages/dashboard/DashboardCustomers";
import { DashboardSettings } from "./pages/dashboard/DashboardSettings";
import { DashboardShipping } from "./pages/dashboard/DashboardShipping";

export const router = createBrowserRouter([
  // ── Staff / Admin portal (hidden route, shared only with staff) ──────────
  {
    path: "/staff/login",
    Component: DashboardLogin,
  },
  {
    path: "/staff",
    Component: DashboardLayout,
    children: [
      { index: true,                    Component: DashboardOverview     },
      { path: "orders",                 Component: DashboardOrders       },
      { path: "appointments",           Component: DashboardAppointments },
      { path: "inventory",              Component: DashboardInventory    },
      { path: "customers",              Component: DashboardCustomers    },
      { path: "shipping",               Component: DashboardShipping     },
      { path: "settings",               Component: DashboardSettings     },
    ],
  },

  // ── Customer store ────────────────────────────────────────────────────────
  {
    path: "/",
    Component: Root,
    children: [
      { index: true,            Component: Home           },
      { path: "shop",           Component: Shop           },
      { path: "shop/:id",       Component: ProductDetail  },
      { path: "book",           Component: Book           },
      { path: "cart",           Component: Cart           },
      { path: "checkout",       Component: Checkout       },
      { path: "login",          Component: Login          },
      { path: "account",        Component: Account        },
      { path: "faq",            Component: FAQ            },
      { path: "privacy",        Component: PrivacyPolicy  },
      { path: "terms",          Component: TermsOfService },
      { path: "reset-password", Component: ResetPassword  },
      { path: "order-success",  Component: OrderSuccess   },
      { path: "*",              Component: NotFound       },
    ],
  },
]);
