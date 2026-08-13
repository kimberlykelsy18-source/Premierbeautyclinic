import { Outlet, useLocation } from "react-router";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { useEffect } from "react";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Routes where the Navbar, Footer, and WhatsApp button are hidden
// so the page can render a full-screen layout.
const BARE_ROUTES = ['/login'];

export function Root() {
  const { pathname } = useLocation();
  const isBareRoute = BARE_ROUTES.includes(pathname);
  const lenisRef = useSmoothScroll();

  useEffect(() => {
    // Lenis owns scroll position once initialized, so drive it directly
    // (immediate, no easing) instead of window.scrollTo — otherwise the two
    // fight over the scroll offset on every route change.
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenisRef]);

  useEffect(() => {
    // Only load Google Maps if an API key is configured.
    // Without it the app still works — address autocomplete is simply unavailable.
    if (!GOOGLE_MAPS_API_KEY) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.onerror = () => console.error("Failed to load Google Maps API");
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-[#1A1A1A] overflow-x-hidden">
      {!isBareRoute && <Navbar />}
      <main className="flex-grow overflow-x-hidden w-full">
        <Outlet />
      </main>
      {!isBareRoute && <Footer />}
      {!isBareRoute && <WhatsAppButton />}
    </div>
  );
}
