import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, Star, Check, Clock, ChevronRight as ChevronRightIcon, ChevronLeft } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-4 md:p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-9 bg-gray-200 rounded-full mt-4" />
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
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl hover:border-[#6D4C91]/20 transition-all duration-300 group flex flex-col"
    >
      {/* Image */}
      <Link to={`/services/${service.slug ?? service.id}`} className="block relative overflow-hidden">
        <img
          src={heroImg}
          alt={service.name}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-[#6D4C91] text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg">
          {formatPrice(service.base_price)}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-gray-500 text-xs mb-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{service.duration_minutes} min</span>
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={avgRating} size={3} />
              <span className="text-[11px] text-gray-400">{avgRating.toFixed(1)} ({ratingCount})</span>
            </div>
          )}
        </div>

        <Link to={`/services/${service.slug ?? service.id}`}>
          <h3 className="text-base font-bold leading-tight mb-2 hover:text-[#6D4C91] transition-colors line-clamp-2">
            {service.name}
          </h3>
        </Link>

        {service.description && (
          <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{service.description}</p>
        )}

        {/* Benefits — top 2, single column to stay compact at 4-up */}
        {service.benefits && service.benefits.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {service.benefits.slice(0, 2).map((b, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#6D4C91] mt-0.5 shrink-0" />
                <span className="text-xs text-gray-600 line-clamp-1">{b}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-1">
          {/* CTAs */}
          <div className="flex gap-2">
            <Link
              to={`/book?service=${service.id}`}
              className="flex-1 bg-[#6D4C91] text-white py-2.5 rounded-full font-bold text-center hover:bg-[#5c3f80] transition-colors text-xs"
            >
              Book Now
            </Link>
            <Link
              to={`/services/${service.slug ?? service.id}`}
              aria-label={`View details for ${service.name}`}
              className="shrink-0 w-9 h-9 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Services priced above this show no price — customers select and book a consultation instead
const SERVICE_PRICE_CEILING = 20000;

export function Services() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
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

  const visibleServices = activeCategory ? services.filter(s => s.category === activeCategory) : services;

  // Affordable tier shown as full cards with price; higher-value programs shown as a plain bookable list, no price
  const pricedServices = visibleServices.filter(s => s.base_price > 0 && s.base_price <= SERVICE_PRICE_CEILING);
  const consultServices = visibleServices.filter(s => s.base_price === 0 || s.base_price > SERVICE_PRICE_CEILING);

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
            <h1 className="text-[32px] md:text-[52px] font-bold mb-4 leading-tight">{activeCategory || 'Our Services'}</h1>
            <p className="text-base md:text-lg text-gray-500 mb-6 max-w-xl mx-auto">
              Transform your skin with clinically-proven treatments performed by certified professionals.
            </p>
            {activeCategory && (
              <Link to="/services" className="inline-block text-sm font-bold text-[#6D4C91] hover:underline mb-2">
                ← View all services
              </Link>
            )}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? [1, 2, 3, 4, 5, 6, 7, 8].map(i => <ServiceSkeleton key={i} />)
              : visibleServices.length === 0
                ? (
                  <div className="col-span-full text-center py-24">
                    <p className="text-gray-400 text-lg">
                      {activeCategory ? `No services found in ${activeCategory}.` : 'No services available yet.'}
                    </p>
                    <Link to="/book" className="mt-4 inline-block text-[#6D4C91] font-bold hover:underline">Book a consultation instead →</Link>
                  </div>
                )
                : pricedServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))
            }
          </div>

          {/* Advanced / high-value treatments — no price shown, book a consultation instead */}
          {!loading && consultServices.length > 0 && (
            <div className="mt-8 md:mt-10 bg-[#F2F1F8] rounded-3xl p-6 md:p-10">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold">Advanced Programs &amp; Treatments</h3>
                <p className="text-xs text-gray-500 hidden sm:block">Priced at consultation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 divide-y divide-gray-200 md:divide-y-0">
                {consultServices.map(service => (
                  <Link
                    key={service.id}
                    to={`/book?service=${service.id}`}
                    className="group flex items-center justify-between gap-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-sm md:text-base group-hover:text-[#6D4C91] transition-colors truncate">{service.name}</p>
                      {service.category && <p className="text-xs text-gray-400 mt-0.5">{service.category}</p>}
                    </div>
                    <span className="shrink-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center group-hover:bg-[#6D4C91] group-hover:text-white group-hover:border-[#6D4C91] transition-colors">
                      <ChevronRightIcon className="w-4 h-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
