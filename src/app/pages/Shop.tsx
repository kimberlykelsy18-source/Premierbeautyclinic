import { useState, useEffect, useMemo } from 'react';
import { Filter, ChevronDown, ShoppingCart, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Link, useSearchParams } from 'react-router';
import { useFeedback } from '../components/Feedback';
import { apiFetch } from '../lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────
// This is what the API actually returns for each product.
// Note how it differs from the old hardcoded shape:
//   images[]  (array)     vs  image (string)
//   categories (object)   vs  category (string)
//   skin_concerns[]        vs  skinType (string)
//   price (string)        vs  price (number)
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

// Converts an API product to the shape addToCart() expects.
// addToCart() lives in StoreContext and was built before we had real API data.
// Rather than changing StoreContext, we adapt here at the boundary.
const mapForCart = (p: ApiProduct) => ({
  id: String(p.id),
  name: p.name,
  price: Number(p.price),
  image: p.images?.[0] ?? '',
  category: p.categories?.name ?? '',
  description: p.description ?? '',
});

// Static filter options that are UI decisions, not database decisions.
// Skin types and price ranges don't change based on products in the DB.
const SKIN_TYPES = ['All', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Mature'];
const PRICE_RANGES = ['Under KES 2,500', 'KES 2,500 - 5,000', 'Over KES 5,000'];

// ─── Loading Skeleton ───────────────────────────────────────────────────────
// Shown while products are being fetched from the API.
// 'animate-pulse' is a Tailwind class that makes the gray boxes fade in/out.
function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[3/4] md:aspect-[4/5] bg-gray-200 rounded-xl md:rounded-2xl mb-3 md:mb-6" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────
export function Shop() {
  const { addToCart, formatPrice } = useStore();
  const { showFeedback } = useFeedback();
  const [searchParams] = useSearchParams();

  // Real product data from API
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & sort state
  const [activeCategory, setActiveCategory]     = useState<string | null>(null);
  const [activeSkinType, setActiveSkinType]     = useState<string | null>(null);
  const [activeBrand, setActiveBrand]           = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null);
  const [searchQuery, setSearchQuery]           = useState('');
  const [sortBy, setSortBy]                     = useState('Featured');
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [isSortMobileOpen, setIsSortMobileOpen]     = useState(false);

  // ── Fetch products from API ──
  // useEffect with [] runs once when the component first mounts (page loads).
  // This is the standard pattern for fetching data in React.
  useEffect(() => {
    apiFetch('/products')
      .then((data: ApiProduct[]) => setProducts(data))
      .catch(() => showFeedback('error', 'Failed to load products', 'Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Read URL query params ──
  // Allows linking directly to a filtered view, e.g. /shop?category=Serums
  useEffect(() => {
    const category   = searchParams.get('category');
    const skinType   = searchParams.get('skinType');
    const brand      = searchParams.get('brand');
    const priceRange = searchParams.get('priceRange');
    const sort       = searchParams.get('sort');
    const q          = searchParams.get('q');

    if (category)   setActiveCategory(category);
    if (skinType)   setActiveSkinType(skinType);
    if (brand)      setActiveBrand(brand);
    if (priceRange) setActivePriceRange(priceRange);
    if (sort)       setSortBy(sort);
    if (q)          setSearchQuery(q);
  }, [searchParams]);

  // ── Derive filter options from real data ──
  // useMemo recomputes these only when 'products' changes.
  // This way, categories and brands always reflect what's actually in the database.
  const categories = useMemo(
    () => [...new Set(products.map(p => p.categories?.name).filter(Boolean) as string[])].sort(),
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map(p => p.brand).filter(Boolean) as string[])].sort(),
    [products]
  );

  // ── Filter logic ──
  const filteredProducts = products.filter(p => {
    if (activeCategory && p.categories?.name !== activeCategory) return false;
    if (activeBrand && p.brand !== activeBrand) return false;

    // skin_concerns is an array — check if ANY concern mentions the selected skin type
    if (activeSkinType && activeSkinType !== 'All') {
      const concerns = p.skin_concerns ?? [];
      const matches = concerns.some(c => c.toLowerCase().includes(activeSkinType.toLowerCase()));
      if (!matches) return false;
    }

    const price = Number(p.price);
    if (activePriceRange === 'Under KES 2,500' && price >= 2500) return false;
    if (activePriceRange === 'KES 2,500 - 5,000' && (price < 2500 || price > 5000)) return false;
    if (activePriceRange === 'Over KES 5,000' && price <= 5000) return false;

    // Text search — matches name, brand, category, description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName     = p.name.toLowerCase().includes(q);
      const inBrand    = p.brand?.toLowerCase().includes(q) ?? false;
      const inCategory = p.categories?.name.toLowerCase().includes(q) ?? false;
      const inDesc     = p.description?.toLowerCase().includes(q) ?? false;
      if (!inName && !inBrand && !inCategory && !inDesc) return false;
    }

    return true;
  });

  // ── Sort logic ──
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return Number(a.price) - Number(b.price);
    if (sortBy === 'Price: High to Low') return Number(b.price) - Number(a.price);
    return 0; // Featured / Newest — API already returns newest first
  });

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-[36px] md:text-[52px] font-serif mb-3 md:mb-4 italic">Shop Collection</h1>
          <p className="text-gray-500 text-[14px] md:text-[16px]">Dermatologist-approved products for every skin concern.</p>
        </div>

        {/* Mobile Filter & Sort Buttons */}
        <div className="flex gap-3 mb-6 md:hidden">
          <button
            onClick={() => setIsFilterMobileOpen(true)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-full text-[13px] font-bold uppercase tracking-widest"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button
            onClick={() => setIsSortMobileOpen(!isSortMobileOpen)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-full text-[13px] font-bold uppercase tracking-widest"
          >
            <span>Sort</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products by name, brand, or ingredient..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-full text-[14px] focus:outline-none focus:border-[#6D4C91] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-y border-gray-100 py-6 mb-12 gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <button
              onClick={() => setIsFilterMobileOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-[#FDFBF7] rounded-full text-[14px] font-bold uppercase tracking-widest md:hidden w-full justify-center active:scale-95 transition-transform"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-[14px] text-gray-400 font-medium">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="px-3 py-1 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full text-[12px] flex items-center">
                    "{searchQuery}" <X className="w-3 h-3 ml-2" />
                  </button>
                )}
                {activeCategory && (
                  <button onClick={() => setActiveCategory(null)} className="px-3 py-1 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full text-[12px] flex items-center">
                    {activeCategory} <X className="w-3 h-3 ml-2" />
                  </button>
                )}
                {activeSkinType && (
                  <button onClick={() => setActiveSkinType(null)} className="px-3 py-1 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full text-[12px] flex items-center">
                    {activeSkinType} <X className="w-3 h-3 ml-2" />
                  </button>
                )}
                {activeBrand && (
                  <button onClick={() => setActiveBrand(null)} className="px-3 py-1 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full text-[12px] flex items-center">
                    {activeBrand} <X className="w-3 h-3 ml-2" />
                  </button>
                )}
                {activePriceRange && (
                  <button onClick={() => setActivePriceRange(null)} className="px-3 py-1 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full text-[12px] flex items-center">
                    {activePriceRange} <X className="w-3 h-3 ml-2" />
                  </button>
                )}
                {!searchQuery && !activeCategory && !activeSkinType && !activeBrand && !activePriceRange && (
                  <span className="text-[14px] text-gray-500 italic">None</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 w-full md:w-auto justify-between">
            <span className="text-[14px] text-gray-400">
              {loading ? '...' : `${sortedProducts.length} Products`}
            </span>
            <div className="relative">
              <button
                onClick={() => setIsSortMobileOpen(!isSortMobileOpen)}
                className="flex items-center space-x-2 text-[14px] font-bold uppercase tracking-widest cursor-pointer active:text-[#6D4C91] transition-colors"
              >
                <span>Sort: {sortBy}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isSortMobileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded-lg z-20 border border-gray-100 p-2 overflow-hidden"
                  >
                    {['Featured', 'Newest', 'Price: Low to High', 'Price: High to Low'].map(s => (
                      <button
                        key={s}
                        onClick={() => { setSortBy(s); setIsSortMobileOpen(false); }}
                        className="block w-full text-left px-4 py-3 text-[13px] hover:bg-[#FDFBF7] rounded transition-colors active:bg-[#6D4C91] active:text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="space-y-10 sticky top-[160px]">
              {/* Categories — derived from real API data */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Category</h3>
                  <div className="space-y-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`block text-[14px] transition-colors ${activeCategory === cat ? 'text-[#6D4C91] font-bold' : 'text-gray-500 hover:text-[#1A1A1A]'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skin Type — static UI options */}
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Skin Type</h3>
                <div className="space-y-3">
                  {SKIN_TYPES.map(st => (
                    <button
                      key={st}
                      onClick={() => setActiveSkinType(activeSkinType === st ? null : st)}
                      className={`block text-[14px] transition-colors ${activeSkinType === st ? 'text-[#6D4C91] font-bold' : 'text-gray-500 hover:text-[#1A1A1A]'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands — derived from real API data */}
              {brands.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Brand</h3>
                  <div className="space-y-3">
                    {brands.map(brand => (
                      <button
                        key={brand}
                        onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                        className={`block text-[14px] transition-colors ${activeBrand === brand ? 'text-[#6D4C91] font-bold' : 'text-gray-500 hover:text-[#1A1A1A]'}`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range — static UI options */}
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Price Range</h3>
                <div className="space-y-3">
                  {PRICE_RANGES.map(pr => (
                    <button
                      key={pr}
                      onClick={() => setActivePriceRange(activePriceRange === pr ? null : pr)}
                      className={`block text-[14px] transition-colors ${activePriceRange === pr ? 'text-[#6D4C91] font-bold' : 'text-gray-500 hover:text-[#1A1A1A]'}`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <div className="bg-[#6D4C91] p-8 rounded-2xl text-white">
                  <h4 className="font-serif italic text-[18px] mb-2">Expert Advice</h4>
                  <p className="text-[12px] text-white/80 mb-4 leading-relaxed">Not sure what's right for you? Take our quiz.</p>
                  <Link to="/book" className="text-[12px] font-bold underline underline-offset-4 uppercase tracking-widest">Start Quiz</Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-12">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
                : sortedProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={product.id}
                      className="flex flex-col group"
                    >
                      <Link
                        to={`/shop/${product.id}`}
                        className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-gray-100 mb-3 md:mb-6 rounded-xl md:rounded-2xl"
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                            No image
                          </div>
                        )}

                        {/* Quick Add (Mobile) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(mapForCart(product));
                          }}
                          className="md:hidden absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>

                        {/* Quick Add (Desktop hover) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(mapForCart(product));
                          }}
                          className="hidden md:block absolute bottom-4 lg:bottom-6 left-4 lg:left-6 right-4 lg:right-6 bg-white py-3 lg:py-4 rounded-full text-[11px] lg:text-[12px] font-bold uppercase tracking-widest transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl active:scale-95"
                        >
                          Quick Add
                        </button>

                        {/* Skin concern badge */}
                        {product.skin_concerns && product.skin_concerns.length > 0 && (
                          <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {product.skin_concerns[0]}
                          </span>
                        )}
                      </Link>

                      <div className="flex flex-col px-1">
                        <p className="text-[9px] md:text-[11px] text-gray-400 uppercase tracking-widest mb-1 md:mb-2">
                          {product.categories?.name ?? 'Product'}
                        </p>
                        <Link to={`/shop/${product.id}`}>
                          <h3 className="text-[13px] md:text-[16px] font-medium mb-1 hover:text-[#6D4C91] transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="mb-1 md:mb-2">
                          {product.stock <= (product.low_stock_threshold ?? 5) ? (
                            <span className="text-[8px] md:text-[10px] text-red-500 font-bold uppercase tracking-tighter">Low Stock</span>
                          ) : (
                            <span className="text-[8px] md:text-[10px] text-green-600 font-bold uppercase tracking-tighter">In Stock</span>
                          )}
                        </div>
                        <p className="text-[14px] md:text-[15px] font-bold">{formatPrice(Number(product.price))}</p>
                      </div>
                    </motion.div>
                  ))
              }
            </div>

            {/* Empty state */}
            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-24">
                <p className="text-gray-400 text-[16px]">No products match your filters.</p>
                <button
                  onClick={() => { setActiveCategory(null); setActiveSkinType(null); setActiveBrand(null); setActivePriceRange(null); setSearchQuery(''); }}
                  className="mt-4 text-[#6D4C91] font-bold text-[14px] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterMobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterMobileOpen(false)} className="fixed inset-0 bg-black/50 z-[100]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 bg-white z-[110] rounded-t-[32px] max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[24px] font-serif">Filters</h2>
                <button onClick={() => setIsFilterMobileOpen(false)} className="p-2 bg-gray-100 rounded-full active:bg-gray-200"><X className="w-6 h-6" /></button>
              </div>

              {/* Search inside mobile drawer */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-11 pr-10 py-3 bg-[#FDFBF7] border border-gray-200 rounded-full text-[14px] focus:outline-none focus:border-[#6D4C91] transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="space-y-10 pb-12">
                {categories.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Category</h3>
                    <div className="flex flex-wrap gap-3">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`px-4 py-2 rounded-full border text-[14px] transition-colors active:scale-95 ${activeCategory === cat ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Skin Type</h3>
                  <div className="flex flex-wrap gap-3">
                    {SKIN_TYPES.map(st => (
                      <button key={st} onClick={() => setActiveSkinType(activeSkinType === st ? null : st)} className={`px-4 py-2 rounded-full border text-[14px] transition-colors active:scale-95 ${activeSkinType === st ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200'}`}>{st}</button>
                    ))}
                  </div>
                </div>
                {brands.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Brand</h3>
                    <div className="flex flex-wrap gap-3">
                      {brands.map(brand => (
                        <button key={brand} onClick={() => setActiveBrand(activeBrand === brand ? null : brand)} className={`px-4 py-2 rounded-full border text-[14px] transition-colors active:scale-95 ${activeBrand === brand ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200'}`}>{brand}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Price Range</h3>
                  <div className="flex flex-wrap gap-3">
                    {PRICE_RANGES.map(pr => (
                      <button key={pr} onClick={() => setActivePriceRange(activePriceRange === pr ? null : pr)} className={`px-4 py-2 rounded-full border text-[14px] transition-colors active:scale-95 ${activePriceRange === pr ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200'}`}>{pr}</button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <div className="bg-[#FDFBF7] p-8 rounded-2xl border border-[#6D4C91]/20">
                    <h4 className="font-serif italic text-[18px] mb-2">Expert Advice</h4>
                    <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">Not sure what's right for you? Take our quick quiz for personalized recommendations.</p>
                    <Link to="/book" onClick={() => setIsFilterMobileOpen(false)} className="bg-[#6D4C91] text-white px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest inline-block active:scale-95 transition-transform">Start Quiz</Link>
                  </div>
                </div>

                <button onClick={() => setIsFilterMobileOpen(false)} className="w-full bg-[#1A1A1A] text-white py-5 rounded-full text-[14px] font-bold uppercase tracking-widest active:scale-[0.98] transition-transform">
                  Show {sortedProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
