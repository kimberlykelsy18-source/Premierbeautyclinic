import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronRight, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';
import { LazyImage } from '../components/LazyImage';

interface PromoSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
}

interface KitProduct {
  id: number;
  name: string;
  size: string | null;
  price: string;
  images: string[] | null;
  product_group: string | null;
  categories: { name: string; slug: string } | null;
  product_avg_ratings: { average_rating: string; rating_count: string } | null;
}

interface FeaturedReview {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
  product_id: number;
  products: { id: number; name: string; size: string | null; images: string[] | null; price: string } | null;
}

interface StorefrontContent {
  marquee_items: string[];
  hero: { headline?: string; subtext?: string };
  features: { icon?: string; title: string; body: string }[];
  promo_banner?: { title?: string; subtitle?: string };
}

interface HomeService {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  duration_minutes: number;
  images: string[] | null;
  category: string | null;
}

// Services priced above this show no price on the homepage — customers select and book a consultation instead
const SERVICE_PRICE_CEILING = 20000;

const FALLBACK_SLIDE: PromoSlide = {
  id: 'fallback',
  title: 'Premier Beauty Clinic',
  subtitle: 'Nairobi\'s trusted skin clinic — shop products or book a treatment',
  image_url: 'https://images.unsplash.com/photo-1663271451789-a770bfbcb12a?w=1080&q=80&auto=format&fit=crop',
  cta_text: 'Shop Now',
  cta_link: '/shop',
  sort_order: 0,
};

