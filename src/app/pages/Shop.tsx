import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Star, ShoppingBag, LayoutGrid, List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Link, useSearchParams } from 'react-router';

const ALL_PRODUCTS = [
  { id: '1', name: 'Glow Boosting Serum', price: 3500, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400', category: 'Serums', skinType: 'All', stock: 12, brand: 'Premier' },
  { id: '2', name: 'Hydrating Milky Cleanser', price: 2800, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400', category: 'Cleansers', skinType: 'Dry', stock: 45, brand: 'CeraVe' },
  { id: '3', name: 'Mineral Sunscreen SPF 50', price: 4200, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400', category: 'Sun Care', skinType: 'All', stock: 3, brand: 'La Roche-Posay' },
  { id: '4', name: 'Overnight Repair Cream', price: 5500, image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=400', category: 'Moisturizers', skinType: 'Sensitive', stock: 22, brand: 'Bioderma' },
  { id: '5', name: 'Salicylic Acid Treatment', price: 3200, image: 'https://images.unsplash.com/photo-1594125355619-df21d33f769b?q=80&w=400', category: 'Treatments', skinType: 'Oily', stock: 8, brand: 'The Ordinary' },
  { id: '6', name: 'Hyaluronic Hydrating Mist', price: 2400, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400', category: 'Mists', skinType: 'All', stock: 15, brand: 'Mario Badescu' },
  { id: '7', name: 'Gentle Exfoliating Toner', price: 2900, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400', category: 'Toners', skinType: 'Combination', stock: 4, brand: 'Paula\'s Choice' },
  { id: '8', name: 'Revitalizing Eye Cream', price: 3800, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400', category: 'Eye Care', skinType: 'Mature', stock: 30, brand: 'Vichy' },
];

const FILTERS = {
  categories: ['Cleansers', 'Serums', 'Moisturizers', 'Sun Care', 'Treatments', 'Toners', 'Eye Care', 'Mists'],
  skinTypes: ['All', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Mature'],
  priceRanges: ['Under KES 2,500', 'KES 2,500 - 5,000', 'Over KES 5,000'],
  brands: ['La Roche-Posay', 'CeraVe', 'Bioderma', 'Vichy', 'The Ordinary', 'Paula\'s Choice', 'Mario Badescu', 'Premier']
};

export function Shop() {
  const { addToCart, formatPrice } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSkinType, setActiveSkinType] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Featured');
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [isSortMobileOpen, setIsSortMobileOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const category = searchParams.get('category');
    const skinType = searchParams.get('skinType');
    const brand = searchParams.get('brand');
    const priceRange = searchParams.get('priceRange');
    const sort = searchParams.get('sort');

    if (category) setActiveCategory(category);
    if (skinType) setActiveSkinType(skinType);
    if (brand) setActiveBrand(brand);
    if (priceRange) setActivePriceRange(priceRange);
    if (sort) setSortBy(sort);
  }, [searchParams]);

  const filteredProducts = ALL_PRODUCTS.filter(p => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeSkinType && p.skinType !== activeSkinType && p.skinType !== 'All') return false;
    if (activeBrand && p.brand !== activeBrand) return false;
    if (activePriceRange) {
      if (activePriceRange === 'Under KES 2,500' && p.price >= 2500) return false;
      if (activePriceRange === 'KES 2,500 - 5,000' && (p.price < 2500 || p.price > 5000)) return false;
      if (activePriceRange === 'Over KES 5,000' && p.price <= 5000) return false;
    }
    return true;
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
              <div className="flex gap-2">
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
                {!activeCategory && !activeSkinType && !activeBrand && !activePriceRange && <span className="text-[14px] text-gray-500 italic">None</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 w-full md:w-auto justify-between">
            <span className="text-[14px] text-gray-400">{filteredProducts.length} Products</span>
            <div className="relative">
              <button 
                onClick={() => setIsSortMobileOpen(!isSortMobileOpen)}
                className="flex items-center space-x-2 text-[14px] font-bold uppercase tracking-widest cursor-pointer active:text-[#6D4C91] transition-colors"
              >
                <span>Sort: {sortBy}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {/* Sort Dropdown */}
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
                        onClick={() => {
                          setSortBy(s);
                          setIsSortMobileOpen(false);
                        }} 
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
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Category</h3>
                <div className="space-y-3">
                  {FILTERS.categories.map(cat => (
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

              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Skin Type</h3>
                <div className="space-y-3">
                  {FILTERS.skinTypes.map(st => (
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

              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Brand</h3>
                <div className="space-y-3">
                  {FILTERS.brands.map(brand => (
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

              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#6D4C91]">Price Range</h3>
                <div className="space-y-3">
                  {FILTERS.priceRanges.map(pr => (
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={product.id}
                  className="flex flex-col group"
                >
                  <Link to={`/shop/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-6 rounded-2xl">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...product, description: '' });
                      }}
                      className="absolute bottom-6 left-6 right-6 bg-white py-4 rounded-full text-[12px] font-bold uppercase tracking-widest transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl active:scale-95"
                    >
                      Quick Add
                    </button>
                    {product.skinType !== 'All' && (
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Best for {product.skinType}
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-col">
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">{product.category}</p>
                    <h3 className="text-[16px] font-medium mb-1 hover:text-[#6D4C91] transition-colors">{product.name}</h3>
                    <div className="mb-2">
                      {product.stock <= 5 ? (
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Low Stock</span>
                      ) : (
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">In Stock</span>
                      )}
                    </div>
                    <p className="text-[15px] font-bold">{formatPrice(product.price)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
              <div className="space-y-10 pb-12">
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Category</h3>
                  <div className="flex flex-wrap gap-3">
                    {FILTERS.categories.map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`px-4 py-2 rounded-full border text-[14px] transition-colors active:scale-95 ${activeCategory === cat ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Skin Type</h3>
                  <div className="flex flex-wrap gap-3">
                    {FILTERS.skinTypes.map(st => (
                      <button key={st} onClick={() => setActiveSkinType(activeSkinType === st ? null : st)} className={`px-4 py-2 rounded-full border text-[14px] transition-colors active:scale-95 ${activeSkinType === st ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200'}`}>{st}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Brand</h3>
                  <div className="flex flex-wrap gap-3">
                    {FILTERS.brands.map(brand => (
                      <button key={brand} onClick={() => setActiveBrand(activeBrand === brand ? null : brand)} className={`px-4 py-2 rounded-full border text-[14px] transition-colors active:scale-95 ${activeBrand === brand ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'border-gray-200'}`}>{brand}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6 text-[#6D4C91]">Price Range</h3>
                  <div className="flex flex-wrap gap-3">
                    {FILTERS.priceRanges.map(pr => (
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

                <button onClick={() => setIsFilterMobileOpen(false)} className="w-full bg-[#1A1A1A] text-white py-5 rounded-full text-[14px] font-bold uppercase tracking-widest active:scale-[0.98] transition-transform">Show {filteredProducts.length} Results</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}