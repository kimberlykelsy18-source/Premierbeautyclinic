import { createRoot } from "react-dom/client";
import DashboardApp from "./app/DashboardApp.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<DashboardApp />);
