import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, CheckCircle2, Truck, ShieldCheck, MapPin, CreditCard, Smartphone, Edit2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';
import logo from 'figma:asset/9f791e938296bf5db89926ddac1d6fc1b167f150.png';
import mpesaLogo from 'figma:asset/3a3966f7b64f454c098d92c9bd69154ee90678bd.png';

export function Checkout() {
  const { cart, formatPrice, getShippingFee, shippingRegions, clearCart, user, updateUser } = useStore();
  const { showFeedback } = useFeedback();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [showMpesaConfirm, setShowMpesaConfirm] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [isEditingMpesaPhone, setIsEditingMpesaPhone] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const navigate = useNavigate();

  // Card payment state
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');

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
      additionalInfo: ''
    };
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = formData.county ? getShippingFee(formData.county) : 0;
  const total = subtotal + shipping;

  // Card formatting helpers
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  const detectCardType = (number: string) => {
    const sanitized = number.replace(/\s+/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(sanitized)) {
      return 'visa';
    }
    // Mastercard: starts with 51-55 or 2221-2720
    if (/^5[1-5]/.test(sanitized) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(sanitized)) {
      return 'mastercard';
    }
    
    return 'unknown';
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardData({ ...cardData, number: formatted });
    setCardType(detectCardType(formatted));
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    setCardData({ ...cardData, expiry: formatted });
  };

  const handleInitiateMpesa = () => {
    // Set M-Pesa phone to user's phone number
    setMpesaPhone(formData.phone);
    setShowMpesaConfirm(true);
  };

  const handleConfirmMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      showFeedback('error', 'Invalid Phone Number', 'Please enter a valid M-Pesa phone number.');
      return;
    }

    setAwaitingPayment(true);
    setIsLoading(true);

    try {
      // Show STK Push notification
      showFeedback(
        'success',
        'STK Push Sent!',
        `Please check your phone (${mpesaPhone}) and enter your M-Pesa PIN to complete payment.`
      );

      // Simulate waiting for payment confirmation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Simulate payment success
      showFeedback(
        'success',
        'Payment Confirmed!',
        'Your M-Pesa payment was successful. Processing your order...'
      );

      // Wait a moment then complete order
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save address and complete order
      if (user) {
        updateUser({
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          savedAddress: {
            county: formData.county,
            city: formData.city,
            streetAddress: formData.streetAddress,
            building: formData.building,
            additionalInfo: formData.additionalInfo
          }
        });
      }

      // Clear cart
      clearCart();

      // Show final success
      showFeedback(
        'success',
        'Order Placed Successfully!',
        `Your order has been confirmed. A confirmation has been sent to ${formData.email}`
      );

      // Navigate to shop
      setTimeout(() => {
        navigate('/shop');
      }, 2000);
    } catch (error) {
      showFeedback(
        'error',
        'Payment Failed',
        'M-Pesa payment was not completed. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setAwaitingPayment(false);
      setShowMpesaConfirm(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save address to user profile if logged in
      if (user) {
        updateUser({
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          savedAddress: {
            county: formData.county,
            city: formData.city,
            streetAddress: formData.streetAddress,
            building: formData.building,
            additionalInfo: formData.additionalInfo
          }
        });
      }
      
      // Clear cart
      clearCart();
      
      // Show success feedback
      showFeedback(
        'success',
        'Payment Successful!',
        `Your card payment was processed successfully. Order confirmation sent to ${formData.email}`
      );
      
      // Navigate to shop after 2 seconds
      setTimeout(() => {
        navigate('/shop');
      }, 2000);
    } catch (error) {
      showFeedback(
        'error',
        'Payment Failed',
        'There was an issue processing your payment. Please try again.'
      );
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
      
      showFeedback('success', 'Shipping Details Saved', 'Proceeding to payment...');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
              <span className={`text-[11px] md:text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${step >= 2 ? 'text-[#6D4C91]' : 'text-gray-300'}`}>02 Payment</span>
              <div className="w-6 md:w-8 h-[1px] bg-gray-200 flex-shrink-0" />
              <span className={`text-[11px] md:text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${step >= 3 ? 'text-[#6D4C91]' : 'text-gray-300'}`}>03 Confirm</span>
            </div>

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
                      Continue to Payment
                    </ButtonWithLoading>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="text-[28px] md:text-[32px] font-serif mb-6 md:mb-8 italic">How would you like to pay?</h2>
                  
                  <div className="space-y-4 md:space-y-6">
                    {/* M-Pesa Option */}
                    <button
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`w-full p-5 md:p-8 rounded-2xl md:rounded-3xl border-2 flex items-center space-x-4 md:space-x-6 transition-all ${
                        paymentMethod === 'mpesa' ? 'border-[#6D4C91] bg-[#FDFBF7] shadow-lg' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 flex-shrink-0">
                        <img src={mpesaLogo} alt="M-Pesa" className="h-8 md:h-10 w-auto" />
                      </div>
                      <div className="text-left flex-grow">
                        <h3 className="text-[15px] md:text-[18px] font-bold mb-1">M-Pesa</h3>
                        <p className="text-[12px] md:text-[13px] text-gray-400">Pay securely via STK Push</p>
                      </div>
                      {paymentMethod === 'mpesa' && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#6D4C91] flex-shrink-0" />}
                    </button>

                    {/* Card Option */}
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-5 md:p-8 rounded-2xl md:rounded-3xl border-2 flex items-center space-x-4 md:space-x-6 transition-all ${
                        paymentMethod === 'card' ? 'border-[#6D4C91] bg-[#FDFBF7] shadow-lg' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl flex-shrink-0">
                        <svg className="w-8 h-6 md:w-10 md:h-7" viewBox="0 0 48 32" fill="none">
                          <rect width="48" height="32" rx="4" fill="#1434CB" />
                          <path d="M17 10h14M17 16h14M17 22h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <svg className="w-8 h-6 md:w-10 md:h-7" viewBox="0 0 48 32" fill="none">
                          <rect width="48" height="32" rx="4" fill="#EB001B" />
                          <circle cx="20" cy="16" r="8" fill="#FF5F00" />
                          <circle cx="28" cy="16" r="8" fill="#F79E1B" />
                        </svg>
                      </div>
                      <div className="text-left flex-grow">
                        <h3 className="text-[15px] md:text-[18px] font-bold mb-1">Card Payment</h3>
                        <p className="text-[12px] md:text-[13px] text-gray-400">Visa, Mastercard</p>
                      </div>
                      {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#6D4C91] flex-shrink-0" />}
                    </button>

                    {/* Card Details (if card selected) */}
                    {paymentMethod === 'card' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 md:space-y-5 pt-4"
                      >
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Card Number</label>
                          <input 
                            type="text" 
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            value={cardData.number}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-[15px] md:text-[16px]" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-5">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Expiry</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardData.expiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                              className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-[15px] md:text-[16px]" 
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">CVV</label>
                            <input 
                              type="text" 
                              placeholder="123"
                              maxLength={3}
                              value={cardData.cvv}
                              onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                              className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-[15px] md:text-[16px]" 
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl md:rounded-2xl border border-blue-100">
                          <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                          <p className="text-[12px] md:text-[13px] text-blue-700 font-medium">Your payment information is encrypted and secure.</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-3 md:gap-4 pt-4">
                      <button 
                        onClick={() => setStep(1)} 
                        className="flex-1 py-4 md:py-5 rounded-full border border-gray-200 text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                      <ButtonWithLoading
                        isLoading={false}
                        onClick={handleNextStep}
                        className="flex-[2] bg-[#1A1A1A] text-white py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all"
                      >
                        Review Order
                      </ButtonWithLoading>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
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
                        <p>{formData.city}, {formData.county}</p>
                        {formData.additionalInfo && <p className="mt-2 text-[13px] italic">{formData.additionalInfo}</p>}
                      </div>
                    </div>

                    {/* Payment Method Summary */}
                    <div className="bg-[#FDFBF7] p-5 md:p-8 rounded-2xl md:rounded-3xl">
                      <h3 className="text-[14px] font-bold uppercase tracking-widest mb-4 md:mb-6 flex items-center">
                        {paymentMethod === 'mpesa' ? <Smartphone className="w-4 h-4 mr-2 text-[#6D4C91]"/> : <CreditCard className="w-4 h-4 mr-2 text-[#6D4C91]"/>}
                        Payment Method
                      </h3>
                      
                      {paymentMethod === 'mpesa' ? (
                        <div>
                          <div className="flex items-center space-x-3 mb-4">
                            <img src={mpesaLogo} alt="M-Pesa" className="h-8" />
                            <span className="text-[15px] md:text-[16px] font-bold">M-Pesa STK Push</span>
                          </div>
                          
                          {!showMpesaConfirm && !awaitingPayment && (
                            <div className="mt-4">
                              <p className="text-[13px] md:text-[14px] text-gray-600 mb-4">
                                When you click "Confirm Payment", an STK push will be sent to:
                              </p>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                                {isEditingMpesaPhone ? (
                                  <input
                                    type="tel"
                                    value={mpesaPhone}
                                    onChange={(e) => setMpesaPhone(e.target.value)}
                                    placeholder="07XX XXX XXX"
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 outline-none focus:border-[#6D4C91] text-[15px]"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-[16px] md:text-[18px] font-bold">{mpesaPhone || formData.phone}</span>
                                )}
                                <button
                                  onClick={() => {
                                    if (isEditingMpesaPhone) {
                                      setIsEditingMpesaPhone(false);
                                    } else {
                                      setMpesaPhone(formData.phone);
                                      setIsEditingMpesaPhone(true);
                                    }
                                  }}
                                  className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  {isEditingMpesaPhone ? <Check className="w-4 h-4 text-green-600" /> : <Edit2 className="w-4 h-4 text-gray-500" />}
                                </button>
                              </div>
                              <p className="text-[11px] md:text-[12px] text-gray-400 mt-2 italic">
                                Make sure your phone is on and nearby to complete the payment.
                              </p>
                            </div>
                          )}

                          {awaitingPayment && (
                            <div className="mt-4 p-5 bg-green-50 border border-green-200 rounded-xl">
                              <div className="flex items-start space-x-3">
                                <div className="animate-pulse">
                                  <Smartphone className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-[14px] md:text-[15px] font-bold text-green-900 mb-2">
                                    STK Push Sent!
                                  </p>
                                  <p className="text-[13px] md:text-[14px] text-green-700">
                                    Please check your phone ({mpesaPhone || formData.phone}) and enter your M-Pesa PIN to complete payment.
                                  </p>
                                  <div className="mt-3 flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                                    <span className="text-[12px] text-green-600 font-medium">Waiting for payment confirmation...</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {cardType === 'visa' && (
                            <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#1434CB" />
                              <path d="M17 10h14M17 16h14M17 22h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          )}
                          {cardType === 'mastercard' && (
                            <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#EB001B" />
                              <circle cx="20" cy="16" r="8" fill="#FF5F00" />
                              <circle cx="28" cy="16" r="8" fill="#F79E1B" />
                            </svg>
                          )}
                          <div>
                            <p className="text-[15px] md:text-[16px] font-bold">
                              {cardType === 'visa' ? 'Visa' : cardType === 'mastercard' ? 'Mastercard' : 'Card'} •••• {cardData.number.slice(-4)}
                            </p>
                            <p className="text-[13px] text-gray-500">Expires {cardData.expiry}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 md:gap-4">
                      <button 
                        onClick={() => setStep(2)} 
                        disabled={isLoading || awaitingPayment}
                        className="flex-1 py-4 md:py-5 rounded-full border border-gray-200 text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                      <ButtonWithLoading
                        isLoading={isLoading}
                        onClick={paymentMethod === 'mpesa' ? handleConfirmMpesaPayment : handlePlaceOrder}
                        className="flex-[2] bg-[#6D4C91] text-white py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all shadow-xl"
                      >
                        {paymentMethod === 'mpesa' ? 'Confirm Payment' : `Pay ${formatPrice(total)}`}
                      </ButtonWithLoading>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                      <h3 className="text-[14px] md:text-[15px] font-bold mb-1 truncate">{item.name}</h3>
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