import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { DashboardOrders } from "./pages/dashboard/DashboardOrders";
import { DashboardAppointments } from "./pages/dashboard/DashboardAppointments";
import { DashboardInventory } from "./pages/dashboard/DashboardInventory";
import { DashboardCustomers } from "./pages/dashboard/DashboardCustomers";
import { DashboardSettings } from "./pages/dashboard/DashboardSettings";
import { DashboardLogin } from "./pages/DashboardLogin";
import { NotFound } from "./pages/NotFound";

export const dashboardRouter = createBrowserRouter([
  {
    path: "/login",
    Component: DashboardLogin,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true,               Component: DashboardOverview     },
      { path: "orders",            Component: DashboardOrders       },
      { path: "appointments",      Component: DashboardAppointments },
      { path: "inventory",         Component: DashboardInventory    },
      { path: "customers",         Component: DashboardCustomers    },
      { path: "settings",          Component: DashboardSettings     },
    ],
  },
  { path: "*", Component: NotFound },
]);
