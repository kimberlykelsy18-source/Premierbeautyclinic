import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Star, Check, Clock, Shield, ChevronRight as ChevronRightIcon, ChevronLeft } from 'lucide-react';
import { StarRating } from '../components/ui/StarRating';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { apiFetch } from '../lib/api';

interface ServiceAvgRating {
  average_rating: string;
  rating_count: string;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  deposit_percentage: number;
  duration_minutes: number;
  images: string[];
  category: string | null;
  benefits: string[];
  results_stat: string | null;
  service_avg_ratings: ServiceAvgRating | null;
}

// ── Hero image slides — pulled from service images or fallback Unsplash ──────
const FALLBACK_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1570172619694-1b26a1e0a9b1?w=1080&q=80&auto=format&fit=crop',
    label: 'Advanced Facials',
  },
  {
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612d71a9?w=1080&q=80&auto=format&fit=crop',
    label: 'Chemical Peels',
  },
  {
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1080&q=80&auto=format&fit=crop',
    label: 'Skin Treatments',
  },
];

function ServiceSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-6 md:p-8 space-y-4">
        <div className="h-5 bg-gray-200 rounded-full w-2/3" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="flex gap-3 mt-6">
          <div className="flex-1 h-11 bg-gray-200 rounded-full" />
          <div className="flex-1 h-11 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}


function ServiceCard({ service }: { service: Service }) {
  const { formatPrice } = useStore();
  const avgRating = Number(service.service_avg_ratings?.average_rating || 0);
  const ratingCount = Number(service.service_avg_ratings?.rating_count || 0);
  const heroImg = service.images?.[0] || 'https://images.unsplash.com/photo-1616394584738-fc6e612d71a9?w=600&q=80&auto=format&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl hover:border-[#6D4C91]/20 transition-all duration-300 group"
    >
      {/* Image */}
      <Link to={`/services/${service.slug ?? service.id}`} className="block relative overflow-hidden">
        <img
          src={heroImg}
          alt={service.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-[#6D4C91] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
          {formatPrice(service.base_price)}
        </div>
        {service.category && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {service.category}
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{service.duration_minutes} min</span>
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={avgRating} size={3} />
              <span className="text-xs text-gray-400">{avgRating.toFixed(1)} ({ratingCount})</span>
            </div>
          )}
        </div>

        <Link to={`/services/${service.slug ?? service.id}`}>
          <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3 hover:text-[#6D4C91] transition-colors">
            {service.name}
          </h3>
        </Link>

        {service.description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">{service.description}</p>
        )}

        {/* Benefits */}
        {service.benefits && service.benefits.length > 0 && (
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-y-2 gap-x-3">
              {service.benefits.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#6D4C91] mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600">{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results stat */}
        {service.results_stat && (
          <div className="bg-[#F2F1F8] rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#6D4C91] shrink-0" />
              <span className="text-sm font-semibold text-gray-700">{service.results_stat}</span>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          <Link
            to={`/book?service=${service.id}`}
            className="flex-1 bg-[#6D4C91] text-white py-3 rounded-full font-bold text-center hover:bg-[#5c3f80] transition-colors text-sm"
          >
            Book Now
          </Link>
          <Link
            to={`/services/${service.slug ?? service.id}`}
            className="flex-1 bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);

  // ── Carousel state ──
  const [slides, setSlides]           = useState(FALLBACK_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    apiFetch('/services')
      .then((data: Service[]) => {
        const all = data || [];
        setServices(all);
        // Build carousel from service images (first image of each service that has one)
        const withImages = all.filter(s => s.images?.length > 0).slice(0, 5);
        if (withImages.length >= 2) {
          setSlides(withImages.map(s => ({ image: s.images[0], label: s.name })));
        }
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const goNext = useCallback(() => setActiveSlide(i => (i + 1) % slides.length), [slides.length]);
  const goPrev = useCallback(() => setActiveSlide(i => (i - 1 + slides.length) % slides.length), [slides.length]);

  // Auto-rotate carousel every 5 s
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [slides.length, goNext]);

  return (
    <div className="pt-[70px] md:pt-[100px] bg-[#F2F1F8] min-h-screen">

      {/* ── Hero Carousel ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 h-[35vh] md:h-[45vh] overflow-hidden">
        {/* Slides */}
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{ opacity: index === activeSlide ? 1 : 0, zIndex: index === activeSlide ? 1 : 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          </motion.div>
        ))}

        {/* Prev / Next */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
              aria-label="Next"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`transition-all duration-300 rounded-full ${i === activeSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Page header (below carousel) ──────────────────────────────────────── */}
      <section className="bg-white py-12 md:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[#6D4C91] text-xs font-bold uppercase tracking-widest mb-3">In-Clinic Services</p>
            <h1 className="text-[32px] md:text-[52px] font-bold mb-4 leading-tight">Our Services</h1>
            <p className="text-base md:text-lg text-gray-500 mb-6 max-w-xl mx-auto">
              Transform your skin with clinically-proven treatments performed by certified professionals.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 / 5 Average Rating</span>
              </div>
              <span className="text-gray-300">•</span>
              <span>2,000+ Happy Clients</span>
              <span className="text-gray-300">•</span>
              <span>Certified Practitioners</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Service Grid ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading
              ? [1, 2, 3, 4].map(i => <ServiceSkeleton key={i} />)
              : services.length === 0
                ? (
                  <div className="col-span-2 text-center py-24">
                    <p className="text-gray-400 text-lg">No services available yet.</p>
                    <Link to="/book" className="mt-4 inline-block text-[#6D4C91] font-bold hover:underline">Book a consultation instead →</Link>
                  </div>
                )
                : services.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))
            }
          </div>

          {!loading && services.length > 0 && (
            <div className="text-center mt-16 bg-gradient-to-r from-[#6D4C91] to-[#8B5CF6] rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Not sure which treatment is right for you?</h3>
              <p className="text-base md:text-lg mb-6 text-white/85">Get a FREE personalised consultation with our skin experts</p>
              <Link
                to="/book"
                className="bg-white text-[#6D4C91] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Free Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
