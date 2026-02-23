import { useParams, Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Plus, Minus, ChevronRight, Heart, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { toast } from 'sonner';

const ALL_PRODUCTS = [
  { id: '1', name: 'Glow Boosting Serum', price: 3500, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800', category: 'Serums', skinType: 'All', stock: 12, brand: 'Premier', description: 'Our Bestselling Glow Boosting Serum is a potent blend of stabilized Vitamin C, Niacinamide, and Hyaluronic Acid designed to brighten, firm, and hydrate in one single step. Perfect for those looking to address dullness and uneven texture.', ingredients: 'Aqua, Sodium Ascorbyl Phosphate, Niacinamide, Glycerin, Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin.', usage: 'Apply 3-4 drops onto clean, damp skin every morning. Follow with moisturizer and SPF.' },
  { id: '2', name: 'Hydrating Milky Cleanser', price: 2800, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800', category: 'Cleansers', skinType: 'Dry', stock: 45, brand: 'CeraVe', description: 'A gentle, non-foaming cleanser that removes impurities without stripping your natural moisture barrier. Formulated with oat extracts and Ceramides.', ingredients: 'Aqua, Caprylic/Capric Triglyceride, Glycerin, Avena Sativa (Oat) Kernel Extract, Ceramide NP.', usage: 'Massage into dry or damp skin. Rinse thoroughly with lukewarm water.' },
  { id: '3', name: 'Mineral Sunscreen SPF 50', price: 4200, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800', category: 'Sun Care', skinType: 'All', stock: 3, brand: 'La Roche-Posay', description: 'Broad-spectrum mineral protection with a lightweight, invisible finish. No white cast, even on deep skin tones.', ingredients: 'Zinc Oxide (20%), Titanium Dioxide, Green Tea Extract, Squalane.', usage: 'Apply liberally 15 minutes before sun exposure. Reapply every 2 hours.' },
  { id: '4', name: 'Overnight Repair Cream', price: 5500, image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800', category: 'Moisturizers', skinType: 'Sensitive', stock: 22, brand: 'Bioderma', description: 'Deeply nourishing night treatment that supports your skins natural repair process while you sleep.', ingredients: 'Butyrospermum Parkii (Shea) Butter, Peptides, Panthenol, Ceramide AP.', usage: 'Apply as the final step in your evening routine.' },
];

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, formatPrice } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const product = ALL_PRODUCTS.find(p => p.id === id) || ALL_PRODUCTS[0];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
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
          <span className="text-gray-900 font-bold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-16 md:mb-24">
          {/* Product Images */}
          <div className="space-y-3 md:space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/5] bg-gray-100 rounded-2xl md:rounded-[32px] overflow-hidden"
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl md:rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${i === 0 ? 'border-[#6D4C91]' : 'border-transparent hover:border-gray-200'}`}>
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2">
                  <p className="text-[#6D4C91] text-[11px] md:text-[14px] font-bold uppercase tracking-widest">{product.brand}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-gray-400 text-[11px] md:text-[14px] font-medium uppercase tracking-widest">{product.category}</p>
                </div>
                <div className="flex space-x-2 md:space-x-4">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"><Heart className="w-4 h-4 md:w-5 md:h-5" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"><Share2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                </div>
              </div>
              <h1 className="text-[28px] md:text-[42px] font-serif leading-tight mb-3 md:mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4 md:mb-6">
                {product.stock <= 5 ? (
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
              <p className="text-[24px] md:text-[32px] font-bold">{formatPrice(product.price)}</p>
            </div>

            <div className="mb-6 md:mb-10 p-4 md:p-6 bg-[#FDFBF7] rounded-xl md:rounded-[24px]">
              <p className="text-gray-600 text-[14px] md:text-[16px] leading-relaxed mb-4 md:mb-6">{product.description}</p>
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
                  <span className="hidden sm:inline">Add to Cart — {formatPrice(product.price * quantity)}</span>
                  <span className="sm:hidden">Add — {formatPrice(product.price * quantity)}</span>
                </button>
              </div>
              <p className="text-center text-[11px] md:text-[12px] text-gray-400 font-medium">Safe & Secure Checkout via M-Pesa & Card</p>
            </div>
          </div>
        </div>

        {/* Detailed Tabs */}
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
                <p className="text-gray-600 leading-relaxed text-[15px] md:text-[17px]">{product.description}</p>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <p className="text-gray-600 leading-relaxed text-[15px] md:text-[17px]">{product.ingredients}</p>
            )}
            {activeTab === 'how to use' && (
              <p className="text-gray-600 leading-relaxed text-[15px] md:text-[17px]">{product.usage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}