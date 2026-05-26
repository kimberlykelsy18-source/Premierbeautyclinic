
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights";

  inject();
  injectSpeedInsights();

  // Reload once on stale-chunk errors that escape the router error boundary
  window.addEventListener('unhandledrejection', (event) => {
    const msg = (event.reason as { message?: string })?.message ?? '';
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed')
    ) {
      const key = 'chunk_reload_v1';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
    }
  });

  createRoot(document.getElementById("root")!).render(<App />);
