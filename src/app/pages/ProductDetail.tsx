import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Star, ShieldCheck, Truck, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';

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
  const { addToCart, formatPrice } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Real product data from API
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch single product by ID ──
  // We call GET /products/:id — this returns only the one product we need.
  // If it returns 404 (product not found or inactive), we redirect to /shop.
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/products/${id}`)
      .then((data: ApiProduct) => setProduct(data))
      .catch(() => navigate('/shop'))   // product not found → go back to shop
      .finally(() => setLoading(false));
  }, [id]);

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
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-16 md:mb-24">
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
              {['description', 'ingredients', 'how to use'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 md:pb-6 text-[12px] md:text-[14px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#1A1A1A]' : 'text-gray-400'}`}
                >
                  {tab}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
