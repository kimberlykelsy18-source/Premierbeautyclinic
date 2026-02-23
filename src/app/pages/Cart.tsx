import { Link, useNavigate } from 'react-router';
import { ShoppingBag, X, Plus, Minus, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, formatPrice } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="pt-[200px] pb-40 text-center">
        <div className="max-w-md mx-auto px-8">
          <div className="w-24 h-24 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-[32px] font-serif mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-10">Looks like you haven't added anything to your cart yet. Let's find something for your skin!</p>
          <Link to="/shop" className="inline-block bg-[#1A1A1A] text-white px-10 py-4 rounded-full text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="text-[36px] md:text-[52px] font-serif mb-8 md:mb-12 italic">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-gray-300" />
            <h2 className="text-[24px] md:text-[32px] font-serif mb-4 italic">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 text-[15px] md:text-[16px]">Browse our collection and add products to your cart.</p>
            <Link to="/shop" className="inline-block bg-[#1A1A1A] text-white px-8 md:px-12 py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
            <div className="flex-grow space-y-4 md:space-y-6">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl flex gap-4 md:gap-8 relative group"
                  >
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-3 md:top-6 right-3 md:right-6 p-2 hover:bg-red-50 rounded-full transition-colors active:scale-90"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-red-500" />
                    </button>
                    <Link to={`/shop/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-[16px] md:text-[20px] font-bold mb-1 md:mb-2 pr-6">{item.name}</h3>
                        <p className="text-[11px] md:text-[12px] text-gray-400 uppercase tracking-widest">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3 md:space-x-4 bg-[#FDFBF7] rounded-full px-3 md:px-4 py-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors active:scale-90"><Minus className="w-3 h-3" /></button>
                          <span className="text-[15px] md:text-[16px] font-bold min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors active:scale-90"><Plus className="w-3 h-3" /></button>
                        </div>
                        <p className="text-[16px] md:text-[18px] font-bold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:w-[400px] shrink-0">
              <div className="bg-white p-6 md:p-10 rounded-3xl sticky top-[120px] md:top-[180px]">
                <h2 className="text-[20px] md:text-[24px] font-bold uppercase tracking-widest mb-8 md:mb-10">Order Summary</h2>
                <div className="space-y-4 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-gray-200">
                  <div className="flex justify-between text-[15px] md:text-[16px]">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[15px] md:text-[16px]">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] md:text-[12px] text-gray-400 italic">Free shipping on orders over KES 5,000</p>
                  )}
                </div>
                <div className="flex justify-between items-center mb-8 md:mb-10">
                  <span className="text-[18px] md:text-[20px] font-bold uppercase tracking-widest">Total</span>
                  <span className="text-[24px] md:text-[28px] font-bold text-[#6D4C91]">{formatPrice(total)}</span>
                </div>
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#1A1A1A] text-white py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all mb-4 flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <Link to="/shop" className="block text-center text-[12px] md:text-[13px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] transition-colors">
                  Continue Shopping
                </Link>

                <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-gray-100 space-y-4 md:space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#6D4C91]">
                      <Truck className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[13px] md:text-[14px] font-bold">Fast Delivery</p>
                      <p className="text-[11px] md:text-[12px] text-gray-400">2-5 business days in Nairobi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#6D4C91]">
                      <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[13px] md:text-[14px] font-bold">Secure Payment</p>
                      <p className="text-[11px] md:text-[12px] text-gray-400">SSL encrypted transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}