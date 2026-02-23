import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ShoppingBag, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';

const HERO_IMG = "https://images.unsplash.com/photo-1663271451789-a770bfbcb12a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMG1vZGVsJTIwZ2xvd2luZyUyMGZhY2UlMjBzZXJ1bSUyMGJvdHRsZSUyMGh5Z2llbmUlMjBjbGVhbnxlbnwxfHx8fDE3NzE0NDUyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080";
const SERVICE_IMG = "https://images.unsplash.com/photo-1707544738443-c8ff4113c9c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb25zdWx0YXRpb24lMjBza2luJTIwYW5hbHlzaXMlMjBwcm9mZXNzaW9uYWwlMjBjbGluaWN8ZW58MXx8fHwxNzcxNDQ1MjcxfDA";

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Glow Boosting Serum',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400',
    category: 'Serums',
    stock: 5,
    description: 'High potency vitamin C for radiant skin.'
  },
  {
    id: '2',
    name: 'Hydrating Milky Cleanser',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400',
    category: 'Cleansers',
    stock: 25,
    description: 'Gentle everyday cleanser for all skin types.'
  },
  {
    id: '3',
    name: 'Mineral Sunscreen SPF 50',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400',
    category: 'Sun Care',
    stock: 2,
    description: 'Zinc oxide based protection with zero white cast.'
  },
  {
    id: '4',
    name: 'Overnight Repair Cream',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=400',
    category: 'Moisturizers',
    stock: 12,
    description: 'Intense hydration and barrier repair.'
  }
];

export function Home() {
  const { addToCart, formatPrice } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedPremierBeauty');
    if (hasVisited) {
      navigate('/shop', { replace: true });
    } else {
      localStorage.setItem('hasVisitedPremierBeauty', 'true');
    }
  }, [navigate]);

  return (
    <div className="pt-[80px] md:pt-[100px]">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[75vh] lg:h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_IMG} 
            alt="Premier Beauty" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl text-white"
          >
            <h1 className="text-[36px] md:text-[52px] lg:text-[72px] font-serif leading-[1.1] mb-4 md:mb-6 italic">
              Experience Your <br />
              Best Skin Ever
            </h1>
            <p className="text-[15px] md:text-[18px] lg:text-[20px] mb-6 md:mb-10 text-white/90 font-light leading-relaxed">
              Dermatologist-approved skincare tailored for your unique skin journey. Professional results, simplified.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/shop" className="bg-white text-[#1A1A1A] px-8 md:px-10 py-4 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] hover:text-white transition-all duration-300 flex items-center justify-center">
                Shop Collection <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link to="/book" className="bg-transparent border-2 border-white text-white px-8 md:px-10 py-4 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1A1A1A] transition-all duration-300 flex items-center justify-center">
                Book Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-[#6D4C91] group-hover:text-white transition-colors duration-300">
                <ShieldCheck className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-[16px] md:text-[18px] font-bold mb-2 md:mb-3 uppercase tracking-wider">Expert Curated</h3>
              <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed">Handpicked by clinical experts for safety and efficacy.</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-[#6D4C91] group-hover:text-white transition-colors duration-300">
                <Sparkles className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-[16px] md:text-[18px] font-bold mb-2 md:mb-3 uppercase tracking-wider">Personalized Care</h3>
              <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed">Advanced skin analysis to find exactly what your skin needs.</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-[#6D4C91] group-hover:text-white transition-colors duration-300">
                <Calendar className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-[16px] md:text-[18px] font-bold mb-2 md:mb-3 uppercase tracking-wider">Clinical Services</h3>
              <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed">Professional facial treatments and consultations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-6">
            <div>
              <p className="text-[#6D4C91] text-[12px] md:text-[14px] font-bold uppercase tracking-widest mb-2 md:mb-3">Our Favorites</p>
              <h2 className="text-[32px] md:text-[42px] font-serif leading-tight">The Glow Edit</h2>
            </div>
            <Link to="/shop" className="text-[13px] md:text-[14px] font-bold uppercase tracking-widest border-b-2 border-[#1A1A1A] pb-1 hover:text-[#6D4C91] hover:border-[#6D4C91] transition-colors self-start md:self-auto">
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-10">
            {FEATURED_PRODUCTS.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -10 }}
                className="flex flex-col group"
              >
                <Link to={`/shop/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4 md:mb-6 rounded-xl md:rounded-2xl">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({ ...product, description: product.description });
                    }}
                    className="absolute bottom-3 md:bottom-6 left-3 md:left-6 right-3 md:right-6 bg-white py-3 md:py-4 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Quick Add</span>
                  </button>
                </Link>
                <div className="flex flex-col items-center text-center px-1">
                  <p className="text-[10px] md:text-[11px] text-gray-400 uppercase tracking-widest mb-1 md:mb-2">{product.category}</p>
                  <h3 className="text-[14px] md:text-[16px] font-medium mb-1 group-hover:text-[#6D4C91] transition-colors leading-tight">{product.name}</h3>
                  <div className="mb-2">
                    {product.stock <= 5 ? (
                      <span className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-tighter">Low Stock</span>
                    ) : (
                      <span className="text-[9px] md:text-[10px] text-green-600 font-bold uppercase tracking-tighter">In Stock</span>
                    )}
                  </div>
                  <p className="text-[14px] md:text-[15px] font-bold">{formatPrice(product.price)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[3/4] rounded-[40px] overflow-hidden">
                <img src={SERVICE_IMG} alt="Service" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-[#6D4C91] p-10 rounded-2xl text-white hidden md:block">
                <p className="text-[24px] font-serif italic mb-2">98% Success Rate</p>
                <p className="text-[14px] text-white/80">In clinical skin analysis treatments.</p>
              </div>
            </div>
            <div>
              <p className="text-[#6D4C91] text-[14px] font-bold uppercase tracking-widest mb-4">Professional Expertise</p>
              <h2 className="text-[48px] font-serif leading-tight mb-8 italic">
                Beyond Products: <br />
                Clinical Skin Solutions
              </h2>
              <p className="text-gray-600 text-[17px] leading-relaxed mb-10">
                Certified professionals providing in-depth skin analysis and customized treatments to address your specific concerns.
              </p>
              <ul className="space-y-4 mb-12">
                {['Virtual & In-person Consultations', 'Detailed Skin Analysis Reports', 'Professional Grade Facial Treatments'].map(item => (
                  <li key={item} className="flex items-center text-[16px] font-medium">
                    <div className="w-6 h-6 rounded-full bg-[#FDFBF7] flex items-center justify-center mr-4 text-[#6D4C91]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/book" className="bg-[#1A1A1A] text-white px-12 py-5 rounded-full text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all duration-300 inline-block shadow-lg">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#F3F1ED] py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-[32px] font-serif mb-6 italic">Join the Beauty Circle</h2>
          <p className="text-gray-500 mb-10 text-[16px]">Sign up for skincare tips and early access to new launches.</p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-8 py-4 rounded-full bg-white outline-none text-[15px]"
            />
            <button className="bg-[#6D4C91] text-white px-10 py-4 rounded-full text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}