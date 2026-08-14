import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Phone, Globe, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { CURRENCIES } from '../../context/StoreContext';
import logo from '../../../assets/logo.png';
import { apiFetch } from '../../lib/api';

interface SearchProduct {
  id: number;
  name: string;
  price: string;
  images: string[] | null;
  brand: string | null;
  size: string | null;
  description: string | null;
  categories: { name: string; slug: string } | null;
}

const CATEGORIES = [
  {
    name: 'Shop by Skin Type',
    items: ['Normal Skin', 'Oily Skin', 'Dry Skin', 'Combination', 'Sensitive', 'Acne-Prone', 'Mature Skin']
  },
  {
    name: 'Shop by Brand',
    items: [
      'La Roche-Posay', 'CeraVe', 'The Ordinary', 'Bioderma', 'Neutrogena',
      'Cetaphil', 'Avène', 'Eucerin', 'SkinCeuticals', 'Obagi', 'Murad',
      "Paula's Choice", 'Aveeno', 'Garnier', 'Some By Mi', 'Innisfree',
      'Olay', 'Thayers', 'Dr. Jart+', "Kiehl's", 'Embryolisse',
      'Glamglow', 'SheaMoisture', 'Bio-Oil', 'Premier Beauty'
    ]
  },
  {
    name: 'Shop by Product',
    items: ['Cleansers', 'Moisturisers', 'Serums', 'Sunscreen', 'Toners & Mists', 'Eye Care', 'Masks & Treatments', 'Body Care', 'Hair Care', 'Wellness', 'Fragrances']
  },
  {
    name: 'Shop by Collection',
    items: ['Korean Products', 'Bestsellers', 'Starter Kits', 'Skincare Kits', 'Professional Grade', 'Eco-Friendly']
  },
  {
    name: 'Clinic Services',
    items: ['Imaging & Consultation', 'Facial Treatments', 'Chemical Peel Treatments', 'Regenerative Therapy', 'Skin Treatments', 'Acne Program', 'Hyperpigmentation Program', 'Melasma']
  }
];

