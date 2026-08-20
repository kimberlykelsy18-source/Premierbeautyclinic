import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, CheckCircle2, Truck, ShieldCheck, MapPin, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';
import logo from '../../assets/logo.png';
import { apiFetch } from '../lib/api';
import { Seo } from '../lib/seo';

export function Checkout() {
  const { cart, formatPrice, getShippingFee, shippingRegions, clearCart, user, updateUser, token, sessionId } = useStore();
  const { showFeedback } = useFeedback();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form data - Initialize with user data if logged in
  const [formData, setFormData] = useState(() => {
    if (user) {
      // Split name into first and last name
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        county: user.savedAddress?.county || '',
        city: user.savedAddress?.city || '',
        streetAddress: user.savedAddress?.streetAddress || '',
        building: user.savedAddress?.building || '',
        postalCode: user.savedAddress?.postalCode || '',
        additionalInfo: user.savedAddress?.additionalInfo || ''
      };
    }

    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      county: '',
      city: '',
      streetAddress: '',
      building: '',
      postalCode: '',
      additionalInfo: ''
    };
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = formData.county ? getShippingFee(formData.county) : 0;
  const total = subtotal + shipping;

  // M-Pesa/card checkout is on hold — this hands off to WhatsApp instead. The
  // order is created as 'pending' first (visible to staff immediately), then a
  // pre-filled wa.me link opens. The blank tab is opened synchronously, before
  // the await, so the click's user-activation survives the async gap — opening
  // it after the await is what popup blockers (Safari especially) tend to kill.
  const handleWhatsAppCheckout = async () => {
    setIsLoading(true);
    const tab = window.open('', '_blank');
    try {
      const data = await apiFetch('/checkout/whatsapp', {
        method: 'POST',
        body: JSON.stringify({
          shipping_address: {
            street: formData.streetAddress,
            building: formData.building,
            city: formData.city,
            county: formData.county,
            postalCode: formData.postalCode,
            additionalInfo: formData.additionalInfo,
          },
          phone: formData.phone,
          session_id: sessionId,
          customer_email: formData.email,
          customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
          shipping_fee: shipping,
        }),
      }, token, sessionId);

      setWhatsappUrl(data.whatsapp_url);
      if (tab) tab.location.href = data.whatsapp_url;
      else window.open(data.whatsapp_url, '_blank');

      if (user) {
        const savedAddress = {
          county: formData.county,
          city: formData.city,
          streetAddress: formData.streetAddress,
          building: formData.building,
          postalCode: formData.postalCode,
          additionalInfo: formData.additionalInfo,
        };
        updateUser({
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          savedAddress,
        });
        apiFetch('/profile', {
          method: 'PATCH',
          body: JSON.stringify({ shipping_address: savedAddress }),
        }, token, sessionId).catch(() => {});
      }

      clearCart();
      navigate('/shop');
      showFeedback('success', 'Order Sent!', "We've opened WhatsApp with your order details — send the message to confirm with our team.");
    } catch (err: any) {
      if (tab) tab.close();
      showFeedback('error', 'Checkout Failed', err.message || 'Failed to send order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate shipping info
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.county || !formData.streetAddress) {
        showFeedback('error', 'Missing Information', 'Please fill in all required fields.');
        return;
      }

      // Validate email
      if (!formData.email.includes('@')) {
        showFeedback('error', 'Invalid Email', 'Please enter a valid email address.');
        return;
      }

      // Validate phone
      if (formData.phone.length < 10) {
        showFeedback('error', 'Invalid Phone', 'Please enter a valid phone number.');
        return;
      }

      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F1F8]">
      <Seo title="Checkout" path="/checkout" noindex />
      {/* Mini Header */}
      <header className="py-6 md:py-8 border-b border-gray-100 mb-8 md:mb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link to="/cart" className="flex items-center space-x-2 text-[13px] md:text-[14px] hover:text-[#6D4C91] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Cart</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <Link to="/">
            <div className="bg-[#1A1A1A] px-2 md:px-3 py-1 md:py-1.5 rounded-xl">
              <img src={logo} alt="Premier Beauty" className="h-6 md:h-8" />
            </div>
          </Link>
          <div className="flex items-center space-x-2 text-[13px] md:text-[14px] text-gray-400">
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Secure SSL</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 pb-16 md:pb-24">
          {/* Main Content */}
          <div>
            {/* Step Indicators */}
            <div className="flex items-center space-x-3 md:space-x-4 mb-8 md:mb-12 overflow-x-auto pb-2">
              <span className={`text-[11px] md:text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${step >= 1 ? 'text-[#6D4C91]' : 'text-gray-300'}`}>01 Shipping</span>
              <div className="w-6 md:w-8 h-[1px] bg-gray-200 flex-shrink-0" />
              <span className={`text-[11px] md:text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${step >= 2 ? 'text-[#6D4C91]' : 'text-gray-300'}`}>02 Confirm</span>
            </div>

            <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="text-[28px] md:text-[32px] font-serif mb-6 md:mb-8 italic">Where should we send it?</h2>

                  {/* Logged in notice */}
                  {user && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] md:text-[14px] font-bold text-green-900 mb-1">Welcome back, {user.name.split(' ')[0]}!</p>
                        <p className="text-[12px] md:text-[13px] text-green-700">We've pre-filled your contact details. Please add your delivery address below.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">First Name *</label>
                        <input
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Last Name *</label>
                        <input
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="07XX XXX XXX"
                        className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                      />
                    </div>

                    <div className="border-t border-gray-100 pt-5 md:pt-6 mt-6">
                      <h3 className="text-[14px] font-bold uppercase tracking-widest mb-4 md:mb-6 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-[#6D4C91]" />
                        Delivery Address
                      </h3>

                      <div className="space-y-5 md:space-y-6">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">County *</label>
                          <select
                            value={formData.county}
                            onChange={(e) => setFormData({...formData, county: e.target.value})}
                            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                          >
                            <option value="">Select your county</option>
                            {shippingRegions.map(region => (
                              <option key={region.id} value={region.county}>
                                {region.county} - {formatPrice(region.fee)} shipping
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">City/Town *</label>
                          <input
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Street Address *</label>
                          <input
                            value={formData.streetAddress}
                            onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                            placeholder="e.g. Kimathi Street"
                            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Building/House Number</label>
                          <input
                            value={formData.building}
                            onChange={(e) => setFormData({...formData, building: e.target.value})}
                            placeholder="e.g. Apt 5B, House 12"
                            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Postal Code</label>
                          <input
                            value={formData.postalCode}
                            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                            placeholder="e.g. 00100"
                            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] md:text-[16px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Additional Delivery Info</label>
                          <textarea
                            value={formData.additionalInfo}
                            onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                            placeholder="Any special instructions for delivery (optional)"
                            rows={3}
                            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all resize-none text-[15px] md:text-[16px]"
                          />
                        </div>
                      </div>
                    </div>

                    <ButtonWithLoading
                      isLoading={false}
                      onClick={handleNextStep}
                      className="w-full bg-[#1A1A1A] text-white py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all mt-4"
                    >
                      Continue to Review
                    </ButtonWithLoading>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="confirm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="text-[28px] md:text-[32px] font-serif mb-6 md:mb-8 italic">Review Your Order</h2>

                  <div className="space-y-6 md:space-y-8">
                    {/* Shipping Details */}
                    <div className="bg-[#FDFBF7] p-5 md:p-8 rounded-2xl md:rounded-3xl">
                      <h3 className="text-[14px] font-bold uppercase tracking-widest mb-4 md:mb-6 flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-[#6D4C91]" />
                        Delivery Address
                      </h3>
                      <div className="text-[14px] md:text-[15px] leading-relaxed text-gray-600">
                        <p className="font-bold text-gray-900">{formData.firstName} {formData.lastName}</p>
                        <p>{formData.phone}</p>
                        <p>{formData.email}</p>
                        <p className="mt-3">{formData.streetAddress} {formData.building && `- ${formData.building}`}</p>
                        <p>{formData.city}, {formData.county}{formData.postalCode && ` ${formData.postalCode}`}</p>
                        {formData.additionalInfo && <p className="mt-2 text-[13px] italic">{formData.additionalInfo}</p>}
                      </div>
                    </div>

                    {/* No online payment — WhatsApp handoff explainer */}
                    <div className="bg-[#FDFBF7] p-5 md:p-8 rounded-2xl md:rounded-3xl">
                      <h3 className="text-[14px] font-bold uppercase tracking-widest mb-3 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2 text-[#6D4C91]" />
                        Confirm via WhatsApp
                      </h3>
                      <p className="text-[13px] md:text-[14px] text-gray-600">
                        No online payment needed — we'll open WhatsApp with your order details pre-filled. Send the message and our team will confirm payment and delivery with you directly.
                      </p>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-[12px] font-bold text-[#6D4C91] hover:underline"
                        >
                          Didn't open? Tap here to open WhatsApp
                        </a>
                      )}
                    </div>

                    <div className="flex gap-3 md:gap-4">
                      <button
                        onClick={() => setStep(1)}
                        disabled={isLoading}
                        className="flex-1 py-4 md:py-5 rounded-full border border-gray-200 text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                      <ButtonWithLoading
                        isLoading={isLoading}
                        onClick={handleWhatsAppCheckout}
                        className="flex-[2] bg-[#6D4C91] text-white py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all shadow-xl"
                      >
                        Send Order via WhatsApp
                      </ButtonWithLoading>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-[120px] lg:h-fit">
            <div className="bg-[#FDFBF7] p-6 md:p-10 rounded-3xl">
              <h2 className="text-[18px] md:text-[24px] font-bold uppercase tracking-widest mb-6 md:mb-10">Order Summary</h2>

              <div className="space-y-4 md:space-y-6 mb-6 md:mb-10">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-[14px] md:text-[15px] font-bold mb-1 truncate">
                        {item.name}
                        {item.size && <span className="text-gray-400 font-medium"> · {item.size}</span>}
                      </h3>
                      <p className="text-[12px] md:text-[13px] text-gray-400">Qty: {item.quantity}</p>
                      <p className="text-[14px] font-bold mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 md:pt-10 border-t border-gray-200">
                <div className="flex justify-between text-[14px] md:text-[15px]">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[14px] md:text-[15px]">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {formData.county && shipping > 0 && (
                  <p className="text-[11px] md:text-[12px] text-gray-400 italic">Delivery to {formData.county}</p>
                )}
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[18px] md:text-[20px] font-bold uppercase tracking-widest">Total</span>
                  <span className="text-[24px] md:text-[28px] font-bold text-[#6D4C91]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
