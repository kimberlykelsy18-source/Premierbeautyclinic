import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle2, Sparkles, ShieldCheck, Smartphone, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import mpesaLogo from '../../assets/mpesa.png';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router';
import { apiFetch } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
// Shape returned by GET /services
interface ApiService {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  deposit_percentage: number;
  duration_minutes: number;
  images: string[] | null;
  category: string | null;
  form_fields: any[] | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Map service category to an icon
function getCategoryIcon(category: string | null) {
  switch (category?.toLowerCase()) {
    case 'facial':       return <Sparkles className="w-6 h-6" />;
    case 'consultation': return <ShieldCheck className="w-6 h-6" />;
    case 'virtual':      return <User className="w-6 h-6" />;
    default:             return <Sparkles className="w-6 h-6" />;
  }
}

// Generate the next 6 clinic days (Mon–Sat, skip Sunday) starting from tomorrow
function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  let cursor = new Date(today);
  cursor.setDate(today.getDate() + 1); // start from tomorrow
  while (dates.length < 6) {
    if (cursor.getDay() !== 0) { // 0 = Sunday
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

// "Mon, Mar 3"
function formatDateLabel(d: Date): string {
  return d.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
}

// "Monday, 3 March 2026" — used in booking summary
function formatDateFull(d: Date): string {
  return d.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// Combine a Date object and a "09:00 AM" string into an ISO timestamp for the API
function buildAppointmentTime(date: Date, timeStr: string): string {
  const [time, meridiem] = timeStr.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  const dt = new Date(date);
  dt.setHours(hour, minute, 0, 0);
  return dt.toISOString();
}

// Normalize any Kenyan phone format to 254XXXXXXXXX for Daraja
function normalizeMpesaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
  return digits;
}

// ─── Static time slots ───────────────────────────────────────────────────────
// Real availability would need a separate API — for now these are fixed clinic hours
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '02:30 PM', '04:00 PM', '05:00 PM'];

// ─── Loading skeleton for service cards ──────────────────────────────────────
function ServiceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-xl md:rounded-2xl" />
            <div className="w-20 h-8 bg-gray-200 rounded" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function Book() {
  const { formatPrice, user, token, sessionId } = useStore();
  const navigate = useNavigate();

  // ── Multi-step state ──
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | null>(null);
  const [selectedTime, setSelectedTime]       = useState<string>('');
  const [isLoading, setIsLoading]                   = useState(false);
  const [awaitingPayment, setAwaitingPayment]       = useState(false);
  const [paymentMethod, setPaymentMethod]           = useState('mpesa');
  const [mpesaPhone, setMpesaPhone]                 = useState(user?.phone || '');
  const [isEditingMpesaPhone, setIsEditingMpesaPhone] = useState(false);

  // Pre-fill contact details from logged-in user
  const [formData, setFormData] = useState(() => ({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }));

  // ── Services from API ──
  const [services, setServices]             = useState<ApiService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // ── Booked slots for selected service + date ──
  const [bookedSlots, setBookedSlots]     = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading]   = useState(false);

  useEffect(() => {
    apiFetch('/services')
      .then((data: ApiService[]) => setServices(data))
      .catch(() => toast.error('Failed to load services. Please refresh.'))
      .finally(() => setLoadingServices(false));
  }, []);

  // Keep M-Pesa phone in sync with the contact phone field (unless user manually edited it)
  useEffect(() => {
    if (!isEditingMpesaPhone) setMpesaPhone(formData.phone);
  }, [formData.phone]);

  // Fetch booked slots whenever service or date changes
  useEffect(() => {
    if (!selectedService || !selectedDate) { setBookedSlots([]); return; }
    // Build YYYY-MM-DD using local date parts (avoids UTC-shift issues)
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0'),
    ].join('-');
    setSlotsLoading(true);
    apiFetch(`/services/${selectedService.id}/availability?date=${dateStr}`)
      .then((data: { bookedSlots: string[] }) => {
        setBookedSlots(data.bookedSlots || []);
        // Clear the chosen time if it just became unavailable
        if (selectedTime && (data.bookedSlots || []).includes(selectedTime)) setSelectedTime('');
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedService?.id, selectedDate?.toDateString()]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Available dates (dynamic) ──
  const availableDates = getAvailableDates();

  // ── Deposit amount ──
  // Calculated from the service's deposit_percentage, not a hardcoded value
  const deposit = selectedService
    ? Math.round(selectedService.base_price * (selectedService.deposit_percentage / 100))
    : 0;

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // ── Poll payment status ──
  // Same pattern as Checkout — checks every 3s until paid/failed/timeout
  const pollPaymentStatus = async (checkoutRequestId: string): Promise<'paid' | 'failed' | 'timeout'> => {
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const data = await apiFetch(`/payment/status/${checkoutRequestId}`, {}, token, sessionId);
        if (data.status === 'paid')   return 'paid';
        if (data.status === 'failed') return 'failed';
      } catch {
        // Network hiccup — keep trying
      }
    }
    return 'timeout';
  };

  // ── Book appointment ──
  const handleBooking = async () => {
    if (!user) {
      toast.error('Please log in to book an appointment.');
      navigate('/login');
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) return;

    if (!formData.name || !formData.phone) {
      toast.error('Please fill in your name and phone number.');
      return;
    }

    const phoneToUse = mpesaPhone || formData.phone;
    if (phoneToUse.replace(/\D/g, '').length < 9) {
      toast.error('Please enter a valid M-Pesa phone number.');
      return;
    }

    const normalizedPhone = normalizeMpesaPhone(phoneToUse);
    const appointmentTime = buildAppointmentTime(selectedDate, selectedTime);

    setIsLoading(true);

    try {
      // Step 1: Create appointment — backend triggers STK push if deposit > 0
      const data = await apiFetch('/appointments/book-mpesa', {
        method: 'POST',
        body: JSON.stringify({
          service_id:       selectedService.id,
          appointment_time: appointmentTime,
          phone:            normalizedPhone,
          form_responses:   {},
        }),
      }, token, sessionId);

      // ── No-deposit: confirmed immediately, no M-Pesa needed ──
      if (data.free) {
        toast.success('Appointment confirmed! Check your email for details.');
        setTimeout(() => navigate('/account'), 2500);
        return;
      }

      // ── Deposit required: STK push was sent by the backend ──
      const { checkout_request_id } = data;
      setAwaitingPayment(true);

      // Step 2: Poll until Safaricom's callback arrives (max 2 min)
      const result = await pollPaymentStatus(checkout_request_id);

      if (result === 'paid') {
        toast.success('Appointment confirmed! Check your email for details.');
        setTimeout(() => navigate('/account'), 2500);
        return;
      }

      if (result === 'failed') {
        toast.error('Payment was declined or cancelled. Please try again.');
      } else {
        toast.error('Payment timed out. If charged, contact us with your M-Pesa receipt.');
      }
      setAwaitingPayment(false);

    } catch (err: any) {
      toast.error(err.message || 'Booking failed. Please try again.');
      setAwaitingPayment(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-10 md:mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[12px] md:text-[14px] transition-all duration-300 ${step >= s ? 'bg-[#6D4C91] text-white' : 'bg-white text-gray-400 border-2 border-gray-200'}`}
            >
              {s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Service Selection ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8 md:mb-12">
                <h1 className="text-[26px] md:text-[36px] font-serif mb-2 md:mb-4 italic">Select a Service</h1>
                <p className="text-gray-500 text-[13px] md:text-[15px]">Choose the treatment or consultation that fits your needs.</p>
              </div>

              {loadingServices ? (
                <ServiceSkeleton />
              ) : services.length === 0 ? (
                <p className="text-center text-gray-400 py-16">No services available right now. Please check back later.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        nextStep();
                      }}
                      className={`text-left p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 transition-all group active:scale-95 ${selectedService?.id === service.id ? 'border-[#6D4C91] bg-white shadow-xl' : 'border-transparent bg-white/50 hover:bg-white hover:shadow-lg'}`}
                    >
                      <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div className="p-3 md:p-4 bg-[#FDFBF7] rounded-xl md:rounded-2xl group-hover:bg-[#6D4C91]/10 transition-colors text-[#6D4C91]">
                          {getCategoryIcon(service.category)}
                        </div>
                        <div className="text-right">
                          <p className="text-[16px] md:text-[18px] font-bold">{formatPrice(service.base_price)}</p>
                          <p className="text-[10px] md:text-[12px] text-gray-400">{service.duration_minutes} mins</p>
                        </div>
                      </div>
                      <h3 className="text-[16px] md:text-[20px] font-bold mb-2 md:mb-3">{service.name}</h3>
                      <p className="text-[12px] md:text-[14px] text-gray-500 leading-relaxed">{service.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Date & Time ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-[24px] md:text-[32px] font-serif mb-2 md:mb-4 italic">Schedule Your Visit</h2>
                <p className="text-gray-500 text-[13px] md:text-[15px]">Pick a convenient date and time for your {selectedService?.name}.</p>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-10">
                <div className="mb-8 md:mb-10">
                  <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-widest text-[#6D4C91] mb-4 md:mb-6 flex items-center">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Select Date
                  </h3>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {availableDates.map((date) => (
                      <button
                        key={date.toDateString()}
                        onClick={() => setSelectedDate(date)}
                        className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-bold transition-all active:scale-95 ${selectedDate?.toDateString() === date.toDateString() ? 'bg-[#6D4C91] text-white shadow-md' : 'bg-[#FDFBF7] hover:bg-gray-100'}`}
                      >
                        {formatDateLabel(date)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8 md:mb-10">
                  <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-widest text-[#6D4C91] mb-4 md:mb-6 flex items-center">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Select Time
                    {slotsLoading && <div className="ml-3 w-3.5 h-3.5 border-2 border-[#6D4C91] border-t-transparent rounded-full animate-spin" />}
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                    {TIME_SLOTS.map(time => {
                      const isBooked = bookedSlots.includes(time);
                      return (
                        <button
                          key={time}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                          title={isBooked ? 'This slot is already booked' : undefined}
                          className={`py-2.5 md:py-3 rounded-lg md:rounded-xl text-[11px] md:text-[13px] font-medium transition-all ${
                            isBooked
                              ? 'bg-gray-100 text-gray-300 line-through cursor-not-allowed'
                              : selectedTime === time
                                ? 'bg-[#6D4C91] text-white active:scale-95'
                                : 'bg-[#FDFBF7] hover:bg-gray-100 active:scale-95'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedDate && (
                    <p className="mt-3 text-[11px] text-gray-400 italic">Select a date first to see available times.</p>
                  )}
                </div>

                <div className="flex gap-3 md:gap-4">
                  <button onClick={prevStep} className="flex-1 py-3.5 md:py-5 rounded-full border border-gray-200 text-[12px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50 active:scale-95">Back</button>
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={nextStep}
                    className="flex-[2] py-3.5 md:py-5 rounded-full bg-[#1A1A1A] text-white text-[12px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] disabled:opacity-50 disabled:hover:bg-[#1A1A1A] transition-all active:scale-95"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Details & Payment ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-[24px] md:text-[32px] font-serif mb-2 md:mb-4 italic">Almost There!</h2>
                <p className="text-gray-500 text-[13px] md:text-[15px]">Provide your details to confirm the booking.</p>
              </div>

              {/* Auth gate — booking requires a logged-in account */}
              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-center">
                  <p className="text-[15px] font-bold text-amber-900 mb-2">Login Required</p>
                  <p className="text-[13px] text-amber-700 mb-4">You need an account to book an appointment so we can link it to your profile.</p>
                  <Link
                    to="/login"
                    className="inline-block bg-[#6D4C91] text-white px-8 py-3 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jane Doe"
                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all text-[14px] md:text-[15px]"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="jane.doe@example.com"
                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all text-[14px] md:text-[15px]"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number (M-Pesa)</label>
                      <input
                        type="tel"
                        placeholder="07XX XXX XXX"
                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all text-[14px] md:text-[15px]"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection — hidden while waiting for M-Pesa */}
                  {deposit > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                      <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-widest text-gray-400">Payment Method</h3>

                      {/* STK Push Sent banner — shown after booking is submitted */}
                      {awaitingPayment ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <Smartphone className="w-6 h-6 text-green-600 flex-shrink-0 animate-pulse mt-0.5" />
                            <div>
                              <p className="text-[14px] font-bold text-green-900 mb-1">STK Push Sent!</p>
                              <p className="text-[13px] text-green-700">
                                Check your phone <span className="font-bold">({mpesaPhone || formData.phone})</span> and enter your M-Pesa PIN to confirm your KES {deposit.toLocaleString()} deposit.
                              </p>
                              <div className="mt-3 flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                                <span className="text-[12px] text-green-600 font-medium">Waiting for payment confirmation...</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          {/* Method selector */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('mpesa')}
                              className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 flex items-center space-x-3 md:space-x-4 transition-all active:scale-95 ${paymentMethod === 'mpesa' ? 'border-[#6D4C91] bg-[#FDFBF7]' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                              <div className="bg-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-100">
                                <img src={mpesaLogo} alt="M-Pesa" className="h-5 md:h-7 w-auto" />
                              </div>
                              <div className="text-left flex-grow">
                                <p className="font-bold text-[12px] md:text-[14px]">M-Pesa</p>
                                <p className="text-[10px] md:text-[11px] text-gray-400">STK Push</p>
                              </div>
                              {paymentMethod === 'mpesa' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#6D4C91]" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod('card')}
                              className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 flex items-center space-x-3 md:space-x-4 transition-all active:scale-95 ${paymentMethod === 'card' ? 'border-[#6D4C91] bg-[#FDFBF7]' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                              <div className="flex items-center space-x-1 md:space-x-2 bg-gray-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                                <svg className="w-6 h-5 md:w-8 md:h-6" viewBox="0 0 48 32" fill="none">
                                  <rect width="48" height="32" rx="4" fill="#1434CB" />
                                  <path d="M17 10h14M17 16h14M17 22h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <svg className="w-6 h-5 md:w-8 md:h-6" viewBox="0 0 48 32" fill="none">
                                  <rect width="48" height="32" rx="4" fill="#EB001B" />
                                  <circle cx="20" cy="16" r="8" fill="#FF5F00" />
                                  <circle cx="28" cy="16" r="8" fill="#F79E1B" />
                                </svg>
                              </div>
                              <div className="text-left flex-grow">
                                <p className="font-bold text-[12px] md:text-[14px]">Card</p>
                                <p className="text-[10px] md:text-[11px] text-gray-400">Visa, Mastercard</p>
                              </div>
                              {paymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#6D4C91]" />}
                            </button>
                          </div>

                          {/* M-Pesa phone display — shown when M-Pesa is selected */}
                          {paymentMethod === 'mpesa' && (
                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                              <p className="text-[12px] md:text-[13px] text-gray-500 mb-3">
                                When you book, an STK push will be sent to:
                              </p>
                              <div className="bg-[#FDFBF7] p-3 md:p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                                {isEditingMpesaPhone ? (
                                  <input
                                    type="tel"
                                    value={mpesaPhone}
                                    onChange={(e) => setMpesaPhone(e.target.value)}
                                    placeholder="07XX XXX XXX"
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 outline-none focus:border-[#6D4C91] text-[14px] md:text-[15px]"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-[15px] md:text-[17px] font-bold">{mpesaPhone || formData.phone || '—'}</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isEditingMpesaPhone) {
                                      setIsEditingMpesaPhone(false);
                                    } else {
                                      if (!mpesaPhone) setMpesaPhone(formData.phone);
                                      setIsEditingMpesaPhone(true);
                                    }
                                  }}
                                  className="ml-3 p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                >
                                  {isEditingMpesaPhone
                                    ? <Check className="w-4 h-4 text-green-600" />
                                    : <Edit2 className="w-4 h-4 text-gray-500" />
                                  }
                                </button>
                              </div>
                              <p className="text-[10px] md:text-[11px] text-gray-400 mt-2 italic">
                                Keep your phone nearby to enter your M-Pesa PIN when prompted.
                              </p>
                            </motion.div>
                          )}

                          {/* Card fields */}
                          {paymentMethod === 'card' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-100">
                              <div>
                                <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Card Number</label>
                                <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border border-transparent focus:border-blue-500 outline-none transition-all text-[13px] md:text-[14px]" />
                              </div>
                              <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div>
                                  <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Expiry</label>
                                  <input type="text" placeholder="MM/YY" maxLength={5} className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border border-transparent focus:border-blue-500 outline-none transition-all text-[13px] md:text-[14px]" />
                                </div>
                                <div>
                                  <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">CVV</label>
                                  <input type="text" placeholder="123" maxLength={3} className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border border-transparent focus:border-blue-500 outline-none transition-all text-[13px] md:text-[14px]" />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 md:space-x-3 p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100">
                                <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
                                <p className="text-[10px] md:text-[11px] text-blue-700 font-medium">Secure payment. Your card data is encrypted.</p>
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Booking Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 sticky top-[120px] md:top-[160px]">
                    <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-widest mb-4 md:mb-6">Booking Summary</h3>
                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                      <div className="flex justify-between text-[12px] md:text-[14px]">
                        <span className="text-gray-400">Service:</span>
                        <span className="font-bold text-right max-w-[60%]">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between text-[12px] md:text-[14px]">
                        <span className="text-gray-400">Date:</span>
                        <span className="font-bold text-right">{selectedDate ? formatDateLabel(selectedDate) : '—'}</span>
                      </div>
                      <div className="flex justify-between text-[12px] md:text-[14px]">
                        <span className="text-gray-400">Time:</span>
                        <span className="font-bold">{selectedTime}</span>
                      </div>
                      <div className="pt-3 md:pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[14px] md:text-[16px] font-bold">Total Fee:</span>
                        <span className="text-[16px] md:text-[18px] font-bold text-[#6D4C91]">{formatPrice(selectedService?.base_price || 0)}</span>
                      </div>
                      <div className="bg-[#FDFBF7] p-3 md:p-4 rounded-xl md:rounded-2xl">
                        {deposit > 0 ? (
                          <>
                            <p className="text-[10px] md:text-[11px] text-[#6D4C91] font-bold uppercase tracking-widest mb-1">
                              Deposit Required ({selectedService?.deposit_percentage ?? 0}%)
                            </p>
                            <p className="text-[11px] md:text-[13px] text-gray-600">
                              Pay {formatPrice(deposit)} now via M-Pesa to secure your slot. Balance of {formatPrice((selectedService?.base_price || 0) - deposit)} paid at the clinic.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[10px] md:text-[11px] text-green-700 font-bold uppercase tracking-widest mb-1">
                              No Deposit Required
                            </p>
                            <p className="text-[11px] md:text-[13px] text-gray-600">
                              Full payment of {formatPrice(selectedService?.base_price || 0)} is collected at the clinic. Book your slot instantly.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={!formData.name || !formData.phone || isLoading || !user}
                      className="w-full bg-[#6D4C91] text-white py-3.5 md:py-5 rounded-full text-[12px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] shadow-lg transition-all disabled:opacity-50 active:scale-95"
                    >
                      {awaitingPayment
                        ? 'Waiting for payment...'
                        : isLoading
                          ? 'Booking...'
                          : deposit > 0
                            ? `Book & Pay ${formatPrice(deposit)}`
                            : 'Confirm Booking'
                      }
                    </button>
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isLoading || awaitingPayment}
                      className="w-full mt-3 md:mt-4 text-center text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] disabled:opacity-50"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
