import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Tag, ChevronRight, CheckCircle, ArrowLeft, MessageCircle, FileText, Sparkle, Star, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { StarRating } from '../components/ui/StarRating';
import { apiFetch } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { toast } from 'sonner';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface RelatedProduct {
  id: number;
  name: string;
  size: string | null;
  price: string;
  images: string[] | null;
  slug: string;
  categories: { name: string } | null;
}

interface ServiceReview {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
}

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
  category: string | null;
  images: string[];
  form_fields: FormField[];
  benefits: string[];
  results_stat: string | null;
  service_avg_ratings: ServiceAvgRating | null;
  related_products: RelatedProduct[];
  reviews: ServiceReview[];
}

interface ServiceListItem {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  images: string[];
  base_price: number;
  duration_minutes: number;
}

const WHAT_TO_EXPECT = [
  { step: '01', title: 'Book online',        body: 'Select your date and time. A deposit secures your slot — the balance is collected at the clinic.' },
  { step: '02', title: 'Arrive and consult', body: 'Your practitioner reviews your concerns and tailors the treatment to your skin.' },
  { step: '03', title: 'Your treatment',     body: 'Relax in a calm, clinical environment while your certified therapist delivers the service.' },
  { step: '04', title: 'Aftercare plan',     body: 'Leave with specific homecare instructions and product recommendations to maintain your results.' },
];

