import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Star, ShieldCheck, Truck, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight, Heart, Share2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

// ─── Review types ───────────────────────────────────────────────────────────
interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
}

// ─── Type ───────────────────────────────────────────────────────────────────
// Same shape as what GET /products/:id returns
interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string[] | null;
  skin_concerns: string[] | null;
  price: string;
  images: string[] | null;
  stock: number;
  low_stock_threshold: number;
  brand: string | null;
  usage_instructions: string | null;
  categories: { name: string; slug: string } | null;
  product_avg_ratings: { average_rating: string; rating_count: string } | null;
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 animate-pulse">
      <div className="space-y-4">
        <div className="aspect-[4/5] bg-gray-200 rounded-2xl md:rounded-[32px]" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4 pt-4">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-3/4" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, formatPrice, user, token, sessionId } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Real product data from API
  const [product, setProduct]         = useState<ApiProduct | null>(null);
  const [loading, setLoading]         = useState(true);
  const [related, setRelated]         = useState<ApiProduct[]>([]);

  // Reviews
  const [reviews, setReviews]         = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review form
  const [reviewName, setReviewName]   = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody]   = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  // Pre-fill review form from logged-in user
  useEffect(() => {
    if (user) {
      if (user.name && !reviewName) setReviewName(user.name);
      if ((user as any).email && !reviewEmail) setReviewEmail((user as any).email);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch single product by ID ──
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setRelated([]);
    setReviews([]);
    setSubmitted(false);
    // Fetch approved reviews in parallel
    setReviewsLoading(true);
    apiFetch(`/reviews?product_id=${id}`)
      .then((data: Review[]) => setReviews(data || []))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));

    apiFetch(`/products/${id}`)
      .then((data: ApiProduct) => {
        setProduct(data);
        // Fetch related products — same category or overlapping skin_concerns
        apiFetch('/products')
          .then((all: ApiProduct[]) => {
            const others = (all || []).filter(p => p.id !== data.id);
            const scored = others.map(p => {
              let score = 0;
              if (p.categories?.slug && p.categories.slug === data.categories?.slug) score += 3;
              const thisConcerns = data.skin_concerns ?? [];
              const thatConcerns = p.skin_concerns ?? [];
              score += thisConcerns.filter(c => thatConcerns.includes(c)).length;
              return { p, score };
            });
            const top = scored
              .filter(x => x.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, 4)
              .map(x => x.p);
            // If not enough scored matches, pad with same-category products
            if (top.length < 4) {
              const extras = others
                .filter(p => !top.find(t => t.id === p.id) && p.categories?.slug === data.categories?.slug)
                .slice(0, 4 - top.length);
              setRelated([...top, ...extras]);
            } else {
              setRelated(top);
            }
          })
          .catch(() => {});
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) { toast.error('Please enter your name'); return; }
    if (!reviewTitle.trim()) { toast.error('Please enter a review title'); return; }
    if (!reviewBody.trim()) { toast.error('Please write your review'); return; }
    setSubmitting(true);
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: id,
          reviewer_name: reviewName.trim(),
          reviewer_email: reviewEmail.trim() || undefined,
          rating: reviewRating,
          title: reviewTitle.trim(),
          body: reviewBody.trim(),
        }),
      }, token, sessionId);
      setSubmitted(true);
      setReviewTitle('');
      setReviewBody('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: String(product.id),
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0] ?? '',
        category: product.categories?.name ?? '',
        description: product.description ?? '',
      });
    }
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24 bg-[#F2F1F8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[10px] md:text-[12px] uppercase tracking-widest text-gray-400 mb-6 md:mb-10">
          <Link to="/" className="hover:text-[#6D4C91]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-[#6D4C91]">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-bold truncate">{product?.name ?? '...'}</span>
        </nav>

        {/* Loading state */}
        {loading && <DetailSkeleton />}

        {/* Product content */}
        {!loading && product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-16">
            {/* Product Images */}
            <div className="space-y-3 md:space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/5] bg-gray-100 rounded-2xl md:rounded-[32px] overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {product.images && product.images.length > 0 ? (
                    <motion.img
                      key={selectedImage}
                      src={product.images[selectedImage]}
                      alt={product.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </AnimatePresence>

                {/* Prev / Next arrows — only when multiple images */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((selectedImage - 1 + product.images!.length) % product.images!.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((selectedImage + 1) % product.images!.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Counter */}
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {selectedImage + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Thumbnail strip — only shown when there are multiple images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === i ? 'border-[#6D4C91]' : 'border-transparent hover:border-gray-200'}`}
                    >
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center space-x-2">
                    {product.brand && (
                      <>
                        <p className="text-[#6D4C91] text-[11px] md:text-[14px] font-bold uppercase tracking-widest">{product.brand}</p>
                        <span className="text-gray-300">•</span>
                      </>
                    )}
                    <p className="text-gray-400 text-[11px] md:text-[14px] font-medium uppercase tracking-widest">
                      {product.categories?.name ?? 'Product'}
                    </p>
                  </div>
                  <div className="flex space-x-2 md:space-x-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"><Heart className="w-4 h-4 md:w-5 md:h-5" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"><Share2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                  </div>
                </div>

                <h1 className="text-[28px] md:text-[42px] font-serif leading-tight mb-3 md:mb-4">{product.name}</h1>

                {/* Rating */}
                {product.product_avg_ratings && Number(product.product_avg_ratings.rating_count) > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(Number(product.product_avg_ratings!.average_rating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[13px] text-gray-500">({product.product_avg_ratings.rating_count} reviews)</span>
                  </div>
                )}

                <div className="flex items-center space-x-4 mb-4 md:mb-6">
                  {product.stock <= (product.low_stock_threshold ?? 5) ? (
                    <span className="text-[10px] md:text-[12px] text-red-600 font-bold bg-red-50 px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-tighter flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 animate-pulse" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-[10px] md:text-[12px] text-green-600 font-bold bg-green-50 px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-tighter flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2" />
                      In Stock
                    </span>
                  )}
                </div>

                <p className="text-[24px] md:text-[32px] font-bold">{formatPrice(Number(product.price))}</p>
              </div>

              <div className="mb-6 md:mb-10 p-4 md:p-6 bg-[#FDFBF7] rounded-xl md:rounded-[24px]">
                <p className="text-gray-600 text-[14px] md:text-[16px] leading-relaxed mb-4 md:mb-6">
                  {product.description ?? 'No description available.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center space-x-3 text-[12px] md:text-[13px] font-medium">
                    <Truck className="w-4 h-4 md:w-5 md:h-5 text-[#6D4C91]" />
                    <span>Free Shipping over KES 5k</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[12px] md:text-[13px] font-medium">
                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#6D4C91]" />
                    <span>Dermatologist Tested</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="flex gap-3 md:gap-4">
                  <div className="flex items-center border border-gray-200 rounded-full px-2 py-2">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 md:w-12 text-center font-bold text-[16px] md:text-[18px]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow bg-[#1A1A1A] text-white h-[56px] md:h-[64px] rounded-full text-[12px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all flex items-center justify-center space-x-2 md:space-x-3 active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Add to Cart — {formatPrice(Number(product.price) * quantity)}</span>
                    <span className="sm:hidden">Add — {formatPrice(Number(product.price) * quantity)}</span>
                  </button>
                </div>
                <p className="text-center text-[11px] md:text-[12px] text-gray-400 font-medium">Safe & Secure Checkout via M-Pesa & Card</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Tabs */}
        {!loading && product && (
          <div className="border-t border-gray-100 pt-10 md:pt-16">
            <div className="flex space-x-6 md:space-x-12 border-b border-gray-100 mb-8 md:mb-12 overflow-x-auto whitespace-nowrap">
              {['description', 'ingredients', 'how to use', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 md:pb-6 text-[12px] md:text-[14px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#1A1A1A]' : 'text-gray-400'}`}
                >
                  {tab === 'reviews'
                    ? `Reviews${reviews.length > 0 ? ` (${reviews.length})` : ''}`
                    : tab}
                  {activeTab === tab && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-[#6D4C91]" />}
                </button>
              ))}
            </div>

            <div className="max-w-3xl">
              {activeTab === 'description' && (
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-[20px] md:text-[24px] font-serif">What it is</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px] md:text-[17px]">
                    {product.description ?? 'No description available.'}
                  </p>
                </div>
              )}
              {activeTab === 'ingredients' && (
                <div>
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <p className="text-gray-600 leading-relaxed text-[15px] md:text-[17px]">
                      {product.ingredients.join(', ')}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">Ingredient list not available.</p>
                  )}
                </div>
              )}
              {activeTab === 'how to use' && (
                <div>
                  {product.usage_instructions ? (
                    <p className="text-gray-600 leading-relaxed text-[15px] md:text-[17px]">{product.usage_instructions}</p>
                  ) : (
                    <p className="text-gray-400 italic">Usage instructions not available.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-10">
                  {/* Approved reviews list */}
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                            <div className="flex-grow space-y-2 pt-1">
                              <div className="h-3.5 bg-gray-100 rounded w-1/4" />
                              <div className="h-3 bg-gray-100 rounded w-1/3" />
                              <div className="h-12 bg-gray-100 rounded mt-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                      <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-[14px] font-bold text-gray-400">No reviews yet</p>
                      <p className="text-[12px] text-gray-300 mt-1">Be the first to share your experience</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#6D4C91]/10 flex items-center justify-center text-[#6D4C91] font-bold shrink-0">
                              {r.reviewer_name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <p className="font-bold text-[14px]">{r.reviewer_name}</p>
                                {r.is_verified_purchase && (
                                  <span className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                                    Verified Purchase
                                  </span>
                                )}
                                <span className="text-[11px] text-gray-400 ml-auto">
                                  {new Date(r.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <div className="flex gap-0.5 mb-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                              <p className="font-bold text-[14px] mb-1">{r.title}</p>
                              <p className="text-[14px] text-gray-600 leading-relaxed">{r.body}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Write a review form */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-[#FDFBF7]">
                      <h3 className="text-[16px] font-bold">Write a Review</h3>
                      <p className="text-[12px] text-gray-400 mt-0.5">Share your experience with this product</p>
                    </div>

                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-6 py-12 flex flex-col items-center text-center"
                        >
                          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-7 h-7 text-green-500" />
                          </div>
                          <p className="text-[16px] font-bold mb-1">Thank you for your review!</p>
                          <p className="text-[13px] text-gray-500">It will appear here once our team approves it.</p>
                        </motion.div>
                      ) : (
                        <motion.div key="form" className="p-6 space-y-5">
                          {/* Rating stars */}
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Your Rating</label>
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onMouseEnter={() => setReviewHover(i + 1)}
                                  onMouseLeave={() => setReviewHover(0)}
                                  onClick={() => setReviewRating(i + 1)}
                                  className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                                >
                                  <Star className={`w-7 h-7 transition-colors ${
                                    i < (reviewHover || reviewRating)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-gray-200'
                                  }`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Name + Email */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Name *</label>
                              <input
                                value={reviewName}
                                onChange={e => setReviewName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Email (optional)</label>
                              <input
                                value={reviewEmail}
                                onChange={e => setReviewEmail(e.target.value)}
                                placeholder="your@email.com"
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] transition-all"
                              />
                            </div>
                          </div>

                          {/* Title */}
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Review Title *</label>
                            <input
                              value={reviewTitle}
                              onChange={e => setReviewTitle(e.target.value)}
                              placeholder="Summarise your experience…"
                              maxLength={120}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] transition-all"
                            />
                          </div>

                          {/* Body */}
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Your Review *</label>
                            <textarea
                              value={reviewBody}
                              onChange={e => setReviewBody(e.target.value)}
                              placeholder="Tell us about the results, texture, scent, how your skin felt…"
                              rows={4}
                              maxLength={1000}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] transition-all resize-none"
                            />
                            <p className="text-[11px] text-gray-300 text-right mt-1">{reviewBody.length}/1000</p>
                          </div>

                          <button
                            onClick={handleSubmitReview}
                            disabled={submitting}
                            className="w-full bg-[#1A1A1A] text-white py-4 rounded-full font-bold text-[12px] uppercase tracking-widest hover:bg-[#6D4C91] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                          >
                            {submitting
                              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                              : <><Star className="w-4 h-4" /> Submit Review</>
                            }
                          </button>
                          <p className="text-[11px] text-gray-400 text-center">Reviews are moderated and appear within 24 hours of approval.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Goes well with ──────────────────────────────────────────────── */}
        {!loading && related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-4 mb-16 md:mb-24"
          >
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-1">Complete your routine</p>
                <h2 className="text-2xl md:text-3xl font-serif italic">Goes well with this</h2>
              </div>
              <Link to="/shop" className="text-sm font-semibold text-[#6D4C91] hover:underline flex items-center gap-1">
                Shop all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => {
                const img = p.images?.[0];
                return (
                  <Link
                    key={p.id}
                    to={`/shop/${p.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square overflow-hidden bg-[#F2F1F8]">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-7 h-7 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {p.brand && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{p.brand}</p>}
                      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#6D4C91] transition-colors">
                        {p.name}
                      </p>
                      <p className="text-sm font-bold text-gray-700 mt-2">
                        KES {Number(p.price).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
