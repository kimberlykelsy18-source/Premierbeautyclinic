import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Heart, Phone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { CURRENCIES } from '../../context/StoreContext';
import logo from 'figma:asset/9f791e938296bf5db89926ddac1d6fc1b167f150.png';

const CATEGORIES = [
  {
    name: 'Shop by Skin Type',
    items: ['Oily Skin', 'Dry Skin', 'Combination', 'Sensitive', 'Acne Prone', 'Mature Skin']
  },
  {
    name: 'Shop by Brand',
    items: ['La Roche-Posay', 'CeraVe', 'Bioderma', 'Vichy', 'The Ordinary', 'Paula\'s Choice', 'Mario Badescu', 'Premier']
  },
  {
    name: 'Shop by Product',
    items: ['Cleansers', 'Moisturizers', 'Serums & Oils', 'Sun Protection', 'Masks & Peels', 'Eye Care']
  },
  {
    name: 'Shop by Collection',
    items: ['New Arrivals', 'Bestsellers', 'Skincare Kits', 'Hygiene Essentials', 'Professional Grade', 'Eco-Friendly']
  },
  {
    name: 'Clinic Services',
    items: ['Skin Analysis', 'Consultation', 'Facial Treatment', 'Chemical Peels', 'Microneedling']
  }
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const { cart, user, isSearchOpen, setIsSearchOpen, selectedCurrency, setSelectedCurrency } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCategoryClick = (categoryName: string, item: string) => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    
    // Navigate to shop with filter parameters
    const params = new URLSearchParams();
    
    if (categoryName === 'Shop by Skin Type') {
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Marquee Announcement Bar */}
      <div className="bg-[#6D4C91] text-white py-2 overflow-hidden whitespace-nowrap border-b border-white/10">
        <motion.div 
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="inline-block text-[12px] font-bold uppercase tracking-widest"
        >
          <span className="mx-8">FREE SHIPPING ON ORDERS OVER KES 5,000</span>
          <span className="mx-8">BOOK A VIRTUAL CONSULTATION WITH OUR DERMATOLOGISTS</span>
          <span className="mx-8">NEW ARRIVALS: HYDRATING MILKY CLEANSER NOW IN STOCK</span>
          <span className="mx-8">FREE SHIPPING ON ORDERS OVER KES 5,000</span>
          <span className="mx-8">BOOK A VIRTUAL CONSULTATION WITH OUR DERMATOLOGISTS</span>
          <span className="mx-8">NEW ARRIVALS: HYDRATING MILKY CLEANSER NOW IN STOCK</span>
        </motion.div>
      </div>

      {/* Main Navbar */}
      <nav className={`transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-md py-3 md:py-4'}`}>
        <div className="max-w-7xl mx-auto px-3 md:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 -ml-2 z-10"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Left Navigation (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-[14px] font-medium hover:text-[#6D4C91] transition-colors uppercase tracking-wider">Shop</Link>
            <div 
              className="relative group"
              onMouseEnter={() => setActiveMegaMenu('categories')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button className="text-[14px] font-medium hover:text-[#6D4C91] transition-colors flex items-center space-x-1 uppercase tracking-wider">
                <span>Collections</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <Link to="/book" className="text-[14px] font-medium hover:text-[#6D4C91] transition-colors uppercase tracking-wider">Services</Link>
          </div>

          {/* Logo */}
          <Link to="/" className="md:absolute md:left-1/2 md:-translate-x-1/2 flex-shrink-0">
            <div className="bg-[#1A1A1A] rounded-full p-2 md:p-3 flex items-center justify-center">
              <img 
                src={logo} 
                alt="Premier Beauty Clinic" 
                className="h-7 md:h-10 w-auto object-contain" 
              />
            </div>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center space-x-1 md:space-x-6 z-10">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:text-[#6D4C91] transition-colors"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <Link to={user ? "/account" : "/login"} className="p-2 hover:text-[#6D4C91] transition-colors hidden sm:block">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link to="/cart" className="p-2 hover:text-[#6D4C91] transition-colors relative">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#6D4C91] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="relative">
              <button 
                className="p-2 hover:text-[#6D4C91] transition-colors flex items-center space-x-1"
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
                      className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 w-64 max-h-80 overflow-y-auto"
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
          </div>
        </div>

        {/* Mega Menu Overlay (Desktop) */}
        <AnimatePresence>
          {activeMegaMenu === 'categories' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onMouseEnter={() => setActiveMegaMenu('categories')}
              onMouseLeave={() => setActiveMegaMenu(null)}
              className="hidden md:block absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl"
            >
              <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-5 gap-8">
                {CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#6D4C91] mb-4">{cat.name}</h3>
                    <ul className="space-y-3">
                      {cat.items.map(item => (
                        <li key={item}>
                          <Link to="/shop" className="text-[14px] text-gray-600 hover:text-[#6D4C91] transition-colors" onClick={() => handleCategoryClick(cat.name, item)}>{item}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="bg-[#FDFBF7] p-6 rounded-lg flex flex-col justify-center items-center text-center">
                  <h3 className="text-[16px] font-serif mb-2 italic">Not sure about your skin type?</h3>
                  <p className="text-[13px] text-gray-500 mb-4">Book a free 5-minute skin analysis with our experts.</p>
                  <Link to="/book" className="bg-[#6D4C91] text-white px-6 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-colors">Book Now</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Drawer */}
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
                    <div className="bg-[#1A1A1A] rounded-full p-2 flex items-center justify-center">
                      <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                    </div>
                  </Link>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <Link to="/" className="block text-[18px] font-bold text-[#1A1A1A] active:text-[#6D4C91]" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  <Link to="/shop" className="block text-[18px] font-bold text-[#1A1A1A] active:text-[#6D4C91]" onClick={() => setIsMobileMenuOpen(false)}>Shop Collection</Link>
                  <Link to="/book" className="block text-[18px] font-bold text-[#1A1A1A] active:text-[#6D4C91]" onClick={() => setIsMobileMenuOpen(false)}>Book Services</Link>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <p className="text-[12px] text-gray-400 uppercase tracking-widest mb-4 font-bold">Quick Links</p>
                    <div className="grid grid-cols-1 gap-4">
                      {CATEGORIES.map(cat => (
                        <div key={cat.name} className="mb-2">
                          <p className="text-[14px] font-bold mb-3 text-[#6D4C91]">{cat.name}</p>
                          <div className="grid grid-cols-1 gap-3 pl-2">
                            {cat.items.map(item => (
                              <Link 
                                key={item} 
                                to="/shop" 
                                className="text-[14px] text-gray-600 active:text-[#6D4C91]" 
                                onClick={() => handleCategoryClick(cat.name, item)}
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expert Advice Section in Mobile Nav */}
                  <div className="pt-6">
                    <div className="bg-[#6D4C91] p-6 rounded-2xl text-white">
                      <h4 className="font-serif italic text-[18px] mb-2">Expert Advice</h4>
                      <p className="text-[12px] text-white/80 mb-4 leading-relaxed">Not sure what's right for you? Take our skin quiz.</p>
                      <Link 
                        to="/book" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[12px] font-bold underline underline-offset-4 uppercase tracking-widest inline-block active:scale-95 transition-transform"
                      >
                        Start Quiz
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
                    <span>+254 707 259 295</span>
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
              <div className="relative border-b-2 border-black pb-4 flex items-center mb-8 md:mb-12">
                <Search className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4 text-gray-400" />
                <input 
                  autoFocus
                  placeholder="Search products, services..."
                  className="w-full text-[18px] md:text-[24px] outline-none placeholder:text-gray-300 bg-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-12">
                <div>
                  <h3 className="text-[11px] md:text-[14px] font-bold uppercase tracking-widest text-gray-400 mb-4 md:mb-6">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {['Vitamin C', 'Niacinamide', 'SPF 50', 'Chemical Peel', 'Acne'].map(tag => (
                      <button key={tag} className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-200 rounded-full text-[12px] md:text-[14px] hover:border-[#6D4C91] hover:text-[#6D4C91] transition-colors active:bg-[#FDFBF7]">{tag}</button>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}