const FADE_UP = {
  initial:     { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { duration: 0.4 },
} as const;


function ImagePlaceholder({ category }: { category: string | null }) {
  return (
    <div className="w-full h-full bg-[#F2F1F8] flex flex-col items-center justify-center gap-3">
      <div className="w-14 h-14 rounded-full bg-[#6D4C91]/10 flex items-center justify-center">
        <Sparkle className="w-6 h-6 text-[#6D4C91]/50" />
      </div>
      {category && (
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{category}</span>
      )}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="pt-[100px] md:pt-[140px] pb-24 bg-[#F2F1F8] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded-full w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
          <div className="flex flex-col justify-center gap-4">
            <div className="h-3 bg-gray-200 rounded-full w-20" />
            <div className="h-9 bg-gray-200 rounded-xl w-3/4" />
            <div className="h-4 bg-gray-200 rounded-full w-full" />
            <div className="h-4 bg-gray-200 rounded-full w-5/6" />
            <div className="flex gap-3 mt-4">
              <div className="h-10 bg-gray-200 rounded-xl flex-1" />
              <div className="h-10 bg-gray-200 rounded-xl w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Review form ────────────────────────────────────────────────────────────────
function ReviewForm({ serviceId, serviceName, onClose }: { serviceId: number; serviceName: string; onClose: () => void }) {
  const { user } = useStore();
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm]               = useState({ name: '', email: '', title: '', body: '' });
  const [submitting, setSubmitting]   = useState(false);

  // Pre-fill once user is available (may load after mount)
  useEffect(() => {
    if (!user) return;
    setForm(prev => ({
      ...prev,
      name:  prev.name  || user.name  || '',
      email: prev.email || user.email || '',
    }));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0)       { toast.error('Please select a rating'); return; }
    if (!form.name.trim())  { toast.error('Your name is required'); return; }
    if (!form.title.trim()) { toast.error('Review title is required'); return; }
    if (!form.body.trim())  { toast.error('Review text is required'); return; }

    setSubmitting(true);
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ service_id: serviceId, reviewer_name: form.name, reviewer_email: form.email, rating, title: form.title, body: form.body }),
      });
      toast.success('Review submitted! It will appear once approved by our team.');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-lg">Leave a Review</h3>
            <p className="text-sm text-gray-500">{serviceName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="p-0.5"
                >
                  <Star className={`w-8 h-8 transition-colors ${i <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6D4C91]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email (optional)</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6D4C91]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Summarise your experience" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6D4C91]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Review <span className="text-red-500">*</span></label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Tell others about your experience with this service…" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6D4C91] resize-none" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#6D4C91] text-white py-3 rounded-full font-bold hover:bg-[#5c3f80] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main detail page ───────────────────────────────────────────────────────────
export function TreatmentDetail() {
  const { slug }   = useParams<{ slug: string }>();
  const navigate   = useNavigate();
  const { addToCart } = useStore();

  const [service, setService]             = useState<Service | null>(null);
  const [allServices, setAllServices]     = useState<ServiceListItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [notFound, setNotFound]           = useState(false);
  const [imgIndex, setImgIndex]           = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    setService(null);

    apiFetch(`/services/${slug}`)
      .then((detail: Service) => {
        if (controller.signal.aborted) return;
        setService(detail);
        setImgIndex(0);
        apiFetch('/services')
          .then((all: ServiceListItem[]) => { if (!controller.signal.aborted) setAllServices(all || []); })
          .catch(() => {});
      })
      .catch(() => { if (!controller.signal.aborted) setNotFound(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [slug]);

  if (loading) return <SkeletonDetail />;

  if (notFound || !service) {
    return (
      <div className="pt-[140px] pb-24 bg-[#F2F1F8] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-base">This service could not be found.</p>
        <Link to="/services" className="text-sm font-semibold text-[#6D4C91] hover:underline">
          Browse all services
        </Link>
      </div>
    );
  }

  const avgRating     = Number(service.service_avg_ratings?.average_rating || 0);
  const ratingCount   = Number(service.service_avg_ratings?.rating_count || 0);
  const relatedServices = allServices.filter(s => s.category === service.category && s.id !== service.id).slice(0, 3);
  const depositAmount = service.deposit_percentage > 0
    ? Math.round((service.base_price * service.deposit_percentage) / 100)
    : 0;
  const hasForm    = service.form_fields?.length > 0;
  const benefits   = service.benefits?.length > 0
    ? service.benefits
    : ['Professional care', 'Clinically visible results', 'Certified practitioners', 'Tailored to your skin'];

  return (
    <>
      <div className="pt-[100px] md:pt-[140px] pb-24 bg-[#F2F1F8] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 md:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-[#6D4C91] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/services" className="hover:text-[#6D4C91] transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium truncate">{service.name}</span>
          </nav>

          {/* ── Hero ────────────────────────────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">

            {/* Image gallery */}
            <div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F2F1F8] mb-3">
                {service.images.length > 0 ? (
                  <img
                    src={service.images[imgIndex]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlaceholder category={service.category} />
                )}
              </div>
              {service.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {service.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === imgIndex ? 'border-[#6D4C91]' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              {service.category && (
                <span className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-3">
                  {service.category}
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-serif italic leading-tight mb-4">
                {service.name}
              </h1>

              {avgRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={avgRating} size={5} />
                  <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({ratingCount} reviews)</span>
                </div>
              )}

              {service.description && (
                <p className="text-base text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>
              )}

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white px-4 py-2 rounded-full border border-gray-200">
                  <Clock className="w-4 h-4 text-[#6D4C91]" />
                  {service.duration_minutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white px-4 py-2 rounded-full border border-gray-200">
                  <Tag className="w-4 h-4 text-[#6D4C91]" />
                  KES {service.base_price.toLocaleString()}
                </span>
                {depositAmount > 0 && (
                  <span className="inline-flex items-center text-xs font-semibold bg-[#6D4C91]/8 text-[#6D4C91] px-4 py-2 rounded-full">
                    KES {depositAmount.toLocaleString()} deposit to book
                  </span>
                )}
                {hasForm && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#6D4C91]/8 text-[#6D4C91] px-4 py-2 rounded-full">
                    <FileText className="w-3.5 h-3.5" />
                    Health intake included
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/book?service=${service.id}`}
                  className="flex-1 bg-[#1A1A1A] text-white text-center px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#2d2d2d] transition-colors"
                >
                  Book this service
                </Link>
                <a
                  href="https://wa.me/254707259295"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-800 bg-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* ── Benefits ────────────────────────────────────────────────────── */}
          <motion.section {...FADE_UP} className="bg-white rounded-2xl p-8 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-2">Treatment benefits</p>
            <h2 className="text-2xl font-serif italic mb-6">What you'll experience</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#6D4C91] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
            {service.results_stat && (
              <div className="mt-6 bg-[#F2F1F8] rounded-xl p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6D4C91] shrink-0" />
                <p className="text-sm font-semibold text-gray-700">{service.results_stat}</p>
              </div>
            )}
          </motion.section>

          {/* ── Related products (DIY + clinic is better) ───────────────────── */}
          {service.related_products && service.related_products.length > 0 && (
            <motion.section {...FADE_UP} className="bg-white rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#6D4C91]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-5 h-5 text-[#6D4C91]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-1">Take Results Home</p>
                  <h2 className="text-2xl font-serif italic">Products Used in This Treatment</h2>
                </div>
              </div>

              <div className="bg-[#F2F1F8] rounded-xl p-4 mb-6 text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">Want to maintain your results between visits?</span>{' '}
                These are the professional products our practitioners use during this treatment. Incorporating them
                into your home routine helps extend your results — though the real transformation comes from
                in-clinic sessions, where our certified professionals apply precise techniques and medical-grade
                equipment that no at-home routine can fully replicate.
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {service.related_products.map(product => (
                  <div key={product.id} className="border border-gray-100 rounded-2xl p-4 flex gap-3 hover:border-[#6D4C91]/30 transition-colors">
                    <Link to={`/shop/${product.id}`} className="shrink-0">
                      <img
                        src={product.images?.[0] || ''}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/shop/${product.id}`}>
                        <p className="text-xs font-bold leading-tight line-clamp-2 hover:text-[#6D4C91] transition-colors">
                          {product.name}
                          {product.size && <span className="text-gray-400 font-medium"> · {product.size}</span>}
                        </p>
                      </Link>
                      {product.categories?.name && (
                        <p className="text-xs text-gray-400 mt-0.5">{product.categories.name}</p>
                      )}
                      <p className="text-xs font-bold text-[#6D4C91] mt-1">KES {Number(product.price).toLocaleString()}</p>
                      <button
                        onClick={() => {
                          addToCart({ id: String(product.id), name: product.name, size: product.size, price: Number(product.price), image: product.images?.[0] || '', category: product.categories?.name || '', description: '' });
                          toast.success(`${product.name} added to cart`);
                        }}
                        className="mt-2 text-xs bg-black text-white px-3 py-1 rounded-full hover:bg-[#6D4C91] transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center p-5 border-2 border-dashed border-[#6D4C91]/25 rounded-2xl">
                <p className="text-sm text-gray-600 mb-3">
                  For the best results, combine your home care with a professional in-clinic treatment.
                  Our practitioners deliver results that products alone cannot achieve.
                </p>
                <Link
                  to={`/book?service=${service.id}`}
                  className="inline-flex items-center bg-[#6D4C91] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#5c3f80] transition-colors"
                >
                  Book In-Clinic Treatment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.section>
          )}

          {/* ── How it works ────────────────────────────────────────────────── */}
          <motion.section {...FADE_UP} className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-2">The process</p>
            <h2 className="text-2xl font-serif italic mb-6">How it works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WHAT_TO_EXPECT.map(step => (
                <div key={step.step} className="bg-white rounded-2xl p-6">
                  <span className="text-2xl font-serif italic text-[#6D4C91]/25 block mb-4 leading-none">
                    {step.step}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── Health intake notice ─────────────────────────────────────────── */}
          {hasForm && (
            <motion.section {...FADE_UP} className="bg-white border border-[#6D4C91]/15 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6D4C91]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-[#6D4C91]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">Health intake form</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    This treatment requires a short health intake before booking — it takes under two minutes and
                    allows your practitioner to prepare a safe, personalised session.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.form_fields.map((f, i) => (
                      <span key={i} className="text-xs font-medium bg-[#F2F1F8] text-gray-700 px-3 py-1.5 rounded-full">
                        {f.label}{f.required && <span className="ml-1 text-[#6D4C91]">*</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── Client Reviews ───────────────────────────────────────────────── */}
          <motion.section {...FADE_UP} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-2">Client Reviews</p>
                <h2 className="text-2xl font-serif italic">What our clients say</h2>
              </div>
              {avgRating > 0 && (
                <div className="text-right hidden sm:block">
                  <StarRating rating={avgRating} size={5} />
                  <p className="text-3xl font-bold mt-1">{avgRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">{ratingCount} reviews</p>
                </div>
              )}
            </div>

            {service.reviews && service.reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {service.reviews.slice(0, 6).map(review => (
                  <div key={review.id} className="bg-white rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold">{review.reviewer_name}</p>
                        {review.is_verified_purchase && (
                          <span className="text-xs text-green-600 font-semibold">Verified Client</span>
                        )}
                      </div>
                      <StarRating rating={review.rating} size={4} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{review.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center mb-6">
                <p className="text-gray-400 text-sm">No reviews yet — be the first to share your experience!</p>
              </div>
            )}

            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full border-2 border-[#6D4C91] text-[#6D4C91] py-3 rounded-xl font-bold hover:bg-[#6D4C91] hover:text-white transition-all text-sm"
            >
              Write a Review
            </button>
          </motion.section>

          {/* ── Booking CTA strip ────────────────────────────────────────────── */}
          <motion.section {...FADE_UP} className="bg-[#1A1A1A] rounded-2xl p-8 md:p-12 text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              {service.category ?? 'Premier Beauty Clinic'}
            </p>
            <h2 className="text-3xl font-serif italic text-white mb-3">{service.name}</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
              {depositAmount > 0
                ? `Secure your appointment with a KES ${depositAmount.toLocaleString()} deposit. The remaining balance is paid at the clinic.`
                : 'No deposit required. Pay the full amount at the clinic on the day of your appointment.'}
            </p>
            <Link
              to={`/book?service=${service.id}`}
              className="inline-block bg-white text-[#1A1A1A] px-8 py-4 rounded-xl font-bold text-sm hover:bg-[#F2F1F8] transition-colors"
            >
              Book — KES {service.base_price.toLocaleString()}
            </Link>
          </motion.section>

          {/* ── Related services ─────────────────────────────────────────────── */}
          {relatedServices.length > 0 && (
            <motion.section {...FADE_UP}>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-2">
                {service.category}
              </p>
              <h2 className="text-2xl font-serif italic mb-6">You may also like</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {relatedServices.map(s => (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      {s.images.length > 0 ? (
                        <img
                          src={s.images[0]}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ImagePlaceholder category={s.category} />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm text-gray-900 mb-1">{s.name}</p>
                      <p className="text-xs text-gray-400">
                        KES {s.base_price.toLocaleString()} &nbsp;·&nbsp; {s.duration_minutes} min
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

        </div>
      </div>

      {/* Review form modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            serviceId={service.id}
            serviceName={service.name}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
