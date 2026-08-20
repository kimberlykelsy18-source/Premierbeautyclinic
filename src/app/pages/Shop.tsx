import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, ShoppingCart, X, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Link, useSearchParams } from 'react-router';
import { useFeedback } from '../components/Feedback';
import { apiFetch } from '../lib/api';
import { Seo } from '../lib/seo';

// ─── Types ──────────────────────────────────────────────────────────────────
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
  size: string | null;
  usage_instructions: string | null;
  categories: { name: string; slug: string } | null;
  product_avg_ratings: { average_rating: string; rating_count: string } | null;
}

const mapForCart = (p: ApiProduct) => ({
  id: String(p.id),
  name: p.name,
  size: p.size,
  price: Number(p.price),
  image: p.images?.[0] ?? '',
  category: p.categories?.name ?? '',
  description: p.description ?? '',
});

const SKIN_TYPES = ['All', 'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Mature', 'Acne-Prone'];
const CONCERNS = [
  { label: 'All',         value: null          },
  { label: 'Acne',        value: 'Acne'        },
  { label: 'Brightening', value: 'Brightening' },
  { label: 'Anti-Aging',  value: 'Anti-Aging'  },
  { label: 'Hydration',   value: 'Hydration'   },
  { label: 'Sensitive',   value: 'Sensitive'   },
  { label: 'Dark Spots',  value: 'Dark Spots'  },
  { label: 'Oily Skin',   value: 'Oily'        },
];
const PRICE_RANGES = ['Under KES 2,500', 'KES 2,500 – 5,000', 'Over KES 5,000'];
const SORT_OPTIONS = ['Featured', 'Newest', 'Price: Low to High', 'Price: High to Low'];

// Matched against category name/slug via substring — a Jul 2026 bulk import created
// categories like "Cleanser / Face Wash" and "cleanser-face-wash-<id>" that never matched
// the old exact-slug list ('cleansers'), silently hiding ~75% of the catalog from every
// group tab except "All". Keywords are resilient to that naming drift.
const CATEGORY_GROUPS = [
  { label: 'All',        keywords: null },
  { label: 'Skincare',   keywords: ['cleanser', 'face wash', 'moistur', 'serum', 'toner', 'essence', 'sunscreen', 'sun protection', 'eye care', 'mask', 'skincare', 'lip care', 'scrub', 'exfoliat'] },
  { label: 'Fragrances', keywords: ['fragrance', 'perfume', 'cologne'] },
  { label: 'Body Care',  keywords: ['body', 'bath', 'shower', 'deodorant', 'antiperspirant', 'shaving', 'grooming', 'hair', 'nail', 'oil'] },
  { label: 'Wellness',   keywords: ['wellness', 'supplement', 'vitamin', 'mineral', 'baby'] },
] as const;

// Navbar mega-menu "Shop by Product" labels vs. real category names — same naming-drift problem
// as CATEGORY_GROUPS above (a bulk import renamed/duplicated categories, e.g. "Moisturisers" vs
// "Moisturizer / Cream / Lotion"). Exact match is tried first; this is the keyword fallback.
const PRODUCT_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Cleansers':           ['cleanser', 'face wash'],
  'Moisturisers':        ['moistur'],
  'Serums':              ['serum'],
  'Sunscreen':           ['sunscreen', 'sun protection'],
  'Toners & Mists':      ['toner', 'essence', 'mist'],
  'Eye Care':            ['eye care'],
  'Masks & Treatments':  ['mask'],
  'Body Care':           ['body care'],
  'Hair Care':           ['hair care'],
  'Wellness':            ['wellness', 'supplement'],
  'Fragrances':          ['fragrance', 'perfume', 'cologne'],
};

// Navbar mega-menu "Shop by Collection" labels. Only collections with a real backing signal in
// the product data are filterable — "Professional Grade" and "Eco-Friendly" have no such field yet.
const COLLECTION_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Starter Kits':   ['kit'],
  'Skincare Kits':  ['kit'],
};

