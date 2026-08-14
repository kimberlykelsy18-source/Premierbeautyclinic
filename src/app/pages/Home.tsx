import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronRight, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';
import { LazyImage } from '../components/LazyImage';

interface KitProduct {
  id: number;
  name: string;
  size: string | null;
  price: string;
  images: string[] | null;
  product_group: string | null;
  brand: string | null;
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

// Best Sellers section — curated product order, Anua TXA serum and the Medicube
// cleanser leading, followed by the rest in this fixed order.
const BESTSELLER_IDS = [2242, 2322, 2357, 2363, 2370, 2223, 2094, 2201];

// Treatments banner background — quiet slow crossfade through real in-clinic photos
const TREATMENTS_BANNER_IMAGES = [
  'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/banners/1786565117000-banner-treatments-happy-client.jpg',
  'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/banners/1786566358000-banner-whatsapp1.jpg',
  'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/banners/1786566358000-banner-led-sunglasses.jpg',
  'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/banners/1786566358000-banner-consultation.jpg',
  'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/banners/1786566786000-quote-wall-1.jpg',
  'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/banners/1786566786000-banner-whatsapp2.jpg',
  'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/banners/1786566786000-quote-wall-3.jpg',
];

// Premier Routines — curated multi-product routine shots, replacing the old rotating
// hero. "Shop Now" doesn't add to cart (these are groupings, not a single SKU) — it
// opens WhatsApp with the routine name pre-filled, same handoff pattern used sitewide
// since card/M-Pesa checkout was paused (see Checkout.tsx / WhatsAppButton.tsx).
const WHATSAPP_NUMBER = '254768679646';

interface Routine {
  title: string;
  description: string;
  image: string;
  bg: string;
}

const ROUTINES: Routine[] = [
  {
    title: 'Clear Skin Reset',
    description: 'Benzoyl peroxide, an Effaclar cleanser and a K-beauty toner team up to calm breakouts and clear congestion.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628585960-Premier_Poducts_377.jpg',
    bg: '#E8EDE3',
  },
  {
    title: 'Deep Hydration Ritual',
    description: 'Cleansing oil, an intensive balm and SPF layer together for skin that drinks in moisture and stays protected.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628586680-Premier_Poducts_382.jpg',
    bg: '#E3EBF2',
  },
  {
    title: 'Calm & Repair',
    description: 'Cica-powered creams and a gentle oil-to-foam cleanser soothe redness and help skin bounce back.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628587141-Premier_Poducts_384.jpg',
    bg: '#F2E7E5',
  },
  {
    title: 'Everyday Essentials',
    description: 'A purifying cleanser, daily SPF and a gentle exfoliant — the steps that keep skin balanced, every single day.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628587935-Premier_Poducts_388.jpg',
    bg: '#F5EFE4',
  },
  {
    title: 'Smooth & Resurface',
    description: 'A glycolic peel and a urea-rich cream work through rough, bumpy texture for skin that feels newly smooth.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628588451-Premier_Poducts_391.jpg',
    bg: '#F5E9DD',
  },
  {
    title: 'Glow & Hydrate',
    description: 'An aloe cleanser and a gluta-hya lotion pair up for that soft, dewy, ready-for-anything glow.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628589012-Premier_Poducts_397.jpg',
    bg: '#EDE6F5',
  },
];

function routineWhatsAppLink(title: string) {
  const message = `Hi! I'd like to shop the "${title}" routine from Premier Beauty Clinic 💜`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Shared by the treatments/shop promo banners — quiet slow crossfade through a set of photos.
// Images are absolute inset-0 (all sharing the same box), so they're mounted progressively as the
// rotation reaches them rather than all at once — otherwise native lazy-loading fetches all of them
// the instant the shared box scrolls into view, since it can't tell them apart by position.
// Shared card-row layout for the three new homepage rows (Consultations, Best Sellers,
// Treatments) — same visual language as the existing New Arrivals section (left untouched
// on purpose), just parameterised so it isn't copy-pasted three times.
function ProductRowSection({
  kicker, title, subtitle, ctaLabel, ctaTo, badge, products, bg = 'bg-white',
}: {
  kicker: string; title: string; subtitle: string; ctaLabel: string; ctaTo: string; badge: string;
  products: KitProduct[]; bg?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className={`py-16 md:py-24 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#6D4C91] text-xs font-bold uppercase tracking-widest mb-2">{kicker}</p>
            <h2 className="text-[26px] md:text-[38px] font-serif italic leading-tight">{title}</h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">{subtitle}</p>
          </div>
          <Link to={ctaTo} className="hidden sm:inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1 shrink-0">
            {ctaLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-pan-x -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
          {products.map((product, index) => {
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
                  className="group block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
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
                      {badge}
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
          <Link to={ctaTo} className="inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1">
            {ctaLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Same row layout as ProductRowSection, for services (Consultations, Treatments) —
// links to booking instead of a product page, shows duration instead of a rating.
function ServiceRowSection({
  kicker, title, subtitle, ctaLabel, ctaTo, badge, services, bg = 'bg-[#F2F1F8]',
}: {
  kicker: string; title: string; subtitle: string; ctaLabel: string; ctaTo: string; badge: string;
  services: HomeService[]; bg?: string;
}) {
  if (services.length === 0) return null;
  return (
    <section className={`py-16 md:py-24 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#6D4C91] text-xs font-bold uppercase tracking-widest mb-2">{kicker}</p>
            <h2 className="text-[26px] md:text-[38px] font-serif italic leading-tight">{title}</h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">{subtitle}</p>
          </div>
          <Link to={ctaTo} className="hidden sm:inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1 shrink-0">
            {ctaLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-pan-x -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="snap-start shrink-0 w-60 md:w-auto"
            >
              <Link
                to={`/book?service=${service.id}`}
                className="group block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F2F1F8]">
                  {service.images?.[0] ? (
                    <LazyImage
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}
                  <div className="absolute top-3 left-0 bg-[#1A1A1A] text-white text-[10px] font-bold pl-3 pr-3.5 py-1.5 rounded-r-full uppercase tracking-widest shadow-sm">
                    {badge}
                  </div>
                  <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="block text-center bg-[#6D4C91] text-white text-[11px] font-bold uppercase tracking-widest py-2 rounded-full">
                      Book Now
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {service.category && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{service.category}</p>
                  )}
                  <p className="font-bold text-sm leading-tight mb-2 line-clamp-2">{service.name}</p>
                  {service.duration_minutes > 0 && (
                    <p className="text-xs text-gray-500 mb-2">{service.duration_minutes} min</p>
                  )}
                  <p className="text-sm font-bold text-[#6D4C91]">KES {Number(service.base_price).toLocaleString()}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to={ctaTo} className="inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1">
            {ctaLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CrossfadeBanner({ images, intervalMs = 4500 }: { images: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIndex(i => {
        const next = (i + 1) % images.length;
        setMounted(prev => (prev.has(next) ? prev : new Set(prev).add(next)));
        return next;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  return (
    <div className="absolute inset-0 z-0">
      {images.map((src, i) => mounted.has(i) && (
        <motion.div
          key={src}
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <LazyImage
            src={src}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </motion.div>
      ))}
    </div>
  );
}

export function Home() {
  const [storefrontContent, setStorefrontContent] = useState<StorefrontContent>({ marquee_items: [], hero: {}, features: [] });
  const [kits, setKits]                         = useState<KitProduct[]>([]);
  const [koreanProducts, setKoreanProducts]     = useState<KitProduct[]>([]);
  const [bestSellers, setBestSellers]           = useState<KitProduct[]>([]);
  const [featuredReviews, setFeaturedReviews]   = useState<FeaturedReview[]>([]);
  const [services, setServices]                 = useState<HomeService[]>([]);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  const scrollReviews = (direction: 1 | -1) => {
    reviewsScrollRef.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  // Shop banner background — quiet slow crossfade through real product photos, no visible controls
  const shopBannerImages = useMemo(() => {
    const imgs = [...koreanProducts, ...kits]
      .map(p => p.images?.[0])
      .filter((src): src is string => !!src);
    const unique = [...new Set(imgs)].slice(0, 6);
    return unique.length > 0 ? unique : ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80&auto=format&fit=crop'];
  }, [koreanProducts, kits]);

  useEffect(() => {
    apiFetch('/storefront-content')
      .then((data: StorefrontContent) => setStorefrontContent(data))
      .catch(() => {});

    apiFetch('/products')
      .then((data: KitProduct[]) => {
        const kitProducts = (data || []).filter(
          p => p.product_group === 'starter_kits' || p.categories?.slug === 'starter-kits'
        );
        setKits(kitProducts.slice(0, 8));

        const nonKits = (data || []).filter(
          p => p.product_group !== 'starter_kits' && p.categories?.slug !== 'starter-kits'
        );

        // Korean Products: Medicube and Anua only
        const korean = nonKits.filter(p => p.brand === 'Medicube' || p.brand === 'Anua');
        setKoreanProducts(korean.slice(0, 8));

        // Best sellers — curated order (not algorithmic): Anua TXA serum and Medicube
        // Azelaic acid+niacinamide deep foam cleanser lead, followed by the rest below.
        const byId = new Map(nonKits.map(p => [p.id, p]));
        const curated = BESTSELLER_IDS.map(id => byId.get(id)).filter((p): p is KitProduct => !!p);
        setBestSellers(curated);
      })
      .catch(() => {});

    apiFetch('/reviews/featured?limit=12')
      .then((data: FeaturedReview[]) => setFeaturedReviews(data || []))
      .catch(() => {});

    apiFetch('/services')
      .then((data: HomeService[]) => setServices(data || []))
      .catch(() => {});
  }, []);

  // Homepage only shows the affordable tier as cards; higher-value programs live on the Services page.
  const pricedServices = services.filter(s => s.base_price > 0 && s.base_price <= SERVICE_PRICE_CEILING);

  // Consultations row — imaging/analysis services, shown before any treatment is picked.
  const consultationServices = services.filter(s => s.category === 'Imaging & Consultation');
  // Treatments row — the rest of the priced catalog, excluding consultations (already their own row above).
  const treatmentServices = pricedServices.filter(s => s.category !== 'Imaging & Consultation').slice(0, 8);

  return (
    <div className="bg-[#F2F1F8]">

      {/* ── Section 1: Premier Routines — replaces the old rotating hero. No top
          padding: the dark background runs right up under the fixed navbar, same
          flush-top treatment the hero used to have. Cards drift slowly and pause
          on hover so a customer can actually read one before it scrolls away. */}
      <section className="bg-[#1A1A1A] pt-20 pb-12 md:pt-[152px] md:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-10">
          <p className="text-[#B79FD1] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3">Curated For You</p>
          <h1 className="text-white font-serif italic text-[28px] md:text-[44px] leading-tight max-w-xl">Premier Routines</h1>
        </div>

        <div className="flex gap-5 md:gap-6 w-max animate-marquee-cards hover:[animation-play-state:paused] pl-4 md:pl-8">
          {[...ROUTINES, ...ROUTINES].map((routine, index) => (
            <div key={`${routine.title}-${index}`} className="shrink-0 w-[250px] sm:w-[280px] md:w-[300px] rounded-2xl overflow-hidden">
              <div className="aspect-square overflow-hidden bg-white">
                <LazyImage
                  src={routine.image}
                  alt={routine.title}
                  priority={index < ROUTINES.length}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5" style={{ backgroundColor: routine.bg }}>
                <h3 className="font-bold text-[16px] md:text-[18px] text-[#1A1A1A] mb-1.5 leading-snug">{routine.title}</h3>
                <p className="text-[12px] md:text-[13px] text-[#1A1A1A]/65 leading-relaxed mb-3">{routine.description}</p>
                <a
                  href={routineWhatsAppLink(routine.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#6D4C91] hover:text-[#5a3e79] transition-colors"
                >
                  Shop Now <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
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

      {/* ── Section 1b: Consultations ─────────────────────────────────────────── */}
      <ServiceRowSection
        kicker="Start Here"
        title="Consultations"
        subtitle="Get to know your skin before you treat it — imaging, analysis and expert consults."
        ctaLabel="View All"
        ctaTo="/services?category=Imaging%20%26%20Consultation"
        badge="Consult"
        services={consultationServices}
      />

      {/* ── Section 2: Korean Products ────────────────────────────────────────── */}
      <ProductRowSection
        kicker="K-Beauty"
        title="Korean Products"
        subtitle="Cult-favorite Medicube and Anua skincare, straight from Korea."
        ctaLabel="Shop All"
        ctaTo="/shop"
        badge="K-Beauty"
        products={koreanProducts}
      />

      {/* ── Section 2b: Best Sellers ──────────────────────────────────────────── */}
      <ProductRowSection
        kicker="Customer Favorites"
        title="Best Sellers"
        subtitle="The products our customers can't stop repurchasing."
        ctaLabel="Shop All"
        ctaTo="/shop?collection=Bestsellers"
        badge="Bestseller"
        products={bestSellers}
        bg="bg-[#F2F1F8]"
      />

      {/* ── Section 2c: Treatments ────────────────────────────────────────────── */}
      <ServiceRowSection
        kicker="In-Clinic"
        title="Popular Treatments"
        subtitle="Clinically-proven treatments performed by certified professionals."
        ctaLabel="View All Services"
        ctaTo="/services"
        badge="Treatment"
        services={treatmentServices}
        bg="bg-white"
      />

      {/* ── Section 3: Shop Our Kits ─────────────────────────────────────────── */}
      {kits.length > 0 && (
        <section className="py-16 md:py-24 bg-[#F2F1F8]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#6D4C91] text-xs font-bold uppercase tracking-widest mb-2">Curated Bundles</p>
                <h2 className="text-[26px] md:text-[38px] font-serif italic leading-tight">Shop Our Kits</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Complete skincare routines: everything you need in one bundle.</p>
              </div>
              <Link to="/shop" className="hidden sm:inline-flex items-center text-sm font-bold text-[#6D4C91] hover:underline gap-1 shrink-0">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-pan-x -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
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
              className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-pan-x -mx-4 px-4 md:mx-0 md:px-0"
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
              className="group relative rounded-3xl overflow-hidden min-h-[340px] md:min-h-[520px] flex items-end"
            >
              <CrossfadeBanner images={TREATMENTS_BANNER_IMAGES} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-0" />
              <div className="relative z-10 p-8 md:p-10 text-white">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">In-Clinic</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                  {storefrontContent.promo_banner?.title || 'Feel The Glow Radiate'}
                </h2>
                <p className="text-sm md:text-base mb-6 text-white/85 max-w-sm">
                  {storefrontContent.promo_banner?.subtitle || "From facials to advanced peels, our certified therapists craft every treatment around your skin's unique needs."}
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
              className="group relative rounded-3xl overflow-hidden min-h-[340px] md:min-h-[520px] flex items-end"
            >
              <CrossfadeBanner images={shopBannerImages} />
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
