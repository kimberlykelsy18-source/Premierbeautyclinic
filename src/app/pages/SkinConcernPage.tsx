import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, ShoppingBag, CheckCircle, ChevronRight, Sparkle, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Service {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  deposit_percentage: number;
  duration_minutes: number;
  category: string | null;
  images: string[];
}

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  images: string[] | null;
  brand: string | null;
  size: string | null;
  skin_concerns: string[] | null;
  categories: { name: string; slug: string } | null;
}

// ── Concern metadata ──────────────────────────────────────────────────────────
type ConcernMeta = {
  label: string;
  headline: string;
  tagline: string;
  intro: string;
  serviceSlugKeywords: string[];
  productCategorySlugs: string[];
  treatmentPitch: string;
  selfCarePitch: string;
  treatmentBullets: string[];
};

const CONCERN_MAP: Record<string, ConcernMeta> = {
  'acne': {
    label: 'Acne',
    headline: 'Clearer Skin, Clinically Proven',
    tagline: 'Targeted acne control — visible results from session one',
    intro: 'Acne is driven by excess sebum, bacteria, and inflammation deep inside the pore. Cleansers and spot treatments manage the surface. In-clinic treatment gets to the root — and stays there.',
    serviceSlugKeywords: ['acne', 'deep-cleanse'],
    productCategorySlugs: ['cleansers', 'masks-treatments', 'serums'],
    treatmentPitch: 'Our certified practitioners use salicylic acid exfoliation, medical-grade extractions, blue LED light therapy, and a calming zinc mask — all calibrated to your skin\'s current state. Breakouts are cleared, future congestion is prevented, and your skin barrier is left intact.',
    selfCarePitch: 'The right products can slow breakouts between sessions and protect your results. Pair a gentle, non-stripping cleanser with an exfoliating serum and a targeted treatment mask for weekly congestion control.',
    treatmentBullets: [
      'Medical-grade salicylic acid exfoliation',
      'Safe clinical extractions — no scarring risk',
      'Blue LED therapy to kill bacteria at the source',
      'Calming zinc mask to reduce redness',
      'Personalised post-treatment homecare plan',
    ],
  },
  'hyperpigmentation': {
    label: 'Hyperpigmentation',
    headline: 'Even Out Your Skin Tone',
    tagline: 'Precision brightening for melanin-rich skin',
    intro: 'Dark spots, post-acne marks, and uneven tone are among the most persistent skin concerns — especially in African and melanin-rich skin where treatments must be more carefully calibrated. The wrong approach can trigger more pigmentation.',
    serviceSlugKeywords: ['brightening', 'vitamin-c', 'chemical-peel'],
    productCategorySlugs: ['serums', 'sunscreen', 'moisturisers'],
    treatmentPitch: 'Our practitioners use pharmaceutical-grade vitamin C, kojic acid, and azelaic acid — ingredients chosen specifically for their safety profile on melanin-rich skin. Combined with controlled chemical exfoliation, the results are faster, safer, and longer-lasting than anything you can replicate at home.',
    selfCarePitch: 'A consistent home routine is critical for maintaining and building on your in-clinic results. A high-potency vitamin C serum in the morning and a broadspectrum SPF 50 every single day are non-negotiables.',
    treatmentBullets: [
      'Pharmaceutical-grade vitamin C & kojic acid',
      'Safe for African & melanin-rich skin tones',
      'Controlled chemical exfoliation',
      'Targets PIH, melasma & sun spots',
      'Homecare plan to lock in results',
    ],
  },
  'ageing-wrinkles': {
    label: 'Ageing & Wrinkles',
    headline: 'Turn Back the Clock',
    tagline: 'Clinically-proven collagen stimulation and skin renewal',
    intro: 'Fine lines, sagging, and loss of radiance are natural — but they don\'t have to be permanent. Modern aesthetic treatments can visibly firm, plump, and resurface skin at any age.',
    serviceSlugKeywords: ['anti-aging', 'medium-depth'],
    productCategorySlugs: ['serums', 'moisturisers', 'eye-care'],
    treatmentPitch: 'Our Anti-Aging Facial delivers peptide infusion, retinol micro-delivery, collagen-stimulating massage techniques, and red LED light therapy — all in a single session. The results are cumulative: each visit builds on the last, with visible improvement in firmness, texture, and radiance.',
    selfCarePitch: 'A targeted anti-aging routine reinforces your in-clinic investment. Retinol serums, peptide moisturisers, and dedicated eye treatments work nightly to maintain the collagen stimulation your treatment started.',
    treatmentBullets: [
      'Peptide serum infusion for collagen support',
      'Retinol micro-delivery — clinic-grade strength',
      'Red LED therapy to firm and plump',
      'Targeted eye and neck treatment',
      'Visible lift from the very first session',
    ],
  },
  'dryness': {
    label: 'Dryness',
    headline: 'Deep, Lasting Hydration',
    tagline: 'Restore your moisture barrier from the inside out',
    intro: 'Dry skin is more than a surface problem. When the skin\'s moisture barrier is compromised, it loses water faster than it can retain it. Moisturisers alone can\'t rebuild a damaged barrier — clinical hydration therapy can.',
    serviceSlugKeywords: ['hydrating', 'glow', 'classic'],
    productCategorySlugs: ['moisturisers', 'toners-mists', 'masks-treatments'],
    treatmentPitch: 'Our Hydrating Glow Facial uses multi-layered hyaluronic acid infusion, ceramide recovery mask, and oxygen therapy to instantly plump and restore skin — giving you the glass-skin effect immediately. The barrier-building benefits continue for weeks after.',
    selfCarePitch: 'Your daily routine should focus on retaining the hydration your in-clinic treatment restored. Layer a hydrating toner, a hyaluronic acid serum, and a ceramide-rich moisturiser — and never skip an SPF.',
    treatmentBullets: [
      'Multi-layered hyaluronic acid infusion',
      'Ceramide recovery mask — rebuilds the barrier',
      'Oxygen therapy for instant radiance',
      'Visible plumping from session one',
      'Results last weeks beyond the treatment itself',
    ],
  },
  'dark-circles': {
    label: 'Dark Circles',
    headline: 'Brighter, Fresher Eyes',
    tagline: 'Targeted eye care for visible overnight improvement',
    intro: 'Dark circles can be caused by genetics, thin skin, pigmentation, or chronic fatigue — and each type responds differently. Our practitioners can assess the root cause and recommend the right approach during a consultation.',
    serviceSlugKeywords: ['consultation', 'brightening'],
    productCategorySlugs: ['eye-care', 'serums', 'moisturisers'],
    treatmentPitch: 'During a consultation, your skin practitioner will assess whether your dark circles are pigment-based, vascular, or structural — and build a personalised treatment plan. Many clients see significant improvement combining brightening facials with a targeted home routine.',
    selfCarePitch: 'A dedicated eye cream with caffeine, vitamin K, or retinol applied twice daily is the foundation of any dark-circle routine. Pair with a vitamin C serum in the morning and consistent SPF protection to prevent sun-triggered deepening.',
    treatmentBullets: [
      'Expert assessment of root cause',
      'Personalised treatment plan',
      'Targeted brightening protocols',
      'Product recommendations for your specific type',
      'Combination approach for fastest results',
    ],
  },
  'sensitivity': {
    label: 'Sensitivity',
    headline: 'Calm, Strengthen & Restore',
    tagline: 'Gentle clinical care to rebuild your skin\'s resilience',
    intro: 'Sensitive skin is easily triggered by ingredients, temperature, or stress. The goal isn\'t just soothing reactivity — it\'s rebuilding the barrier so skin becomes less reactive over time.',
    serviceSlugKeywords: ['classic', 'consultation'],
    productCategorySlugs: ['cleansers', 'moisturisers', 'masks-treatments'],
    treatmentPitch: 'Our Classic Facial is fully customised to your skin on the day. For sensitive skin, we select fragrance-free, barrier-strengthening formulations — centella asiatica, niacinamide, ceramides — applied with technique that calms rather than stimulates. Many clients leave with visibly reduced redness after one session.',
    selfCarePitch: 'Simplicity is everything for sensitive skin. A gentle, fragrance-free cleanser, a barrier-repair moisturiser with ceramides, and a mineral SPF are all you need — and all that won\'t backfire. Less is more.',
    treatmentBullets: [
      'Fully customised to your skin\'s reactivity level',
      'Fragrance-free, hypoallergenic formulations only',
      'Centella & ceramide barrier-building actives',
      'Visible redness reduction from session one',
      'Ongoing personalised product guidance',
    ],
  },
  'melasma': {
    label: 'Melasma',
    headline: 'Tackle Melasma with Precision',
    tagline: 'Safe, controlled brightening for stubborn pigmentation',
    intro: 'Melasma is one of the most challenging skin conditions to treat — triggered by hormones, sun, and heat, it\'s prone to returning. Success requires a careful, long-term, clinician-guided approach.',
    serviceSlugKeywords: ['brightening', 'vitamin-c', 'chemical-peel'],
    productCategorySlugs: ['serums', 'sunscreen', 'moisturisers'],
    treatmentPitch: 'Our practitioners use a combination of pharmaceutical-grade brightening actives and controlled chemical exfoliation — carefully calibrated for melanin-rich skin to avoid rebound pigmentation. Treatment is paired with a strict homecare and sun-protection protocol for lasting results.',
    selfCarePitch: 'Melasma maintenance at home centres on two non-negotiables: a brightening serum with azelaic acid or tranexamic acid, and a broadspectrum SPF 50+ applied every morning (and reapplied midday). Without SPF, no treatment is sustainable.',
    treatmentBullets: [
      'Pharmaceutical-grade azelaic acid & kojic acid',
      'Safe chemical exfoliation for melanin-rich skin',
      'Strict sun-protection protocol included',
      'Long-term treatment planning',
      'Homecare kit recommendations',
    ],
  },
  'oily-skin': {
    label: 'Oily Skin',
    headline: 'Balance. Control. Confidence.',
    tagline: 'Deep pore control that lasts weeks, not hours',
    intro: 'Oily skin is driven by overactive sebaceous glands — no amount of blotting or mattifying products will retrain them. Clinical treatment addresses the source of oil production and keeps pores clear far longer.',
    serviceSlugKeywords: ['deep-cleanse', 'acne'],
    productCategorySlugs: ['cleansers', 'toners-mists', 'masks-treatments'],
    treatmentPitch: 'Our Deep Cleanse Facial uses enzyme exfoliation, BHA extractions, high-frequency current, and a purifying clay mask to thoroughly decongest pores and rebalance oil production. Results typically last 3–6 weeks — far beyond what daily cleansing can achieve.',
    selfCarePitch: 'For oily skin, the biggest mistake is over-cleansing — it triggers more oil. A gentle cleanser morning and night, a BHA toner 2–3 times a week, and a lightweight non-comedogenic moisturiser will keep your results between sessions.',
    treatmentBullets: [
      'Enzyme + BHA dual exfoliation',
      'Medical-grade extraction — all types of congestion',
      'High-frequency current to refine pores',
      'Purifying clay mask to absorb excess oil',
      'Post-treatment oil-control routine advice',
    ],
  },
  'scarring': {
    label: 'Scarring',
    headline: 'Fade Scars, Reclaim Confidence',
    tagline: 'Professional resurfacing for lasting textural improvement',
    intro: 'Post-acne scars, hyperpigmented marks, and textural irregularities respond best to controlled skin resurfacing — which stimulates new collagen and accelerates the turnover of damaged cells. Home treatments take months; in-clinic results come in weeks.',
    serviceSlugKeywords: ['chemical-peel', 'superficial', 'medium-depth'],
    productCategorySlugs: ['serums', 'masks-treatments', 'moisturisers'],
    treatmentPitch: 'Our chemical peels are calibrated to your scar type and skin tone. Superficial peels address surface pigmentation and early textural changes; medium-depth peels target deeper, more established scarring. Your practitioner will assess and recommend the right depth for your goals.',
    selfCarePitch: 'Between sessions, a niacinamide or azelaic acid serum will continue to fade pigmented marks. Pair with our Premier Beauty Barrier Repair Cream post-treatment to support healing and maximise your results.',
    treatmentBullets: [
      'Calibrated peel depth for your scar type',
      'Safe for post-acne marks & textural scarring',
      'Stimulates fresh collagen production',
      'Course of treatments for progressive results',
      'Post-peel homecare kit included',
    ],
  },
  'dullness': {
    label: 'Dullness',
    headline: 'Rediscover Your Glow',
    tagline: 'One session — visibly brighter skin',
    intro: 'Dull skin is almost always a combination of dehydration, dead-cell buildup, and sluggish circulation. No serum alone will fix all three simultaneously — but a targeted facial will.',
    serviceSlugKeywords: ['classic', 'hydrating', 'glow'],
    productCategorySlugs: ['serums', 'masks-treatments', 'moisturisers'],
    treatmentPitch: 'Our Classic and Hydrating Glow Facials address every driver of dullness in a single session: exfoliation clears the dead-cell layer, circulation massage restores vascular glow, and hyaluronic infusion plumps from within. You will walk out visibly brighter — every time.',
    selfCarePitch: 'A vitamin C serum every morning and a glycolic or lactic acid exfoliant 2–3 times a week will keep cell turnover high between sessions. Layer under a good moisturiser and SPF for maximum brightness.',
    treatmentBullets: [
      'Multi-step exfoliation & brightening protocol',
      'Circulation-stimulating massage technique',
      'Hyaluronic acid plumping infusion',
      'Instant glow — visible same day',
      'Homecare routine to maintain results',
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const FADE_UP = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
} as const;

function ServiceCard({ service, formatPrice }: { service: Service; formatPrice: (n: number) => string }) {
  const deposit = service.deposit_percentage > 0
    ? Math.round(service.base_price * service.deposit_percentage / 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <Link to={`/services/${service.slug ?? service.id}`} className="aspect-[4/3] overflow-hidden bg-[#F2F1F8] block">
        {service.images.length > 0 ? (
          <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkle className="w-8 h-8 text-[#6D4C91]/30" />
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-1">{service.category}</p>
        <Link to={`/services/${service.slug}`}>
          <h3 className="text-base font-bold text-gray-900 mb-1 hover:text-[#6D4C91] transition-colors">{service.name}</h3>
        </Link>
        {service.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-2">{service.description}</p>
        )}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-base font-bold text-gray-900">{formatPrice(service.base_price)}</p>
              {deposit > 0 && (
                <p className="text-xs text-gray-400">{formatPrice(deposit)} deposit to book</p>
              )}
            </div>
            <Link
              to={`/services/${service.slug}`}
              className="text-xs font-semibold text-[#6D4C91] hover:underline flex items-center gap-1"
            >
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <Link
            to={`/book?service=${service.id}`}
            className="block w-full text-center bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#6D4C91] transition-colors"
          >
            Book This Treatment
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, formatPrice, onAddToCart }: {
  product: ApiProduct;
  formatPrice: (n: number) => string;
  onAddToCart: (p: ApiProduct) => void;
}) {
  const img = product.images?.[0];
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-shadow">
      <Link to={`/shop/${product.id}`} className="aspect-square overflow-hidden bg-[#F2F1F8] block">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        {product.brand && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{product.brand}</p>}
        <Link to={`/shop/${product.id}`} className="text-sm font-bold text-gray-900 leading-snug mb-2 hover:text-[#6D4C91] transition-colors line-clamp-2">
          {product.name}
          {product.size && <span className="text-gray-400 font-medium"> · {product.size}</span>}
        </Link>
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-sm font-bold text-gray-900">{formatPrice(Number(product.price))}</p>
          <button
            onClick={() => onAddToCart(product)}
            className="text-xs font-bold text-[#6D4C91] border border-[#6D4C91] px-3 py-1.5 rounded-xl hover:bg-[#6D4C91] hover:text-white transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="pt-[100px] md:pt-[140px] pb-24 bg-[#F2F1F8] min-h-screen animate-pulse">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="h-4 bg-gray-200 rounded-full w-40 mb-10" />
        <div className="h-10 bg-gray-200 rounded-xl w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded-full w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded-full w-5/6 mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SkinConcernPage() {
  const { slug }    = useParams<{ slug: string }>();
  const navigate    = useNavigate();
  const { addToCart, formatPrice } = useStore();

  const concern = CONCERN_MAP[slug ?? ''];

  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!concern) { navigate('/'); return; }

    Promise.all([
      apiFetch('/services').catch(() => []),
      apiFetch('/products').catch(() => []),
    ]).then(([allServices, allProducts]: [Service[], ApiProduct[]]) => {
      // Filter services: slug must include one of the concern's keywords
      const matchedServices = (allServices || []).filter(s =>
        concern.serviceSlugKeywords.some(kw => s.slug?.includes(kw))
      ).slice(0, 3);

      // Filter products: category slug in concern's list OR skin_concerns overlaps
      const matchedProducts = (allProducts || []).filter(p => {
        const catMatch = concern.productCategorySlugs.includes(p.categories?.slug ?? '');
        const concernMatch = (p.skin_concerns ?? []).some(sc =>
          concern.label.toLowerCase().split(' ').some(word => sc.toLowerCase().includes(word))
        );
        return catMatch || concernMatch;
      }).slice(0, 8);

      setServices(matchedServices);
      setProducts(matchedProducts);
    }).finally(() => setLoading(false));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = (p: ApiProduct) => {
    addToCart({
      id: String(p.id),
      name: p.name,
      size: p.size,
      price: Number(p.price),
      image: p.images?.[0] ?? '',
      category: p.categories?.name ?? '',
      description: p.description ?? '',
    });
    toast.success(`${p.name} added to cart!`);
  };

  if (loading) return <Skeleton />;
  if (!concern) return null;

  return (
    <div className="pt-[100px] md:pt-[140px] pb-24 bg-[#F2F1F8] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-[#6D4C91] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">{concern.label}</span>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <motion.div {...FADE_UP} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-3">Skin Concern</p>
          <h1 className="text-4xl md:text-6xl font-serif italic leading-tight mb-4">{concern.headline}</h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mb-6">{concern.tagline}</p>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{concern.intro}</p>
        </motion.div>

        {/* ── IN-CLINIC TREATMENT ──────────────────────────────────────────── */}
        <motion.section {...FADE_UP} className="mb-16">
          <div className="bg-[#1A1A1A] rounded-3xl p-8 md:p-12 mb-8">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  Recommended — Best Results
                </div>
                <h2 className="text-2xl md:text-3xl font-serif italic text-white mb-3">
                  Let us handle it at the clinic
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-xl">
                  {concern.treatmentPitch}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {concern.treatmentBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-200">
                      <CheckCircle className="w-4 h-4 text-[#6D4C91] flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={services.length > 0 ? `/book?service=${services[0].id}` : '/services'}
                  className="inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#F2F1F8] transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Session
                </Link>
              </div>

              {/* Rating strip */}
              <div className="md:w-48 bg-white/5 rounded-2xl p-5 text-center border border-white/10 shrink-0">
                <div className="flex justify-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-white text-2xl font-bold mb-1">4.9</p>
                <p className="text-gray-400 text-xs">Average rating</p>
                <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                  "I saw real improvement after my first session. Nothing I tried at home came close."
                </p>
                <p className="text-[#6D4C91] text-xs font-bold mt-2">— Premier Client</p>
              </div>
            </div>
          </div>

          {/* Treatment cards */}
          {services.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map(s => (
                <ServiceCard key={s.id} service={s} formatPrice={formatPrice} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Our practitioners can create a personalised plan for {concern.label} during a consultation.</p>
              <Link to="/services" className="text-sm font-bold text-[#6D4C91] hover:underline inline-flex items-center gap-1">
                View All Services <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.section>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <motion.div {...FADE_UP} className="flex items-center gap-6 mb-16">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest shrink-0">Or, take the DIY route at home</span>
          <div className="flex-1 h-px bg-gray-200" />
        </motion.div>

        {/* ── AT-HOME PRODUCTS ─────────────────────────────────────────────── */}
        <motion.section {...FADE_UP} className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-2">Shop at Home</p>
              <h2 className="text-2xl md:text-3xl font-serif italic">Products for {concern.label}</h2>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-[#6D4C91] hover:underline shrink-0 flex items-center gap-1">
              Browse all products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3 mb-6">
            <span className="text-amber-500 text-lg shrink-0">💡</span>
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Our honest advice:</strong> {concern.selfCarePitch} These products work best as maintenance between in-clinic sessions — not as a replacement.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} formatPrice={formatPrice} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-sm text-gray-400">No specific products available for this concern yet. Check our full range.</p>
              <Link to="/shop" className="text-sm font-bold text-[#6D4C91] hover:underline mt-2 inline-block">Browse Shop</Link>
            </div>
          )}
        </motion.section>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <motion.section
          {...FADE_UP}
          className="bg-[#6D4C91] rounded-3xl p-10 md:p-14 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Premier Beauty Clinic, Nairobi</p>
          <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-4">
            Ready for real results?
          </h2>
          <p className="text-white/70 text-sm max-w-lg mx-auto mb-8">
            Our certified practitioners have helped hundreds of clients overcome {concern.label.toLowerCase()} with lasting, visible results. Your skin deserves professional-grade care.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={services.length > 0 ? `/book?service=${services[0].id}` : '/services'}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#6D4C91] px-8 py-4 rounded-xl font-bold text-sm hover:bg-[#F2F1F8] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Book a Treatment
            </Link>
            <a
              href="https://wa.me/254768679646"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-sm hover:border-white/60 transition-colors"
            >
              Ask on WhatsApp
            </a>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