// 'Korean Products' filters by brand rather than category — Medicube and Anua are the
// only K-beauty brands currently stocked.
const COLLECTION_BRANDS: Record<string, string[]> = {
  'Korean Products': ['Medicube', 'Anua'],
};

type DropdownId = 'category' | 'skinType' | 'brand' | 'price' | 'sort' | null;

// ─── Motion variants ─────────────────────────────────────────────────────────
const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};
const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.1 } },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-square bg-white/70 rounded-xl mb-3" />
      <div className="h-2 bg-white/70 rounded w-1/3 mb-2" />
      <div className="h-3 bg-white/70 rounded w-3/4 mb-1.5" />
      <div className="h-3 bg-white/70 rounded w-1/2" />
    </div>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────
function FilterPill({
  label,
  isOpen,
  isActive,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[11px] font-semibold uppercase tracking-[0.14em] transition-all whitespace-nowrap ${
          isOpen
            ? 'bg-black text-white border-black'
            : isActive
            ? 'bg-[#6D4C91]/10 text-[#6D4C91] border-[#6D4C91]'
            : 'bg-white text-gray-700 border-black/[0.1] hover:border-black/30'
        }`}
      >
        {isActive && !isOpen && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#6D4C91] flex-shrink-0" />
        )}
        {label}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/[0.07] z-50 min-w-[180px] overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  addToCart,
  formatPrice,
}: {
  product: ApiProduct;
  addToCart: (p: ReturnType<typeof mapForCart>) => void;
  formatPrice: (n: number) => string;
}) {
  const isLowStock = product.stock <= (product.low_stock_threshold ?? 5);

  return (
    <motion.div variants={cardVariants} className="group flex flex-col">
      <Link
        to={`/shop/${product.id}`}
        className="relative aspect-square overflow-hidden bg-white rounded-xl mb-3 block"
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-gray-300 tracking-[0.2em] uppercase">No image</span>
          </div>
        )}

        {product.skin_concerns?.[0] && (
          <span className="absolute top-2.5 left-2.5 bg-black/75 text-white px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.15em]">
            {product.skin_concerns[0]}
          </span>
        )}

        {/* Quick Add — desktop hover bar */}
        <button
          onClick={(e) => { e.preventDefault(); addToCart(mapForCart(product)); }}
          className="hidden md:flex absolute inset-x-0 bottom-0 items-center justify-between bg-black text-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
        >
          <span>Add to Cart</span>
          <ShoppingCart className="w-3.5 h-3.5" />
        </button>

        {/* Quick Add — mobile icon */}
        <button
          onClick={(e) => { e.preventDefault(); addToCart(mapForCart(product)); }}
          aria-label={`Add ${product.name} to cart`}
          className="md:hidden absolute bottom-2.5 right-2.5 w-8 h-8 bg-black rounded-full flex items-center justify-center active:scale-90 transition-transform z-10"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </button>
      </Link>

      <div>
        <p className="text-[11px] text-[#6D4C91] uppercase tracking-[0.18em] font-semibold mb-1">
          {product.categories?.name ?? 'Product'}
        </p>
        <Link to={`/shop/${product.id}`}>
          <h3 className="font-alice text-[13px] leading-snug mb-1.5 hover:text-[#6D4C91] transition-colors line-clamp-2">
            {product.name}
            {product.size && <span className="text-gray-400"> · {product.size}</span>}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="font-serif text-[14px] font-semibold">
            {formatPrice(Number(product.price))}
          </p>
          <span className={`text-[11px] uppercase tracking-[0.1em] font-semibold ${isLowStock ? 'text-rose-500' : 'text-emerald-600'}`}>
            {isLowStock ? 'Low Stock' : 'In Stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Shop() {
  const { addToCart, formatPrice } = useStore();
  const { showFeedback } = useFeedback();
  const [searchParams] = useSearchParams();
  const filterBarRef = useRef<HTMLDivElement>(null);

  const [products, setProducts]                       = useState<ApiProduct[]>([]);
  const [loading, setLoading]                         = useState(true);
  const [activeCategory, setActiveCategory]           = useState<string | null>(null);
  const [activeCategoryGroup, setActiveCategoryGroup] = useState<string>('All');
  const [activeConcern, setActiveConcern]             = useState<string | null>(null);
  const [activeSkinType, setActiveSkinType]           = useState<string | null>(null);
  const [activeBrand, setActiveBrand]                 = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange]       = useState<string | null>(null);
  const [activeCollection, setActiveCollection]       = useState<string | null>(null);
  const [searchQuery, setSearchQuery]                 = useState('');
  const [sortBy, setSortBy]                           = useState('Featured');
  const [openDropdown, setOpenDropdown]               = useState<DropdownId>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen]   = useState(false);

  const toggleDropdown = (id: DropdownId) =>
    setOpenDropdown(prev => (prev === id ? null : id));

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    apiFetch('/products')
      .then((data: ApiProduct[]) => setProducts(data))
      .catch(() => showFeedback('error', 'Failed to load products', 'Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const category   = searchParams.get('category');
    const skinType   = searchParams.get('skinType');
    const brand      = searchParams.get('brand');
    const priceRange = searchParams.get('priceRange');
    const sort       = searchParams.get('sort');
    const q          = searchParams.get('q');
    const group      = searchParams.get('group');
    const collection = searchParams.get('collection');

    if (category)   setActiveCategory(category);
    if (skinType)   setActiveSkinType(skinType);
    if (brand)      setActiveBrand(brand);
    if (priceRange) setActivePriceRange(priceRange);
    if (sort)       setSortBy(sort);
    if (q)          setSearchQuery(q);
    if (collection) setActiveCollection(collection);
    if (group) {
      const matched = CATEGORY_GROUPS.find(g => g.label.toLowerCase() === group.toLowerCase());
      if (matched) setActiveCategoryGroup(matched.label);
    }
  }, [searchParams]);

  const categories = useMemo(
    () => [...new Set(products.map(p => p.categories?.name).filter(Boolean) as string[])].sort(),
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map(p => p.brand).filter(Boolean) as string[])].sort(),
    [products]
  );

  const activeGroupKeywords = CATEGORY_GROUPS.find(g => g.label === activeCategoryGroup)?.keywords ?? null;

  const filteredProducts = products.filter(p => {
    if (activeGroupKeywords) {
      const catName = (p.categories?.name ?? '').toLowerCase();
      const matchesGroup = activeGroupKeywords.some(k => catName.includes(k));
      if (!matchesGroup) return false;
    }
    if (activeCategory && p.categories?.name !== activeCategory) {
      // Fall back to keyword matching — handles curated navbar labels that drifted from the real category name
      const keywords = PRODUCT_CATEGORY_KEYWORDS[activeCategory];
      const catName = (p.categories?.name ?? '').toLowerCase();
      if (!keywords || !keywords.some(k => catName.includes(k))) return false;
    }
    if (activeBrand && p.brand !== activeBrand) return false;
    if (activeConcern) {
      const concerns = p.skin_concerns ?? [];
      if (!concerns.some(c => c.toLowerCase().includes(activeConcern.toLowerCase()))) return false;
    }
    if (activeSkinType && activeSkinType !== 'All') {
      // Navbar sends labels like "Normal Skin"; skin_concerns values are just "Normal" — strip the suffix
      const normalizedSkinType = activeSkinType.toLowerCase().replace(/\s*skin$/, '').trim();
      const concerns = p.skin_concerns ?? [];
      if (!concerns.some(c => c.toLowerCase().includes(normalizedSkinType))) return false;
    }
    if (activeCollection) {
      const keywords = COLLECTION_CATEGORY_KEYWORDS[activeCollection];
      if (keywords) {
        const catName = (p.categories?.name ?? '').toLowerCase();
        if (!keywords.some(k => catName.includes(k))) return false;
      }
      const collectionBrands = COLLECTION_BRANDS[activeCollection];
      if (collectionBrands && !collectionBrands.includes(p.brand ?? '')) return false;
      // 'New Arrivals' and 'Bestsellers' don't filter the set — they re-sort it below.
      // 'Professional Grade' / 'Eco-Friendly' have no backing product field yet, so no filter is applied.
    }
    const price = Number(p.price);
    if (activePriceRange === 'Under KES 2,500' && price >= 2500) return false;
    if (activePriceRange === 'KES 2,500 – 5,000' && (price < 2500 || price > 5000)) return false;
    if (activePriceRange === 'Over KES 5,000' && price <= 5000) return false;
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return Number(a.price) - Number(b.price);
    if (sortBy === 'Price: High to Low') return Number(b.price) - Number(a.price);
    if (sortBy === 'Newest' || activeCollection === 'New Arrivals') return b.id - a.id;
    if (activeCollection === 'Bestsellers') {
      const ratingCountA = Number(a.product_avg_ratings?.rating_count || 0);
      const ratingCountB = Number(b.product_avg_ratings?.rating_count || 0);
      if (ratingCountB !== ratingCountA) return ratingCountB - ratingCountA;
      return Number(b.product_avg_ratings?.average_rating || 0) - Number(a.product_avg_ratings?.average_rating || 0);
    }
    return 0;
  });

  const hasActiveFilters = !!(searchQuery || activeCategory || activeSkinType || activeBrand || activePriceRange || activeConcern || activeCollection);

  const clearAllFilters = () => {
    setActiveCategory(null);
    setActiveSkinType(null);
    setActiveBrand(null);
    setActivePriceRange(null);
    setSearchQuery('');
    setActiveConcern(null);
    setActiveCategoryGroup('All');
    setActiveCollection(null);
    setOpenDropdown(null);
  };

  // Helper: shared dropdown item style
  const optionClass = (active: boolean) =>
    `block w-full text-left px-4 py-2.5 text-[12px] transition-colors ${
      active ? 'bg-[#6D4C91] text-white font-semibold' : 'text-gray-700 hover:bg-[#F2F1F8]'
    }`;

  return (
    <div className="pt-[118px] md:pt-[130px] pb-16 bg-[#F2F1F8] min-h-screen overflow-x-hidden">
      <Seo
        title="Shop Skincare, Fragrances & Wellness Products"
        description="Shop dermatologist-approved skincare, fragrances, body care, and wellness products at Premier Beauty Clinic — Kilimani, Nairobi, Kenya. Fast delivery, WhatsApp ordering."
        path="/shop"
      />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-baseline justify-center md:justify-between gap-4 pt-2.5 md:pt-4 pb-2.5 md:pb-4 border-b border-black/[0.08] mb-0">
          <div className="flex items-baseline gap-4">
            <h1
              className="font-serif italic text-black leading-none text-center md:text-left"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.02em' }}
            >
              {activeCollection || 'Shop Collection'}
            </h1>
            {!loading && (
              <span className="hidden sm:inline text-[11px] text-gray-400 tracking-wide">
                {sortedProducts.length} products
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-black/[0.08] rounded-full text-[12px] focus:outline-none focus:border-[#6D4C91] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category Group Tabs ──────────────────────────────────────── */}
        <div className="flex gap-0 border-b border-black/[0.08] overflow-x-auto scrollbar-hide">
          {CATEGORY_GROUPS.map(g => (
            <button
              key={g.label}
              onClick={() => { setActiveCategoryGroup(g.label); setActiveCategory(null); setOpenDropdown(null); }}
              className={`relative px-4 py-3 text-[12px] font-medium shrink-0 transition-colors ${
                activeCategoryGroup === g.label ? 'text-black' : 'text-gray-400 hover:text-black'
              }`}
            >
              {g.label}
              {activeCategoryGroup === g.label && (
                <motion.div
                  layoutId="catUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                  transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Concern Chips ────────────────────────────────────────────── */}
        <div className="flex gap-1.5 flex-wrap items-center py-3 border-b border-black/[0.06]">
          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.25em] text-gray-400 font-semibold mr-1">
            Concern
          </span>
          {CONCERNS.map(c => (
            <button
              key={c.label}
              onClick={() => setActiveConcern(c.value)}
              className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-all ${
                activeConcern === c.value
                  ? 'bg-[#6D4C91] text-white border-[#6D4C91]'
                  : 'bg-white border-black/[0.1] text-gray-600 hover:border-[#6D4C91] hover:text-[#6D4C91]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Sticky Horizontal Filter Bar ────────────────────────────── */}
        <div
          ref={filterBarRef}
          role="group"
          aria-label="Product filters"
          className="sticky top-[100px] md:top-[130px] z-30 bg-[#F2F1F8] border-b border-black/[0.08] py-2.5 mb-6"
        >
          <div className="flex items-center justify-between gap-2">
            {/* Left: filter pills */}
            <div className="flex items-center gap-2 flex-wrap">

              {/* Mobile: single filter button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex md:hidden items-center gap-1.5 px-3.5 py-2 rounded-full border bg-white border-black/[0.1] text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-700"
              >
                <SlidersHorizontal className="w-3 h-3" />
                Filters
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D4C91]" />
                )}
              </button>

              {/* Desktop: individual dropdowns */}
              {categories.length > 0 && (
                <div className="hidden md:block">
                  <FilterPill
                    label={activeCategory ?? 'Category'}
                    isOpen={openDropdown === 'category'}
                    isActive={!!activeCategory}
                    onToggle={() => toggleDropdown('category')}
                  >
                    <div className="py-1.5">
                      <button
                        onClick={() => { setActiveCategory(null); setOpenDropdown(null); }}
                        className={optionClass(!activeCategory)}
                      >
                        All Categories
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setActiveCategory(cat); setOpenDropdown(null); }}
                          className={optionClass(activeCategory === cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </FilterPill>
                </div>
              )}

              <div className="hidden md:block">
                <FilterPill
                  label={activeSkinType && activeSkinType !== 'All' ? activeSkinType : 'Skin Type'}
                  isOpen={openDropdown === 'skinType'}
                  isActive={!!(activeSkinType && activeSkinType !== 'All')}
                  onToggle={() => toggleDropdown('skinType')}
                >
                  <div className="py-1.5">
                    {SKIN_TYPES.map(st => (
                      <button
                        key={st}
                        onClick={() => { setActiveSkinType(st === 'All' ? null : st); setOpenDropdown(null); }}
                        className={optionClass(
                          st === 'All' ? !activeSkinType || activeSkinType === 'All' : activeSkinType === st
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </FilterPill>
              </div>

              {brands.length > 0 && (
                <div className="hidden md:block">
                  <FilterPill
                    label={activeBrand ?? 'Brand'}
                    isOpen={openDropdown === 'brand'}
                    isActive={!!activeBrand}
                    onToggle={() => toggleDropdown('brand')}
                  >
                    <div className="py-1.5 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { setActiveBrand(null); setOpenDropdown(null); }}
                        className={optionClass(!activeBrand)}
                      >
                        All Brands
                      </button>
                      {brands.map(brand => (
                        <button
                          key={brand}
                          onClick={() => { setActiveBrand(brand); setOpenDropdown(null); }}
                          className={optionClass(activeBrand === brand)}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </FilterPill>
                </div>
              )}

              <div className="hidden md:block">
                <FilterPill
                  label={activePriceRange ?? 'Price'}
                  isOpen={openDropdown === 'price'}
                  isActive={!!activePriceRange}
                  onToggle={() => toggleDropdown('price')}
                >
                  <div className="py-1.5">
                    <button
                      onClick={() => { setActivePriceRange(null); setOpenDropdown(null); }}
                      className={optionClass(!activePriceRange)}
                    >
                      Any Price
                    </button>
                    {PRICE_RANGES.map(pr => (
                      <button
                        key={pr}
                        onClick={() => { setActivePriceRange(pr); setOpenDropdown(null); }}
                        className={optionClass(activePriceRange === pr)}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </FilterPill>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-600 transition-colors ml-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Right: sort + count */}
            <div className="flex items-center gap-4 shrink-0">
              <span className="hidden lg:inline text-[11px] text-gray-400">
                {loading ? '...' : `${sortedProducts.length} results`}
              </span>
              <FilterPill
                label={`Sort: ${sortBy === 'Price: Low to High' ? 'Price ↑' : sortBy === 'Price: High to Low' ? 'Price ↓' : sortBy}`}
                isOpen={openDropdown === 'sort'}
                isActive={sortBy !== 'Featured'}
                onToggle={() => toggleDropdown('sort')}
              >
                <div className="py-1.5 w-52">
                  {SORT_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSortBy(s); setOpenDropdown(null); }}
                      className={optionClass(sortBy === s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FilterPill>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="relative mb-5 md:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-black/[0.08] rounded-full text-[13px] focus:outline-none focus:border-[#6D4C91] transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* ── Product Grid — full width ────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-6 md:gap-y-8"
            >
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </motion.div>
          ) : sortedProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28"
            >
              <p className="font-serif italic text-[2rem] text-black/10 mb-3 leading-tight">
                No products found
              </p>
              <p className="text-[13px] text-gray-400 mb-6">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearAllFilters}
                className="px-7 py-2.5 bg-[#6D4C91] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${activeCategoryGroup}-${activeConcern}-${activeCategory}-${activeBrand}-${activeSkinType}-${activePriceRange}-${searchQuery}-${sortBy}`}
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-6 md:gap-y-8"
            >
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  formatPrice={formatPrice}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[110] rounded-t-3xl max-h-[88vh] overflow-y-auto"
            >
              <div className="flex justify-center pt-4 pb-1">
                <div className="w-10 h-[3px] bg-black/10 rounded-full" />
              </div>
              <div className="px-5 pb-8">
                <div className="flex justify-between items-center mb-5 pt-2">
                  <h2 className="font-serif italic text-[1.5rem]">Filters</h2>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-[#F2F1F8] rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {categories.length > 0 && (
                    <div>
                      <h3 className="text-[9px] font-bold uppercase tracking-[0.28em] mb-3 text-[#6D4C91]">Category</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                            className={`px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${activeCategory === cat ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200 text-gray-600'}`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.28em] mb-3 text-[#6D4C91]">Skin Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {SKIN_TYPES.map(st => (
                        <button key={st} onClick={() => setActiveSkinType(activeSkinType === st ? null : st)}
                          className={`px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${activeSkinType === st ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200 text-gray-600'}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  {brands.length > 0 && (
                    <div>
                      <h3 className="text-[9px] font-bold uppercase tracking-[0.28em] mb-3 text-[#6D4C91]">Brand</h3>
                      <div className="flex flex-wrap gap-2">
                        {brands.map(brand => (
                          <button key={brand} onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                            className={`px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${activeBrand === brand ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200 text-gray-600'}`}>
                            {brand}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.28em] mb-3 text-[#6D4C91]">Price Range</h3>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map(pr => (
                        <button key={pr} onClick={() => setActivePriceRange(activePriceRange === pr ? null : pr)}
                          className={`px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${activePriceRange === pr ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200 text-gray-600'}`}>
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.28em] mb-3 text-[#6D4C91]">Sort By</h3>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map(s => (
                        <button key={s} onClick={() => setSortBy(s)}
                          className={`px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${sortBy === s ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200 text-gray-600'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters}
                      className="flex-1 py-3.5 border border-black/15 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]">
                      Clear
                    </button>
                  )}
                  <button onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 py-3.5 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.18em] active:scale-[0.98] transition-transform">
                    Show {sortedProducts.length} Results
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
