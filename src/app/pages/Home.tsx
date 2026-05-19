import { useEffect, useState, useCallback } from 'react';
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
  price: string;
  images: string[] | null;
  product_group: string | null;
  categories: { name: string; slug: string } | null;
  product_avg_ratings: { average_rating: string; rating_count: string } | null;
}

interface StorefrontContent {
  marquee_items: string[];
  hero: { headline?: string; subtext?: string };
  features: { icon?: string; title: string; body: string }[];
  skin_concerns?: { label: string; image: string }[];
  promo_banner?: { title?: string; subtitle?: string };
}

const CONCERNS: { label: string; link: string; defaultImage: string }[] = [
  { label: 'Acne',              link: '/skin-concern/acne',              defaultImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&auto=format&fit=crop' },
  { label: 'Hyperpigmentation', link: '/skin-concern/hyperpigmentation', defaultImage: 'https://images.unsplash.com/photo-1598440947425-9a9fce886e7d?w=400&q=80&auto=format&fit=crop' },
  { label: 'Ageing & Wrinkles', link: '/skin-concern/ageing-wrinkles',  defaultImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80&auto=format&fit=crop' },
  { label: 'Dryness',           link: '/skin-concern/dryness',          defaultImage: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&q=80&auto=format&fit=crop' },
  { label: 'Dark Circles',      link: '/skin-concern/dark-circles',     defaultImage: 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400&q=80&auto=format&fit=crop' },
  { label: 'Sensitivity',       link: '/skin-concern/sensitivity',      defaultImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&auto=format&fit=crop' },
  { label: 'Melasma',           link: '/skin-concern/melasma',          defaultImage: 'https://images.unsplash.com/photo-1616394584578-b42aa4e5d9f3?w=400&q=80&auto=format&fit=crop' },
  { label: 'Oily Skin',         link: '/skin-concern/oily-skin',        defaultImage: 'https://images.unsplash.com/photo-1546961342-ea5f62a193dd?w=400&q=80&auto=format&fit=crop' },
  { label: 'Scarring',          link: '/skin-concern/scarring',         defaultImage: 'https://images.unsplash.com/photo-1601049541271-36e5d2f7c15a?w=400&q=80&auto=format&fit=crop' },
  { label: 'Dullness',          link: '/skin-concern/dullness',         defaultImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80&auto=format&fit=crop' },
];

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
  }, []);

  const goNext = useCallback(() => setActiveSlide(i => (i + 1) % Math.max(slides.length, 1)), [slides.length]);
  const goPrev = useCallback(() => setActiveSlide(i => (i - 1 + slides.length) % Math.max(slides.length, 1)), [slides.length]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [slides.length, goNext]);

  const displaySlides = slides.length > 0 ? slides : [FALLBACK_SLIDE];

  return (
    <div className="pt-[70px] md:pt-[100px] bg-[#F2F1F8]">

      {/* ── Section 1: Promotional Carousel ─────────────────────────────────── */}
      <section className="relative bg-gray-900">
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          {loadingSlides ? (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : (
            <>
              {/* Slides */}
              {displaySlides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={false}
                  animate={{ opacity: index === activeSlide ? 1 : 0, zIndex: index === activeSlide ? 1 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <LazyImage
                    src={slide.image_url}
                    alt=""
                    priority={index === 0}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/60 flex items-center justify-center">
                    <div className="text-center text-white px-4 max-w-2xl">
                      <motion.h2
                        key={`title-${activeSlide}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-5xl font-bold mb-3"
                      >
                        {slide.title}
                      </motion.h2>
                      {slide.subtitle && (
                        <motion.p
                          key={`sub-${activeSlide}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="text-base md:text-xl mb-6 text-white/90"
                        >
                          {slide.subtitle}
                        </motion.p>
                      )}
                      <motion.div
                        key={`cta-${activeSlide}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Link
                          to={slide.cta_link}
                          className="inline-flex items-center bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-[#6D4C91] hover:text-white transition-all duration-300"
                        >
                          {slide.cta_text}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Prev / Next buttons */}
              {displaySlides.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                    aria-label="Previous slide"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {displaySlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={`transition-all duration-300 rounded-full ${i === activeSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
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

      {/* ── Section 2: What's Your Skin Concern? ─────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[#6D4C91] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-4">Find Your Solution</p>
            <h2 className="text-[26px] md:text-[42px] font-serif leading-tight italic">What's Your Skin Concern?</h2>
            <p className="text-gray-500 mt-2 md:mt-4 text-sm md:text-base max-w-xl mx-auto">
              Every concern has a solution. Tap yours to discover targeted treatments and products.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {CONCERNS.map((c, index) => {
              const customImg = storefrontContent.skin_concerns?.find(sc => sc.label === c.label)?.image;
              const imgSrc = customImg || c.defaultImage;
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    to={c.link}
                    className="group block relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
                  >
                    <LazyImage
                      src={imgSrc}
                      alt={c.label}
                      fallbackSrc={c.defaultImage}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#6D4C91]/0 group-hover:bg-[#6D4C91]/50 transition-all duration-300" />
                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <p className="text-white font-bold text-xs md:text-sm leading-tight">{c.label}</p>
                      <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1 group-hover:text-white transition-colors">
                        See solutions <ChevronRight className="w-3 h-3" />
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/book"
              className="inline-flex items-center bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-[#6D4C91] transition-colors"
            >
            Book A Skin Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 3: New Arrivals ──────────────────────────────────────────── */}
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
                      className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
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
                        <div className="absolute top-3 left-3 bg-[#6D4C91] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                          New
                        </div>
                      </div>
                      <div className="p-4">
                        {product.categories?.name && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{product.categories.name}</p>
                        )}
                        <p className="font-bold text-sm leading-tight mb-2 line-clamp-2">{product.name}</p>
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

      {/* ── Section 4: Shop Our Kits ─────────────────────────────────────────── */}
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
                    className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {kit.images?.[0] ? (
                        <LazyImage
                          src={kit.images[0]}
                          alt={kit.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F2F1F8] flex items-center justify-center">
                          <ShoppingBag className="w-10 h-10 text-[#6D4C91]/30" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#6D4C91] text-white text-xs font-bold px-3 py-1 rounded-full">
                        Kit
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm leading-tight mb-1 line-clamp-2">{kit.name}</p>
                      {kit.categories?.name && (
                        <p className="text-xs text-gray-400 mb-2">{kit.categories.name}</p>
                      )}
                      <p className="text-sm font-bold text-[#6D4C91]">KES {Number(kit.price).toLocaleString()}</p>
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

      {/* ── Section 5: Promotional Banner ────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F2F1F8]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="relative bg-gradient-to-r from-[#6D4C91] to-[#8B5CF6] rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[280px]">
              <div className="p-8 md:p-14 text-white">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Premier Beauty Clinic</p>
                <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                  {storefrontContent.promo_banner?.title || 'Explore Our Treatments'}
                </h2>
                <p className="text-base md:text-lg mb-8 text-white/85">
                  {storefrontContent.promo_banner?.subtitle || 'Clinically-proven facials, chemical peels & advanced skin treatments performed by certified professionals.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/services"
                    className="inline-flex items-center bg-white text-[#6D4C91] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                  >
                    View Services
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-[#6D4C91] transition-all"
                  >
                    Shop Products
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block h-full">
                <LazyImage
                  src="https://images.unsplash.com/photo-1707544738443-c8ff4113c9c5?w=600&q=80&auto=format&fit=crop"
                  alt="Skin treatment"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
