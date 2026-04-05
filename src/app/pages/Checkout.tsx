import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, CheckCircle2, Truck, ShieldCheck, MapPin, CreditCard, Smartphone, Edit2, Check, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';
import logo from '../../assets/logo.png';
import mpesaLogo from '../../assets/mpesa.png';
import { apiFetch } from '../lib/api';

// Convert any common Kenyan phone format to the 254XXXXXXXXX format Daraja requires.
// Examples: 0712345678 → 254712345678, +254712345678 → 254712345678
function normalizeMpesaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
  return digits; // return as-is and let the backend/Safaricom reject if invalid
}

export function Checkout() {
  const { cart, formatPrice, getShippingFee, shippingRegions, clearCart, user, updateUser, token, sessionId } = useStore();
  const { showFeedback } = useFeedback();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [showMpesaConfirm, setShowMpesaConfirm] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [isEditingMpesaPhone, setIsEditingMpesaPhone] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const navigate = useNavigate();

  const [isCardLoading, setIsCardLoading] = useState(false);

  // Card form data
  const [cardData, setCardData] = useState({ number: '', expiryMonth: '', expiryYear: '', cvv: '' });
  // V4 auth flow state
  type CardStage = 'form' | 'pin' | 'otp' | 'processing';
  const [cardStage, setCardStage]       = useState<CardStage>('form');
  const [pendingChargeId, setPendingChargeId] = useState('');
  const [pendingTxRef, setPendingTxRef]       = useState('');
  const [pinInput, setPinInput] = useState('');
  const [otpInput, setOtpInput] = useState('');

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

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

  const handleInitiateMpesa = () => {
    // Set M-Pesa phone to user's phone number
    setMpesaPhone(formData.phone);
    setShowMpesaConfirm(true);
  };

  // Poll GET /payment/status/:id every 3 seconds until the backend receives
  // Safaricom's callback and marks the payment as 'paid' or 'failed'.
  // Gives up after 2 minutes (40 attempts) and returns 'timeout'.
  const pollPaymentStatus = async (checkoutRequestId: string): Promise<'paid' | 'failed' | 'timeout'> => {
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const data = await apiFetch(`/payment/status/${checkoutRequestId}`, {}, token, sessionId);
        if (data.status === 'paid') return 'paid';
        if (data.status === 'failed') return 'failed';
        // 'pending' → keep polling
      } catch {
        // Network hiccup — ignore and keep trying
      }
    }
    return 'timeout';
  };

  const handleConfirmMpesaPayment = async () => {
    const rawPhone = mpesaPhone || formData.phone;
    if (!rawPhone || rawPhone.replace(/\D/g, '').length < 9) {
      showFeedback('error', 'Invalid Phone Number', 'Please enter a valid M-Pesa phone number.');
      return;
    }

    // Normalize to 254XXXXXXXXX — the format Daraja requires
    const normalizedPhone = normalizeMpesaPhone(rawPhone);

    setAwaitingPayment(true);
    setIsLoading(true);

    try {
      // Step 1: Create the order in the database and trigger STK push
      const data = await apiFetch('/checkout/mpesa', {
        method: 'POST',
        body: JSON.stringify({
          phone: normalizedPhone,
          shipping_address: {
            street: formData.streetAddress,
            building: formData.building,
            city: formData.city,
            county: formData.county,
            postalCode: formData.postalCode,
            additionalInfo: formData.additionalInfo,
          },
          session_id: sessionId,
          customer_email: formData.email,
          shipping_fee: shipping, // pass the frontend-calculated dynamic fee
        }),
      }, token, sessionId);

      const { checkout_request_id } = data;

      // Step 2: Tell the user to check their phone
      showFeedback(
        'info',
        'STK Push Sent!',
        `Check your phone (${rawPhone}) and enter your M-Pesa PIN to complete payment.`
      );

      // Step 3: Poll until paid, failed, or timeout
      const result = await pollPaymentStatus(checkout_request_id);

      if (result === 'paid') {
        // Save address to user profile so it pre-fills next time
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
          // Persist to DB so it survives across devices and browser clears
          apiFetch('/profile', {
            method: 'PATCH',
            body: JSON.stringify({ shipping_address: savedAddress }),
          }, token, sessionId).catch(() => {});
        }
        clearCart();
        showFeedback('success', 'Payment Confirmed!', `Your order is placed. A confirmation email will be sent to ${formData.email}.`);
        setTimeout(() => navigate('/shop'), 2500);

      } else if (result === 'failed') {
        showFeedback('error', 'Payment Failed', 'The M-Pesa payment was declined or cancelled. Please try again.');

      } else {
        // Timeout — payment may still go through later
        showFeedback('error', 'Payment Timeout', "We didn't receive payment confirmation. If you were charged, please contact us with your M-Pesa receipt.");
      }

    } catch (err: any) {
      showFeedback('error', 'Checkout Failed', err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
      setAwaitingPayment(false);
    }
  };

  const handleCardPayment = async () => {
    const rawNumber = cardData.number.replace(/\s/g, '');
    if (!rawNumber || rawNumber.length < 13) {
      showFeedback('error', 'Invalid Card', 'Please enter a valid card number.'); return;
    }
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      showFeedback('error', 'Invalid Expiry', 'Please enter the card expiry date.'); return;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      showFeedback('error', 'Invalid CVV', 'Please enter the 3–4 digit CVV on your card.'); return;
    }

    setIsCardLoading(true);
    try {
      const data = await apiFetch('/checkout/card', {
        method: 'POST',
        body: JSON.stringify({
          shipping_address: {
            street:        formData.streetAddress,
            building:      formData.building,
            city:          formData.city,
            county:        formData.county,
            additionalInfo: formData.additionalInfo,
          },
          shipping_fee:   shipping,
          session_id:     sessionId,
          customer_email: formData.email,
          billing: {
            firstName: formData.firstName,
            lastName:  formData.lastName,
            phone:     formData.phone,
          },
          card: {
            number:       rawNumber,
            expiry_month: cardData.expiryMonth,
            expiry_year:  cardData.expiryYear,
            cvv:          cardData.cvv,
          },
        }),
      }, token, sessionId);

      setPendingChargeId(data.charge_id);
      setPendingTxRef(data.tx_ref);

      const action = data.next_action;
      if (!action) {
        // No auth needed — done
        navigate(`/order-success?status=successful&reference=${encodeURIComponent(data.tx_ref)}`);
      } else if (action.type === 'redirect_url') {
        // 3DS — redirect customer to bank auth page
        window.location.href = action.redirect_url.url;
      } else if (action.type === 'requires_pin') {
        setCardStage('pin');
        setIsCardLoading(false);
      } else {
        showFeedback('error', 'Auth Required', `Unsupported auth type: ${action.type}. Please try a different card.`);
        setIsCardLoading(false);
      }
    } catch (err: any) {
      showFeedback('error', 'Card Payment Failed', err.message || 'Failed to initiate card payment. Please try again.');
      setIsCardLoading(false);
    }
  };

  const handleSubmitPin = async () => {
    if (!pinInput || pinInput.length < 4) {
      showFeedback('error', 'Invalid PIN', 'Please enter your 4-digit card PIN.'); return;
    }
    setIsCardLoading(true);
    try {
      const data = await apiFetch('/checkout/card/authorize', {
        method: 'POST',
        body: JSON.stringify({
          charge_id:     pendingChargeId,
          authorization: { type: 'pin', pin: { rawPin: pinInput } },
        }),
      }, token, sessionId);

      setPinInput('');
      const action = data.next_action;
      if (!action) {
        navigate(`/order-success?status=successful&reference=${encodeURIComponent(pendingTxRef)}`);
      } else if (action.type === 'requires_otp' || action.type === 'otp') {
        setCardStage('otp');
        setIsCardLoading(false);
      } else if (action.type === 'redirect_url') {
        window.location.href = action.redirect_url.url;
      } else {
        showFeedback('error', 'Auth Failed', 'Could not complete PIN authorization. Please try again.');
        setIsCardLoading(false);
      }
    } catch (err: any) {
      showFeedback('error', 'PIN Failed', err.message || 'Incorrect PIN. Please try again.');
      setIsCardLoading(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      showFeedback('error', 'Invalid OTP', 'Please enter the OTP sent to your phone.'); return;
    }
    setIsCardLoading(true);
    try {
      const data = await apiFetch('/checkout/card/authorize', {
        method: 'POST',
        body: JSON.stringify({
          charge_id:     pendingChargeId,
          authorization: { type: 'otp', otp: { code: otpInput } },
        }),
      }, token, sessionId);

      setOtpInput('');
      if (!data.next_action) {
        navigate(`/order-success?status=successful&reference=${encodeURIComponent(pendingTxRef)}`);
      } else {
        showFeedback('error', 'OTP Failed', 'Payment could not be completed. Please try again.');
        setCardStage('form');
        setIsCardLoading(false);
      }
    } catch (err: any) {
      showFeedback('error', 'OTP Failed', err.message || 'Invalid OTP. Please try again.');
      setIsCardLoading(false);
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
    <div className="min-h-screen bg-[#F2F1F8]">
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

                    {/* Card input fields */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2 space-y-4"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Lock className="w-4 h-4 text-[#6D4C91]" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Secure Card Details</span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Card Number *</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={19}
                            placeholder="0000 0000 0000 0000"
                            value={cardData.number}
                            onChange={e => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                            className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] tracking-widest"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Month *</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={2}
                              placeholder="MM"
                              value={cardData.expiryMonth}
                              onChange={e => setCardData({ ...cardData, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] text-center tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Year *</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={4}
                              placeholder="YYYY"
                              value={cardData.expiryYear}
                              onChange={e => setCardData({ ...cardData, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] text-center tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">CVV *</label>
                            <input
                              type="password"
                              inputMode="numeric"
                              maxLength={4}
                              placeholder="•••"
                              value={cardData.cvv}
                              onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px] text-center"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Card details are encrypted end-to-end. We never store them.</span>
                        </p>
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
                        <p>{formData.city}, {formData.county}{formData.postalCode && ` ${formData.postalCode}`}</p>
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
                        <div>
                          <div className="flex items-center space-x-3 mb-4">
                            <svg className="w-10 h-7" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#1434CB" />
                              <path d="M17 10h14M17 16h14M17 22h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <svg className="w-10 h-7" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#EB001B" />
                              <circle cx="20" cy="16" r="8" fill="#FF5F00" />
                              <circle cx="28" cy="16" r="8" fill="#F79E1B" />
                            </svg>
                            <span className="text-[15px] md:text-[16px] font-bold">
                              {cardStage === 'form' ? 'Card via Flutterwave' : cardStage === 'pin' ? 'Enter Card PIN' : 'Enter OTP'}
                            </span>
                          </div>

                          {/* PIN stage */}
                          {cardStage === 'pin' && (
                            <div className="space-y-4">
                              <p className="text-[13px] text-gray-600">Your bank requires your card PIN to authorise this payment.</p>
                              <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="••••"
                                value={pinInput}
                                onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[20px] text-center tracking-[0.5em]"
                              />
                              <ButtonWithLoading
                                isLoading={isCardLoading}
                                onClick={handleSubmitPin}
                                className="w-full bg-[#6D4C91] text-white py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                              >
                                Submit PIN
                              </ButtonWithLoading>
                            </div>
                          )}

                          {/* OTP stage */}
                          {cardStage === 'otp' && (
                            <div className="space-y-4">
                              <p className="text-[13px] text-gray-600">An OTP has been sent to your registered phone number. Enter it below to complete payment.</p>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={8}
                                placeholder="Enter OTP"
                                value={otpInput}
                                onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[20px] text-center tracking-[0.5em]"
                              />
                              <ButtonWithLoading
                                isLoading={isCardLoading}
                                onClick={handleSubmitOtp}
                                className="w-full bg-[#6D4C91] text-white py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                              >
                                Confirm OTP
                              </ButtonWithLoading>
                            </div>
                          )}

                          {cardStage === 'form' && (
                            <p className="text-[12px] md:text-[13px] text-gray-500 flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Your card details are encrypted. You may be asked for your PIN or an OTP to complete the payment.</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hide back/pay buttons while PIN or OTP stage is active */}
                    {(paymentMethod === 'mpesa' || cardStage === 'form') && (
                      <div className="flex gap-3 md:gap-4">
                        <button
                          onClick={() => setStep(2)}
                          disabled={isLoading || awaitingPayment}
                          className="flex-1 py-4 md:py-5 rounded-full border border-gray-200 text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                          Back
                        </button>
                        <ButtonWithLoading
                          isLoading={paymentMethod === 'mpesa' ? isLoading : isCardLoading}
                          onClick={paymentMethod === 'mpesa' ? handleConfirmMpesaPayment : handleCardPayment}
                          className="flex-[2] bg-[#6D4C91] text-white py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all shadow-xl"
                        >
                          {paymentMethod === 'mpesa' ? 'Confirm Payment' : `Pay ${formatPrice(total)}`}
                        </ButtonWithLoading>
                      </div>
                    )}
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
