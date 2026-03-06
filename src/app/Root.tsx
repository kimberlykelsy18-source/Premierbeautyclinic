import { Outlet, useLocation } from "react-router";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { useEffect } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export function Root() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-[#1A1A1A]">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