export function Home() {
  const [slides, setSlides]                     = useState<PromoSlide[]>([]);
  const [activeSlide, setActiveSlide]           = useState(0);
  const [loadingSlides, setLoadingSlides]       = useState(true);
  const [storefrontContent, setStorefrontContent] = useState<StorefrontContent>({ marquee_items: [], hero: {}, features: [] });
  const [kits, setKits]                         = useState<KitProduct[]>([]);
  const [newArrivals, setNewArrivals]           = useState<KitProduct[]>([]);
  const [featuredReviews, setFeaturedReviews]   = useState<FeaturedReview[]>([]);
  const [services, setServices]                 = useState<HomeService[]>([]);
  const [isHeroPaused, setIsHeroPaused]         = useState(false);
  const [shopBannerIndex, setShopBannerIndex]   = useState(0);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  const scrollReviews = (direction: 1 | -1) => {
    reviewsScrollRef.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  // Shop banner background — quiet slow crossfade through real product photos, no visible controls
  const shopBannerImages = useMemo(() => {
    const imgs = [...newArrivals, ...kits]
      .map(p => p.images?.[0])
      .filter((src): src is string => !!src);
    const unique = [...new Set(imgs)].slice(0, 6);
    return unique.length > 0 ? unique : ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80&auto=format&fit=crop'];
  }, [newArrivals, kits]);

  useEffect(() => {
    if (shopBannerImages.length <= 1) return;
    const t = setInterval(() => setShopBannerIndex(i => (i + 1) % shopBannerImages.length), 4500);
    return () => clearInterval(t);
  }, [shopBannerImages.length]);

  useEffect(() => {
    apiFetch('/promo-carousel')
      .then((data: PromoSlide[]) => setSlides(data && data.length > 0 ? data : [FALLBACK_SLIDE]))
      .catch(() => setSlides([FALLBACK_SLIDE]))
      .finally(() => setLoadingSlides(false));

    apiFetch('/storefront-content')
      .then((data: StorefrontContent) => setStorefrontContent(data))
      .catch(() => {});

    apiFetch('/products')
      .then((data: KitProduct[]) => {
        const kitProducts = (data || []).filter(
          p => p.product_group === 'starter_kits' || p.categories?.slug === 'starter-kits'
        );
        setKits(kitProducts.slice(0, 8));

        // New arrivals: highest IDs (most recently added), exclude kits
        const nonKits = (data || []).filter(
          p => p.product_group !== 'starter_kits' && p.categories?.slug !== 'starter-kits'
        );
        const byNewest = [...nonKits].sort((a, b) => b.id - a.id);
        setNewArrivals(byNewest.slice(0, 8));
      })
      .catch(() => {});

    apiFetch('/reviews/featured?limit=12')
      .then((data: FeaturedReview[]) => setFeaturedReviews(data || []))
      .catch(() => {});

    apiFetch('/services')
      .then((data: HomeService[]) => setServices(data || []))
      .catch(() => {});
  }, []);

  const goNext = useCallback(() => setActiveSlide(i => (i + 1) % Math.max(slides.length, 1)), [slides.length]);
  const goPrev = useCallback(() => setActiveSlide(i => (i - 1 + slides.length) % Math.max(slides.length, 1)), [slides.length]);

  // Auto-rotate carousel every 5 seconds, pausing on hover
  useEffect(() => {
    if (slides.length <= 1 || isHeroPaused) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [slides.length, goNext, isHeroPaused]);

  const displaySlides = slides.length > 0 ? slides : [FALLBACK_SLIDE];

  // Homepage only shows the affordable tier as cards; higher-value programs live on the Services page.
  const pricedServices = services.filter(s => s.base_price > 0 && s.base_price <= SERVICE_PRICE_CEILING);

  return (
    <div className="pt-[70px] md:pt-[100px] bg-[#F2F1F8]">

      {/* ── Section 1: Split-panel hero ──────────────────────────────────────── */}
      <section
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_1fr] bg-[#1A1A1A]"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        {/* Text panel — all copy + nav chrome lives here, never on top of the photo */}
        <div className="order-2 lg:order-1 relative flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-16 py-12 lg:py-0 lg:min-h-[70vh]">
          {loadingSlides ? (
            <div className="space-y-4 max-w-md">
              <div className="h-3 w-32 bg-white/10 rounded-full animate-pulse" />
              <div className="h-10 w-full bg-white/10 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-white/10 rounded-full animate-pulse" />
              <div className="h-11 w-40 bg-white/10 rounded-full animate-pulse mt-2" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span className="text-white/50 text-xs font-bold uppercase tracking-[0.2em]">Premier Beauty Clinic</span>
              </div>

              <motion.h1
                key={`title-${activeSlide}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="font-serif italic text-white leading-[1.08] mb-4"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
              >
                {displaySlides[activeSlide]?.title}
              </motion.h1>

              {displaySlides[activeSlide]?.subtitle && (
                <motion.p
                  key={`sub-${activeSlide}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 1, 0.5, 1] }}
                  className="text-white/65 text-base md:text-lg mb-8 max-w-md leading-relaxed"
                >
                  {displaySlides[activeSlide]?.subtitle}
                </motion.p>
              )}

              <motion.div
                key={`cta-${activeSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14, ease: [0.25, 1, 0.5, 1] }}
              >
                <Link
                  to={displaySlides[activeSlide]?.cta_link ?? '/shop'}
                  className="inline-flex items-center bg-[#6D4C91] text-white px-7 py-3.5 rounded-full font-bold hover:bg-[#5c3f80] transition-colors duration-300"
                >
                  {displaySlides[activeSlide]?.cta_text}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>

              {/* Slide nav — counter + prev/next + progress, all off the photo */}
              {displaySlides.length > 1 && (
                <div className="flex items-center gap-5 mt-12 lg:mt-16">
                  <div className="flex items-center gap-3 text-white/40">
                    <button onClick={goPrev} aria-label="Previous slide" className="hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <span className="text-xs font-semibold tabular-nums text-white/70">
                      {String(activeSlide + 1).padStart(2, '0')} / {String(displaySlides.length).padStart(2, '0')}
                    </span>
                    <button onClick={goNext} aria-label="Next slide" className="hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex gap-1.5 max-w-[140px]">
                    {displaySlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className="h-[2px] flex-1 rounded-full bg-white/15 overflow-hidden"
                      >
                        {i < activeSlide && <div className="h-full w-full bg-white/70 rounded-full" />}
                        {i === activeSlide && (
                          <motion.div
                            key={`progress-${activeSlide}`}
                            className="h-full bg-white rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Photo panel — clean full-bleed image, no overlay, no floating chrome */}
        <div className="order-1 lg:order-2 relative h-[42vh] lg:h-auto lg:min-h-[70vh] overflow-hidden">
          {loadingSlides ? (
            <div className="w-full h-full bg-white/5 animate-pulse" />
          ) : (
            displaySlides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={false}
                animate={{ opacity: index === activeSlide ? 1 : 0 }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0"
                style={{ zIndex: index === activeSlide ? 1 : 0 }}
              >
                <LazyImage
                  src={slide.image_url}
                  alt=""
                  priority={index === 0}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* ── Marquee announcement bar ─────────────────────────────────────────── */}
      {storefrontContent.marquee_items.length > 0 && (
        <div className="bg-[#1A1A1A] text-white overflow-hidden py-3">
          <div className="flex animate-marquee whitespace-nowrap gap-16 px-8">
            {[...storefrontContent.marquee_items, ...storefrontContent.marquee_items].map((item, i) => (
              <span key={i} className="text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D4C91] inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 2: New Arrivals ──────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#6D4C91] text-xs font-bold uppercase tracking-widest mb-2">Just Landed</p>
                <h2 className="text-[26px] md:text-[38px] font-serif italic leading-tight">New Arrivals</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Fresh additions to our skincare range — be the first to try them.</p>
              </div>
              <Link to="/shop" className="hidden sm:inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1 shrink-0">
                Shop All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
              {newArrivals.map((product, index) => {
                const avgRating = Number(product.product_avg_ratings?.average_rating || 0);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="snap-start shrink-0 w-60 md:w-auto"
                  >
                    <Link
                      to={`/shop/${product.id}`}
                      className="group block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#F2F1F8]">
                        {product.images?.[0] ? (
                          <LazyImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-[#6D4C91]/30" />
                          </div>
                        )}
                        <div className="absolute top-3 left-0 bg-[#1A1A1A] text-white text-[10px] font-bold pl-3 pr-3.5 py-1.5 rounded-r-full uppercase tracking-widest shadow-sm">
                          New
                        </div>
                        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="block text-center bg-white/95 backdrop-blur-sm text-gray-900 text-[11px] font-bold uppercase tracking-widest py-2 rounded-full">
                            View Product
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        {product.categories?.name && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{product.categories.name}</p>
                        )}
                        <p className="font-bold text-sm leading-tight mb-2 line-clamp-2">
                          {product.name}
                          {product.size && <span className="text-gray-400 font-medium"> · {product.size}</span>}
                        </p>
                        {avgRating > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">{avgRating.toFixed(1)}</span>
                          </div>
                        )}
                        <p className="text-sm font-bold text-[#6D4C91]">KES {Number(product.price).toLocaleString()}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/shop" className="inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1">
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: Shop Our Kits ─────────────────────────────────────────── */}
      {kits.length > 0 && (
        <section className="py-16 md:py-24 bg-[#F2F1F8]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#6D4C91] text-xs font-bold uppercase tracking-widest mb-2">Curated Bundles</p>
                <h2 className="text-[26px] md:text-[38px] font-serif italic leading-tight">Shop Our Kits</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Complete skincare routines — everything you need in one bundle.</p>
              </div>
              <Link to="/shop" className="hidden sm:inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1 shrink-0">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
              {kits.map((kit, index) => (
                <motion.div
                  key={kit.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="snap-start shrink-0 w-64 md:w-auto"
                >
                  <Link
                    to={`/shop/${kit.id}`}
                    className="group block relative overflow-hidden rounded-2xl aspect-[4/5] hover:shadow-xl transition-shadow duration-300"
                  >
                    {kit.images?.[0] ? (
                      <LazyImage
                        src={kit.images[0]}
                        alt={kit.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-[#6D4C91]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    <div className="absolute top-3 left-0 bg-white/95 text-[#6D4C91] text-[10px] font-bold pl-3 pr-3.5 py-1.5 rounded-r-full uppercase tracking-widest">
                      Kit
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-bold text-sm leading-tight mb-1 line-clamp-2 text-white">
                        {kit.name}
                        {kit.size && <span className="text-white/60 font-medium"> · {kit.size}</span>}
                      </p>
                      {kit.categories?.name && (
                        <p className="text-xs text-white/60 mb-1.5">{kit.categories.name}</p>
                      )}
                      <p className="text-sm font-bold text-white">KES {Number(kit.price).toLocaleString()}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/shop" className="inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1">
                View All Kits <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 4: Our Services ───────────────────────────────────────────── */}
      {services.length > 0 && (
        <section className="py-16 md:py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <p className="text-[#6D4C91] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-4">In-Clinic Treatments</p>
                <h2 className="text-[26px] md:text-[42px] font-serif leading-tight italic">Our Services</h2>
                <p className="text-gray-500 mt-2 md:mt-4 text-sm md:text-base max-w-md">
                  Clinically-proven treatments performed by certified professionals.
                </p>
              </div>
              <Link to="/services" className="hidden sm:inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1 shrink-0">
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Priced treatments — auto-scrolling strip of cards */}
            {pricedServices.length > 0 && (
              <div className="overflow-hidden -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-5 w-max animate-marquee-cards hover:[animation-play-state:paused]">
                  {[...pricedServices, ...pricedServices].map((service, index) => (
                  <div
                    key={`${service.id}-${index}`}
                    className="shrink-0 w-60"
                  >
                    <Link
                      to={`/book?service=${service.id}`}
                      className="group block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#F2F1F8]">
                        {service.images?.[0] ? (
                          <LazyImage
                            src={service.images[0]}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : null}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#6D4C91] text-xs font-bold px-3 py-1.5 rounded-full">
                          KES {Number(service.base_price).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4">
                        {service.category && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{service.category}</p>
                        )}
                        <p className="font-bold text-sm leading-tight mb-1 line-clamp-2">{service.name}</p>
                        {service.duration_minutes > 0 && (
                          <p className="text-xs text-gray-400">{service.duration_minutes} min</p>
                        )}
                      </div>
                    </Link>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Section 5: Loved By Our Customers ────────────────────────────────── */}
      {featuredReviews.length > 0 && (
        <section className="py-16 md:py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#6D4C91] text-xs font-bold uppercase tracking-widest mb-2">Real Results</p>
                <h2 className="text-[26px] md:text-[38px] font-serif italic leading-tight">Loved By Our Customers</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Genuine reviews from customers who've tried our products.</p>
              </div>
              <div className="hidden sm:flex gap-2 shrink-0">
                <button
                  onClick={() => scrollReviews(-1)}
                  aria-label="Previous reviews"
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#6D4C91] hover:text-white hover:border-[#6D4C91] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={() => scrollReviews(1)}
                  aria-label="Next reviews"
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#6D4C91] hover:text-white hover:border-[#6D4C91] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={reviewsScrollRef}
              className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            >
              {featuredReviews.map((review) => (
                <div
                  key={review.id}
                  className="snap-start shrink-0 w-[300px] bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-lg transition-shadow duration-300"
                >
                  <Link
                    to={`/shop/${review.products!.id}`}
                    className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#F2F1F8]"
                  >
                    {review.products!.images?.[0] ? (
                      <LazyImage
                        src={review.products!.images[0]}
                        alt={review.products!.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-[#6D4C91]/30" />
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <Link
                      to={`/shop/${review.products!.id}`}
                      className="font-bold text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#6D4C91] transition-colors line-clamp-1 block"
                    >
                      {review.products!.name}
                    </Link>
                    <p className="text-sm text-gray-700 line-clamp-3 mt-1.5">&ldquo;{review.body}&rdquo;</p>
                    <p className="text-xs text-gray-400 mt-2 font-semibold">
                      {review.reviewer_name}
                      {review.is_verified_purchase && <span className="text-[#6D4C91]"> · Verified Purchase</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 6: Promotional Banners ───────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F2F1F8]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

            {/* Treatments banner */}
            <Link
              to="/services"
              className="group relative rounded-3xl overflow-hidden min-h-[340px] flex items-end"
            >
              <LazyImage
                src="https://images.unsplash.com/photo-1570172619694-1b26a1e0a9b1?w=900&q=80&auto=format&fit=crop"
                alt="Facial treatment"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative p-8 md:p-10 text-white">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">In-Clinic</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                  {storefrontContent.promo_banner?.title || 'Explore Our Treatments'}
                </h2>
                <p className="text-sm md:text-base mb-6 text-white/85 max-w-sm">
                  {storefrontContent.promo_banner?.subtitle || 'Clinically-proven facials, chemical peels & advanced skin treatments performed by certified professionals.'}
                </p>
                <span className="inline-flex items-center bg-white text-[#6D4C91] px-6 py-3 rounded-full font-bold group-hover:bg-gray-100 transition-colors">
                  View Services
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Shop banner */}
            <Link
              to="/shop"
              className="group relative rounded-3xl overflow-hidden min-h-[340px] flex items-end"
            >
              <div className="absolute inset-0 z-0">
                {shopBannerImages.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={false}
                    animate={{ opacity: i === shopBannerIndex ? 1 : 0 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <LazyImage
                      src={src}
                      alt=""
                      priority={i === 0}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </motion.div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-0" />
              <div className="relative z-10 p-8 md:p-10 text-white">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">Online Store</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">Shop Our Products</h2>
                <p className="text-sm md:text-base mb-6 text-white/85 max-w-sm">
                  Dermatologist-loved skincare, fragrances & wellness essentials, delivered to your door.
                </p>
                <span className="inline-flex items-center bg-white text-[#6D4C91] px-6 py-3 rounded-full font-bold group-hover:bg-gray-100 transition-colors">
                  Shop Products
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}
