import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="text-[120px] font-serif font-bold text-[#6D4C91]/10 leading-none">404</h1>
      <h2 className="text-[32px] font-serif mb-4 italic mt-[-40px]">Page Not Found</h2>
      <p className="text-gray-500 mb-10 max-w-md">Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.</p>
      <Link to="/" className="bg-[#1A1A1A] text-white px-10 py-4 rounded-full text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
    </div>
  );
}