// Secondary link bar (desktop) — the site's two journeys (shop + book) plus its real
// category/collection filters. Uses `group=` (Shop.tsx's broad top-tab filter, matched
// against CATEGORY_GROUPS) rather than `category=`, which expects an exact fine-grained
// category name — "Skincare" isn't one, so `category=Skincare` would silently return zero results.
const SECONDARY_LINKS = [
  { label: 'All Skincare',   to: '/shop?group=Skincare' },
  { label: 'Body Care',      to: '/shop?group=Body%20Care' },
  { label: 'Fragrances',     to: '/shop?group=Fragrances' },
  { label: 'Wellness',       to: '/shop?group=Wellness' },
  { label: 'Korean Products', to: '/shop?collection=Korean%20Products' },
  { label: 'Bestsellers',    to: '/shop?collection=Bestsellers' },
  { label: 'Starter Kits',   to: '/shop?collection=Starter%20Kits' },
  { label: 'Services & Treatments', to: '/services' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const { cart, user, isSearchOpen, setIsSearchOpen, selectedCurrency, setSelectedCurrency } = useStore();
  const navigate = useNavigate();

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Hide the menu while the user is actively scrolling, bring it back once
    // they stop. This keys off raw wheel/touch input rather than the native
    // 'scroll' event — Lenis eases each input over ~1s, so 'scroll' keeps
    // firing well after the user's actual gesture ends, which would make the
    // reappear-timer track Lenis's animation tail instead of real input.
    const handleUserScrollInput = () => {
      setIsHidden(window.scrollY > 100);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setIsHidden(false), 200);
    };
    window.addEventListener('wheel', handleUserScrollInput, { passive: true });
    window.addEventListener('touchmove', handleUserScrollInput, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleUserScrollInput);
      window.removeEventListener('touchmove', handleUserScrollInput);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Fetch all products once when search overlay first opens; clear query on close
  useEffect(() => {
    if (isSearchOpen && allProducts.length === 0) {
      setSearchLoading(true);
      apiFetch('/products')
        .then((data: SearchProduct[]) => setAllProducts(data))
        .catch(() => {})
        .finally(() => setSearchLoading(false));
    }
    if (!isSearchOpen) setSearchQuery('');
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.categories?.name && p.categories.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [searchQuery, allProducts]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCategoryClick = (categoryName: string, item: string) => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    
    // Navigate to shop with filter parameters
    const params = new URLSearchParams();
    
    if (categoryName === 'Clinic Services') {
      navigate(`/services?category=${encodeURIComponent(item)}`);
      return;
    } else if (categoryName === 'Shop by Skin Type') {
      params.set('skinType', item);
    } else if (categoryName === 'Shop by Brand') {
      params.set('brand', item);
    } else if (categoryName === 'Shop by Product') {
      params.set('category', item);
    } else if (categoryName === 'Shop by Collection') {
      params.set('collection', item);
    }

    navigate(`/shop?${params.toString()}`);
  };

  const isMenuOrOverlayOpen = isMobileMenuOpen || isSearchOpen || !!activeMegaMenu || isCurrencyDropdownOpen;
  const isNavHidden = isHidden && !isMenuOrOverlayOpen;

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${isNavHidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      {/* Main Navbar */}
      <nav className={`transition-all duration-300 ${isScrolled ? 'bg-[#1A1A1A]/95 backdrop-blur-md shadow-md py-2' : 'bg-[#1A1A1A] py-3 md:py-4'}`}>
        <div className="max-w-7xl mx-auto px-3 md:px-8 flex items-center justify-between gap-2">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 -ml-2 z-10 text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search — desktop pill, left */}
          <div className="hidden md:flex items-center flex-1 min-w-0 max-w-[190px] lg:max-w-[240px] xl:max-w-xs">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center w-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 rounded-full py-1.5 pl-4 pr-1.5 transition-colors text-left"
            >
              <span className="flex-1 min-w-0 truncate text-[13px] text-white/45 group-hover:text-white/70 transition-colors">
                Search products, treatments…
              </span>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6D4C91] group-hover:bg-[#8B5CF6] transition-colors flex-shrink-0 ml-2">
                <Search className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>

          {/* Search — mobile/tablet icon fallback (pill above takes over at md) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex-shrink-0">
            <img
              src={logo}
              alt="Premier Beauty Clinic"
              className="h-11 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-0.5 lg:gap-1 z-10 flex-shrink-0">
            {/* Account — rich label from lg, icon-only below it */}
            <Link
              to={user ? "/account" : "/login"}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5" />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-[12px] font-semibold whitespace-nowrap">{user ? 'My Account' : 'Sign In'}</span>
                <span className="block text-[9px] text-white/45 whitespace-nowrap">Orders & bookings</span>
              </span>
            </Link>
            <Link to={user ? "/account" : "/login"} className="p-2 text-white/80 hover:text-white transition-colors hidden sm:block lg:hidden">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </Link>

            <Link to="/cart" className="p-2 text-white/80 hover:text-white transition-colors relative">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#6D4C91] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="relative">
              <button
                className="p-2 text-white/80 hover:text-white transition-colors flex items-center space-x-1"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              >
                <Globe className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden md:inline text-[12px] font-bold uppercase">{selectedCurrency.code}</span>
              </button>
              <AnimatePresence>
                {isCurrencyDropdownOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCurrencyDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 bg-[#F2F1F8] border border-gray-200 rounded-2xl shadow-lg z-50 w-64 max-h-80 overflow-y-auto"
                    >
                      <div className="p-3">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-2">Select Currency</p>
                        <ul className="space-y-1">
                          {CURRENCIES.map(currency => (
                            <li
                              key={currency.code}
                              className={`px-3 py-2 rounded-lg hover:bg-[#FDFBF7] cursor-pointer transition-colors ${selectedCurrency.code === currency.code ? 'bg-[#6D4C91] text-white' : ''}`}
                              onClick={() => {
                                setSelectedCurrency(currency);
                                setIsCurrencyDropdownOpen(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium">{currency.code}</span>
                                <span className="text-[12px] opacity-80">{currency.symbol}</span>
                              </div>
                              <div className={`text-[11px] ${selectedCurrency.code === currency.code ? 'text-white/80' : 'text-gray-500'}`}>
                                {currency.name}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/book"
              className="hidden lg:inline-flex items-center gap-1.5 bg-[#6D4C91] text-white text-[12px] font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-[#8B5CF6] transition-colors ml-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book Consultation
            </Link>
          </div>
        </div>

        {/* Secondary link bar — category/collection/service shortcuts, desktop only.
            Mobile keeps the same links inside the hamburger drawer's Quick Links section. */}
        <div className="hidden md:block border-t border-white/10 mt-3 md:mt-2">
          <div className="max-w-7xl mx-auto px-3 md:px-8">
            <div className="flex items-center gap-6 lg:gap-7 h-11 overflow-x-auto scrollbar-hide">
              <div
                className="relative flex items-center h-full shrink-0"
                onMouseEnter={() => setActiveMegaMenu('categories')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button className="flex items-center gap-1 text-[13px] font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wider whitespace-nowrap">
                  <span>Brands</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              {SECONDARY_LINKS.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[13px] font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wider whitespace-nowrap shrink-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mega Menu Overlay (Desktop) */}
        <AnimatePresence>
          {activeMegaMenu === 'categories' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              onMouseEnter={() => setActiveMegaMenu('categories')}
              onMouseLeave={() => setActiveMegaMenu(null)}
              className="hidden md:block absolute top-full left-0 right-0 bg-[#F2F1F8] border-t border-gray-200 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-8 pt-8 pb-6">

                {/* Top row: 4 nav columns + card */}
                <div className="grid grid-cols-5 gap-8 mb-7">
                  {CATEGORIES.filter(c => c.name !== 'Shop by Brand').map((cat) => (
                    <div key={cat.name}>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6D4C91] mb-4 border-b border-[#6D4C91]/20 pb-2">{cat.name}</h3>
                      <ul className="space-y-2.5">
                        {cat.items.map(item => (
                          <li key={item}>
                            <button
                              className="text-[13px] text-gray-600 hover:text-[#6D4C91] transition-colors text-left leading-snug"
                              onClick={() => handleCategoryClick(cat.name, item)}
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Skin type card */}
                  <div className="bg-white rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-sm border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#6D4C91]/10 flex items-center justify-center mb-3">
                      <span className="text-[#6D4C91] text-[16px]">✦</span>
                    </div>
                    <h3 className="text-[14px] font-serif italic mb-1.5 leading-snug">Not sure about your skin type?</h3>
                    <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">Book a free 5-minute skin analysis with our experts.</p>
                    <Link
                      to="/book"
                      onClick={() => setActiveMegaMenu(null)}
                      className="bg-[#6D4C91] text-white px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>

                {/* Bottom row: brand pills */}
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6D4C91] mb-3">Shop by Brand</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.find(c => c.name === 'Shop by Brand')!.items.map(brand => (
                      <button
                        key={brand}
                        onClick={() => handleCategoryClick('Shop by Brand', brand)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[12px] text-gray-600 hover:border-[#6D4C91] hover:text-[#6D4C91] hover:bg-white transition-colors whitespace-nowrap"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>

      {/* Mobile Menu Drawer — rendered outside <header> deliberately: header has a
          CSS transform (translate-y) for its scroll-hide animation, and any transform
          on an ancestor makes fixed-position descendants size against *that* box
          instead of the viewport. Nested here, the drawer used to collapse to
          header's own ~100px height instead of covering the full screen. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white z-[60] overflow-y-auto"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                  </Link>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <Link to="/" className="block text-[18px] font-bold text-[#1A1A1A] active:text-[#6D4C91]" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  <Link to="/shop" className="block text-[18px] font-bold text-[#1A1A1A] active:text-[#6D4C91]" onClick={() => setIsMobileMenuOpen(false)}>Shop Collection</Link>
                  <Link to="/services" className="block text-[18px] font-bold text-[#1A1A1A] active:text-[#6D4C91]" onClick={() => setIsMobileMenuOpen(false)}>Services & Treatments</Link>
                  <Link to="/book" className="block text-[18px] font-bold text-[#1A1A1A] active:text-[#6D4C91]" onClick={() => setIsMobileMenuOpen(false)}>Book a Treatment</Link>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <p className="text-[12px] text-gray-400 uppercase tracking-widest mb-4 font-bold">Quick Links</p>
                    <div className="grid grid-cols-1 gap-4">
                      {CATEGORIES.filter(c => c.name !== 'Shop by Brand').map(cat => (
                        <div key={cat.name} className="mb-2">
                          <p className="text-[13px] font-bold mb-3 text-[#6D4C91]">{cat.name}</p>
                          <div className="grid grid-cols-1 gap-2.5 pl-2">
                            {cat.items.map(item => (
                              <button
                                key={item}
                                className="text-[13px] text-gray-600 active:text-[#6D4C91] text-left"
                                onClick={() => handleCategoryClick(cat.name, item)}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="mb-2">
                        <p className="text-[13px] font-bold mb-3 text-[#6D4C91]">Shop by Brand</p>
                        <div className="flex flex-wrap gap-1.5 pl-2">
                          {CATEGORIES.find(c => c.name === 'Shop by Brand')!.items.map(brand => (
                            <button
                              key={brand}
                              onClick={() => handleCategoryClick('Shop by Brand', brand)}
                              className="px-2.5 py-1 bg-[#F2F1F8] border border-gray-200 rounded-full text-[11px] text-gray-600 active:text-[#6D4C91] active:border-[#6D4C91]"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expert Advice Section in Mobile Nav */}
                  <div className="pt-6">
                    <div className="bg-[#6D4C91] p-6 rounded-2xl text-white">
                      <h4 className="font-serif italic text-[18px] mb-2">Expert Advice</h4>
                      <p className="text-[12px] text-white/80 mb-4 leading-relaxed">Not sure what's right for your skin? Book a free consultation with our experts.</p>
                      <Link
                        to="/book"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[12px] font-bold underline underline-offset-4 uppercase tracking-widest inline-block active:scale-95 transition-transform"
                      >
                        Free Consultation
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                  <Link to={user ? "/account" : "/login"} className="flex items-center space-x-3 text-gray-600 mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-5 h-5" />
                    <span>{user ? "My Account" : "Sign In / Join"}</span>
                  </Link>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>+254 768 679 646</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] p-4 md:p-20 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto pt-4 md:pt-0">
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <h2 className="text-[20px] md:text-[24px] font-serif">What are you looking for?</h2>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative border-b-2 border-black pb-4 flex items-center mb-8 md:mb-12">
                <Search className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4 text-gray-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                      setIsSearchOpen(false);
                    }
                  }}
                  placeholder="Search products, services..."
                  className="w-full text-[18px] md:text-[24px] outline-none placeholder:text-gray-300 bg-transparent"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Live Results */}
              {searchQuery.trim() ? (
                searchLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                        <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                      {searchResults.map(product => (
                        <Link
                          key={product.id}
                          to={`/shop/${product.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group flex flex-col"
                        >
                          <div className="aspect-square bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden mb-3">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-[12px]">No image</div>
                            )}
                          </div>
                          <p className="font-eczar text-[10px] text-gray-400 uppercase tracking-widest mb-1">{product.categories?.name ?? ''}</p>
                          <p className="font-alice text-[13px] md:text-[14px] group-hover:text-[#6D4C91] transition-colors line-clamp-2">
                            {product.name}
                            {product.size && <span className="text-gray-400"> · {product.size}</span>}
                          </p>
                          <p className="font-serif text-[13px] font-bold mt-1">KES {Number(product.price).toLocaleString()}</p>
                        </Link>
                      ))}
                    </div>
                    <Link
                      to={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="block text-center text-[13px] font-bold uppercase tracking-widest text-[#6D4C91] hover:underline"
                    >
                      View all results for "{searchQuery.trim()}"
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-[15px]">No products found for "{searchQuery}".</p>
                    <Link
                      to="/book"
                      onClick={() => setIsSearchOpen(false)}
                      className="mt-4 inline-block text-[#6D4C91] font-bold text-[13px] hover:underline"
                    >
                      Looking for a service? Book a consultation →
                    </Link>
                  </div>
                )
              ) : (
                /* Default state — popular searches & suggestions */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-12">
                  <div>
                    <h3 className="text-[11px] md:text-[14px] font-bold uppercase tracking-widest text-gray-400 mb-4 md:mb-6">Popular Searches</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {['Vitamin C', 'Niacinamide', 'SPF 50', 'Chemical Peel', 'Acne'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-200 rounded-full text-[12px] md:text-[14px] hover:border-[#6D4C91] hover:text-[#6D4C91] transition-colors active:bg-[#FDFBF7]"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] md:text-[14px] font-bold uppercase tracking-widest text-gray-400 mb-4 md:mb-6">Suggestions</h3>
                    <div className="space-y-3 md:space-y-4">
                      <Link to="/shop" onClick={() => setIsSearchOpen(false)} className="block text-[16px] md:text-[18px] hover:text-[#6D4C91] transition-colors">Our Bestsellers</Link>
                      <Link to="/book" onClick={() => setIsSearchOpen(false)} className="block text-[16px] md:text-[18px] hover:text-[#6D4C91] transition-colors">Skin Analysis Quiz</Link>
                      <Link to="/shop" onClick={() => setIsSearchOpen(false)} className="block text-[16px] md:text-[18px] hover:text-[#6D4C91] transition-colors">New Arrivals</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
