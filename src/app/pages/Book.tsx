import { useState } from 'react';
import { Calendar, Clock, User, ClipboardCheck, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import mpesaLogo from 'figma:asset/3a3966f7b64f454c098d92c9bd69154ee90678bd.png';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router';

const SERVICES = [
  { id: 's1', name: 'Comprehensive Skin Analysis', price: 2500, duration: '45 mins', description: 'A deep dive into your skin using professional diagnostic tools to identify underlying concerns.', icon: <Sparkles className="w-6 h-6" /> },
  { id: 's2', name: 'Dermatology Consultation', price: 3500, duration: '30 mins', description: 'Professional medical advice for persistent skin conditions like acne, eczema, or rosacea.', icon: <ShieldCheck className="w-6 h-6" /> },
  { id: 's3', name: 'Advanced Glow Facial', price: 7500, duration: '90 mins', description: 'Our signature clinical facial treatment for immediate radiance and long-term skin health.', icon: <CheckCircle2 className="w-6 h-6" /> },
  { id: 's4', name: 'Virtual Skin Coach', price: 1500, duration: '20 mins', description: 'Online session to review your current routine and suggest product adjustments.', icon: <User className="w-6 h-6" /> },
];

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '02:30 PM', '04:00 PM', '05:00 PM'];

export function Book() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const { formatPrice } = useStore();
  const navigate = useNavigate();

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleBooking = () => {
    toast.success('Booking initiated! Redirecting to payment...');
    // In a real app, this would call the API and redirect to Mpesa STK Push
  };

  return (
    <div className="pt-[140px] pb-24 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] transition-all duration-300 ${step >= s ? 'bg-[#6D4C91] text-white' : 'bg-white text-gray-400 border-2 border-gray-200'}`}
            >
              {s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-[36px] font-serif mb-4 italic">Select a Service</h1>
                <p className="text-gray-500">Choose the treatment or consultation that fits your needs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SERVICES.map((service) => (
                  <button 
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      nextStep();
                    }}
                    className={`text-left p-8 rounded-3xl border-2 transition-all group ${selectedService?.id === service.id ? 'border-[#6D4C91] bg-white shadow-xl' : 'border-transparent bg-white/50 hover:bg-white hover:shadow-lg'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-[#FDFBF7] rounded-2xl group-hover:bg-[#6D4C91]/10 transition-colors text-[#6D4C91]">
                        {service.icon}
                      </div>
                      <div className="text-right">
                        <p className="text-[18px] font-bold">{formatPrice(service.price)}</p>
                        <p className="text-[12px] text-gray-400">{service.duration}</p>
                      </div>
                    </div>
                    <h3 className="text-[20px] font-bold mb-3">{service.name}</h3>
                    <p className="text-[14px] text-gray-500 leading-relaxed">{service.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-[32px] font-serif mb-4 italic">Schedule Your Visit</h2>
                <p className="text-gray-500">Pick a convenient date and time for your {selectedService?.name}.</p>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <div className="mb-10">
                  <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#6D4C91] mb-6 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" /> Select Date
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                    {['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23', 'Sat 24', 'Sun 25'].map(date => (
                      <button 
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`py-4 rounded-2xl text-[13px] font-bold transition-all ${selectedDate === date ? 'bg-[#6D4C91] text-white shadow-md' : 'bg-[#FDFBF7] hover:bg-gray-100'}`}
                      >
                        {date.split(' ')[0]}<br />{date.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#6D4C91] mb-6 flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> Select Time
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TIME_SLOTS.map(time => (
                      <button 
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-xl text-[13px] font-medium transition-all ${selectedTime === time ? 'bg-[#6D4C91] text-white' : 'bg-[#FDFBF7] hover:bg-gray-100'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-5 rounded-full border border-gray-200 text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50">Back</button>
                  <button 
                    disabled={!selectedDate || !selectedTime}
                    onClick={nextStep} 
                    className="flex-[2] py-5 rounded-full bg-[#1A1A1A] text-white text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] disabled:opacity-50 disabled:hover:bg-[#1A1A1A] transition-all"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-[32px] font-serif mb-4 italic">Almost There!</h2>
                <p className="text-gray-500">Provide your details to confirm the booking.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Jane Doe"
                        className="w-full px-6 py-4 rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="jane.doe@example.com"
                        className="w-full px-6 py-4 rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number (M-Pesa)</label>
                      <input 
                        type="tel" 
                        placeholder="07XX XXX XXX"
                        className="w-full px-6 py-4 rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-[14px] font-bold uppercase tracking-widest text-gray-400 mb-4">Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`p-6 rounded-2xl border-2 flex items-center space-x-4 transition-all ${paymentMethod === 'mpesa' ? 'border-[#6D4C91] bg-[#FDFBF7]' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-100">
                          <img src={mpesaLogo} alt="M-Pesa" className="h-7 w-auto" />
                        </div>
                        <div className="text-left flex-grow">
                          <p className="font-bold text-[14px]">M-Pesa</p>
                          <p className="text-[11px] text-gray-400">STK Push</p>
                        </div>
                        {paymentMethod === 'mpesa' && <CheckCircle2 className="w-5 h-5 text-[#6D4C91]" />}
                      </button>

                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-6 rounded-2xl border-2 flex items-center space-x-4 transition-all ${paymentMethod === 'card' ? 'border-[#6D4C91] bg-[#FDFBF7]' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <svg className="w-8 h-6" viewBox="0 0 48 32" fill="none">
                            <rect width="48" height="32" rx="4" fill="#1434CB" />
                            <path d="M17 10h14M17 16h14M17 22h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <svg className="w-8 h-6" viewBox="0 0 48 32" fill="none">
                            <rect width="48" height="32" rx="4" fill="#EB001B" />
                            <circle cx="20" cy="16" r="8" fill="#FF5F00" />
                            <circle cx="28" cy="16" r="8" fill="#F79E1B" />
                          </svg>
                        </div>
                        <div className="text-left flex-grow">
                          <p className="font-bold text-[14px]">Card</p>
                          <p className="text-[11px] text-gray-400">Visa, Mastercard</p>
                        </div>
                        {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-[#6D4C91]" />}
                      </button>
                    </div>

                    {paymentMethod === 'card' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-gray-100">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Card Number</label>
                          <input 
                            type="text" 
                            placeholder="1234 5678 9012 3456" 
                            maxLength={19}
                            className="w-full px-6 py-4 rounded-2xl bg-[#FDFBF7] border border-transparent focus:border-blue-500 outline-none transition-all" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Expiry</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              maxLength={5}
                              className="w-full px-6 py-4 rounded-2xl bg-[#FDFBF7] border border-transparent focus:border-blue-500 outline-none transition-all" 
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">CVV</label>
                            <input 
                              type="text" 
                              placeholder="123" 
                              maxLength={3}
                              className="w-full px-6 py-4 rounded-2xl bg-[#FDFBF7] border border-transparent focus:border-blue-500 outline-none transition-all" 
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <p className="text-[11px] text-blue-700 font-medium">Secure payment. Your card data is encrypted.</p>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'mpesa' && formData.phone && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center space-x-3">
                        <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                          <path d="M12 24L20 32L36 16" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="2"/>
                        </svg>
                        <div>
                          <p className="text-[12px] font-bold text-green-800">M-Pesa Ready</p>
                          <p className="text-[11px] text-green-700">STK push will be sent to {formData.phone}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-[160px]">
                    <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6">Booking Summary</h3>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-[14px]">
                        <span className="text-gray-400">Service:</span>
                        <span className="font-bold text-right">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between text-[14px]">
                        <span className="text-gray-400">Date:</span>
                        <span className="font-bold">{selectedDate}, 2026</span>
                      </div>
                      <div className="flex justify-between text-[14px]">
                        <span className="text-gray-400">Time:</span>
                        <span className="font-bold">{selectedTime}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[16px] font-bold">Total Fee:</span>
                        <span className="text-[18px] font-bold text-[#6D4C91]">{formatPrice(selectedService?.price || 0)}</span>
                      </div>
                      <div className="bg-[#FDFBF7] p-4 rounded-2xl">
                        <p className="text-[11px] text-[#6D4C91] font-bold uppercase tracking-widest mb-1">Deposit Required</p>
                        <p className="text-[13px] text-gray-600">Pay {formatPrice(1000)} now via M-Pesa to secure your slot. Balance to be paid at the clinic.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleBooking}
                      disabled={!formData.name || !formData.phone}
                      className="w-full bg-[#6D4C91] text-white py-5 rounded-full text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] shadow-lg transition-all disabled:opacity-50"
                    >
                      Book & Pay {formatPrice(1000)}
                    </button>
                    <button onClick={prevStep} className="w-full mt-4 text-center text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A]">Go Back</button>
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