import { Outlet, Link, useLocation } from "react-router";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

// TODO: Replace with your actual Google Maps API key before deploying to production
// Get your API key from: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = "";

export function Root() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Only attempt to load Google Maps if API key is provided
    if (!GOOGLE_MAPS_API_KEY) {
      // Silently skip - address autocomplete will not be available but app will still function
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "stable",
      libraries: ["places"]
    });

    loader.load().catch((e) => {
      console.error("Failed to load Google Maps API", e);
    });
  }, []);

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-[#1A1A1A]">
      {!isDashboard && <Navbar />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isDashboard && <Footer />}
      {!isDashboard && <WhatsAppButton />}
    </div>
  );
}