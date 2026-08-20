import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Check, Home, CalendarCheck, ClipboardList, AlertCircle, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { apiFetch } from '../lib/api';
import { Seo } from '../lib/seo';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormField {
  name: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'textarea' | 'radio' | 'date';
  options?: string[];
  required: boolean;
}

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
  form_fields: FormField[] | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  let cursor = new Date(today);
  cursor.setDate(today.getDate() + 1);
  while (dates.length < 6) {
    if (cursor.getDay() !== 0) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

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

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '02:30 PM', '04:00 PM', '05:00 PM'];

// Same threshold used on the Treatments page: priced services show their fee up front;
// higher-value programs (and anything with no set price yet) are "priced at consultation".
const SERVICE_PRICE_CEILING = 20000;

// ─── Intake Form Field Renderer ───────────────────────────────────────────────
function IntakeField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: any;
  onChange: (v: any) => void;
}) {
  const base = 'w-full px-4 py-3 rounded-xl bg-[#F2F1F8] border-2 border-transparent focus:border-[#6D4C91] outline-none text-[14px] transition-colors';

  if (field.type === 'select') return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} className={base}>
      <option value="">Select an option…</option>
      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  if (field.type === 'multiselect') {
    const checked: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {field.options?.map(opt => {
          const selected = checked.includes(opt);
          return (
            <label
              key={opt}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${selected ? 'bg-[#6D4C91]/10 border-[#6D4C91]' : 'bg-[#F2F1F8] border-transparent hover:border-gray-200'}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selected}
                onChange={e => onChange(e.target.checked ? [...checked, opt] : checked.filter(v => v !== opt))}
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'bg-[#6D4C91] border-[#6D4C91]' : 'border-gray-300'}`}>
                {selected && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-[13px] font-medium">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (field.type === 'radio') return (
    <div className="flex flex-wrap gap-2">
      {field.options?.map(opt => (
        <label
          key={opt}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-all border-2 text-[13px] font-medium ${value === opt ? 'bg-[#6D4C91] text-white border-[#6D4C91]' : 'bg-white border-gray-200 hover:border-[#6D4C91]'}`}
        >
          <input type="radio" className="hidden" checked={value === opt} onChange={() => onChange(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );

  if (field.type === 'textarea') return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      rows={3}
      className={`${base} resize-none`}
      placeholder="Type your answer…"
    />
  );

  if (field.type === 'date') return (
    <input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className={base} />
  );

  return (
    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className={base} placeholder="Type your answer…" />
  );
}

// ─── Service skeleton ─────────────────────────────────────────────────────────
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
  const [searchParams] = useSearchParams();

  // ── Internal step: 1=Service, 2=Intake Form, 3=Schedule, 4=Details & Pay
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | null>(null);
  const [selectedTime, setSelectedTime]       = useState<string>('');
  const [intakeResponses, setIntakeResponses] = useState<Record<string, any>>({});

  const [isLoading, setIsLoading]                 = useState(false);
  const [whatsappUrl, setWhatsappUrl]             = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation]   = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState(() => ({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }));

  const [services, setServices]               = useState<ApiService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [bookedSlots, setBookedSlots]         = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading]       = useState(false);
  const [customRequest, setCustomRequest]     = useState('');

  useEffect(() => {
    const preselect = searchParams.get('service');
    apiFetch('/services')
      .then((data: ApiService[]) => {
        setServices(data);
        if (preselect) {
          const found = data.find((s: ApiService) => String(s.id) === preselect);
          if (found) {
            setSelectedService(found);
            setStep((found.form_fields?.length ?? 0) > 0 ? 2 : 3);
          }
        }
      })
      .catch(() => toast.error('Failed to load services. Please refresh.'))
      .finally(() => setLoadingServices(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedService || !selectedDate) { setBookedSlots([]); return; }
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0'),
    ].join('-');
    setSlotsLoading(true);
    apiFetch(`/services/${selectedService.id}/availability?date=${dateStr}`)
      .then((data: { bookedSlots: string[] }) => {
        setBookedSlots(data.bookedSlots || []);
        if (selectedTime && (data.bookedSlots || []).includes(selectedTime)) setSelectedTime('');
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedService?.id, selectedDate?.toDateString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableDates = getAvailableDates();

  // No online payment happens anymore, so there's nothing left to disclose an
  // amount for before charging — price can stay hidden all the way through for
  // consult-priced services, matching the WhatsApp message and Step 1's lanes.
  const hidePrice = !(selectedService && selectedService.base_price > 0 && selectedService.base_price <= SERVICE_PRICE_CEILING);

  // Services with form_fields populated require an intake step
  const hasIntakeForm = (selectedService?.form_fields?.length ?? 0) > 0;

  // Map internal step (1-4) to display steps, skipping 2 when no form
  const visibleSteps = hasIntakeForm ? [1, 2, 3, 4] : [1, 3, 4];
  const displayStep  = visibleSteps.indexOf(step) + 1;
  const totalSteps   = visibleSteps.length;

  const nextStep = () => {
    if (step === 1 && !hasIntakeForm) { setStep(3); return; }
    setStep(s => s + 1);
  };
  const prevStep = () => {
    if (step === 3 && !hasIntakeForm) { setStep(1); return; }
    setStep(s => s - 1);
  };

  // Selecting a service from step 1 must decide the next step from that service's own
  // form_fields, not the `hasIntakeForm` closure above — that constant is computed from
  // the *previous* render's selectedService, so calling nextStep() right after
  // setSelectedService() here would read stale state and skip the intake form on first pick.
  const selectService = (service: ApiService) => {
    setSelectedService(service);
    setIntakeResponses({});
    setStep((service.form_fields?.length ?? 0) > 0 ? 2 : 3);
  };

  const handleCustomRequest = () => {
    const text = customRequest.trim();
    if (!text) { toast.error("Please describe what you're looking for."); return; }
    const consultService =
      services.find(s => s.name === 'Dermatologist Consultation') ||
      services.find(s => s.category === 'Imaging & Consultation');
    if (!consultService) { toast.error('Consultation booking is unavailable right now. Please try again later.'); return; }
    setSelectedService(consultService);
    setIntakeResponses({ _custom_request: text });
    setStep((consultService.form_fields?.length ?? 0) > 0 ? 2 : 3);
  };

  const validateIntakeForm = (): boolean => {
    if (!selectedService?.form_fields) return true;
    for (const field of selectedService.form_fields) {
      if (!field.required) continue;
      const val = intakeResponses[field.name];
      if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
        toast.error(`Please answer: "${field.label}"`);
        return false;
      }
    }
    return true;
  };

  const updateIntake = (name: string, value: any) => {
    setIntakeResponses(prev => ({ ...prev, [name]: value }));
  };

  // M-Pesa/card booking is on hold — this hands off to WhatsApp instead. The
  // appointment is created as 'pending' first (visible to staff immediately),
  // then a pre-filled wa.me link opens. The blank tab is opened synchronously,
  // before the await, so the click's user-activation survives the async gap —
  // opening it after the await is what popup blockers tend to kill.
  const handleWhatsAppBooking = async () => {
    if (!user) { toast.error('Please log in to book an appointment.'); navigate('/login'); return; }
    if (!selectedService || !selectedDate || !selectedTime) return;
    if (!formData.name || !formData.phone) { toast.error('Please fill in your name and phone number.'); return; }

    const appointmentTime = buildAppointmentTime(selectedDate, selectedTime);

    setIsLoading(true);
    const tab = window.open('', '_blank');
    try {
      const data = await apiFetch('/appointments/book-whatsapp', {
        method: 'POST',
        body: JSON.stringify({
          service_id:       selectedService.id,
          appointment_time: appointmentTime,
          phone:            formData.phone,
          form_responses:   intakeResponses,
        }),
      }, token, sessionId);

      setWhatsappUrl(data.whatsapp_url);
      if (tab) tab.location.href = data.whatsapp_url;
      else window.open(data.whatsapp_url, '_blank');

      setShowConfirmation(true);
      redirectTimerRef.current = setTimeout(() => navigate('/'), 6000);
    } catch (err: any) {
      if (tab) tab.close();
      toast.error(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24 bg-[#F2F1F8] min-h-screen">
      <Seo
        title="Book a Treatment"
        description="Book a facial, dermaplaning, LED therapy, or skin consultation at Premier Beauty Clinic — Kilimani, Nairobi, Kenya. Fast, easy online booking."
        path="/book"
      />
      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* ── Dynamic Progress Stepper ── */}
        <div className="flex justify-between items-center mb-10 md:mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-300 ${displayStep >= s ? 'bg-[#6D4C91] text-white' : 'bg-white text-gray-400 border-2 border-gray-200'}`}
            >
              {s}
            </div>
          ))}
        </div>

        <div className="overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Service Selection ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8 md:mb-12">
                <h1 className="text-[26px] md:text-[36px] font-serif mb-2 md:mb-4 italic">What Are You Looking For?</h1>
                <p className="text-gray-500 text-sm md:text-base">Choose a treatment, browse our advanced programs, or tell us what's going on.</p>
              </div>

              {loadingServices ? (
                <ServiceSkeleton />
              ) : services.length === 0 ? (
                <p className="text-center text-gray-400 py-16">No services available right now. Please check back later.</p>
              ) : (
                (() => {
                  const pricedServices   = services.filter(s => s.base_price > 0 && s.base_price <= SERVICE_PRICE_CEILING);
                  const consultServices  = services.filter(s => s.base_price === 0 || s.base_price > SERVICE_PRICE_CEILING);
                  const categories       = [...new Set(pricedServices.map(s => s.category || 'Other'))];
                  const consultCategories = [...new Set(consultServices.map(s => s.category || 'Other'))];

                  return (
                    <div className="space-y-10 md:space-y-14">

                      {/* ── Lane 1: priced services ── */}
                      {pricedServices.length > 0 && (
                        <div className="space-y-8">
                          {categories.map(cat => (
                            <div key={cat}>
                              <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#6D4C91] mb-4">{cat}</h2>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                                {pricedServices.filter(s => (s.category || 'Other') === cat).map((service) => (
                                  <button
                                    key={service.id}
                                    onClick={() => selectService(service)}
                                    className={`text-left p-4 md:p-5 rounded-2xl border-2 transition-all group active:scale-95 flex flex-col ${selectedService?.id === service.id ? 'border-[#6D4C91] bg-white shadow-xl' : 'border-transparent bg-white/50 hover:bg-white hover:shadow-lg'}`}
                                  >
                                    {(service.form_fields?.length ?? 0) > 0 && (
                                      <div className="flex justify-end mb-2">
                                        <ClipboardList className="w-3.5 h-3.5 text-[#6D4C91]" aria-label="Intake form required" />
                                      </div>
                                    )}
                                    <h3 className="text-[14px] font-bold mb-1.5 leading-snug line-clamp-2">{service.name}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2 flex-1">{service.description}</p>
                                    <div className="flex items-center justify-between pt-2 border-t border-black/5">
                                      <p className="text-[14px] font-bold">{formatPrice(service.base_price)}</p>
                                      <p className="text-[11px] text-gray-400">{service.duration_minutes} min</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Lane 2: advanced programs, priced at consultation ── */}
                      {consultServices.length > 0 && (
                        <div>
                          <div className="mb-4">
                            <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#6D4C91]">Advanced Programs</h2>
                            <p className="text-xs text-gray-400 mt-1">Higher-value programs, priced at your consultation once we understand your goals.</p>
                          </div>
                          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 space-y-7">
                            {consultCategories.map(cat => (
                              <div key={cat}>
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">{cat}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 divide-y divide-gray-100 md:divide-y-0">
                                  {consultServices.filter(s => (s.category || 'Other') === cat).map(service => (
                                    <button
                                      key={service.id}
                                      onClick={() => selectService(service)}
                                      className="group w-full flex items-center justify-between gap-4 py-3.5 text-left"
                                    >
                                      <div className="min-w-0">
                                        <p className="font-bold text-sm group-hover:text-[#6D4C91] transition-colors truncate">{service.name}</p>
                                        <p className="text-[11px] text-[#6D4C91]/80 font-semibold uppercase tracking-widest mt-0.5">Priced at Consultation</p>
                                      </div>
                                      <span className="shrink-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center group-hover:bg-[#6D4C91] group-hover:text-white group-hover:border-[#6D4C91] transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Lane 3: something else — free-text, resolved at consultation ── */}
                      <div className="bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-10 text-white">
                        <div className="flex items-start gap-4 mb-5">
                          <div className="p-3 bg-white/10 rounded-xl md:rounded-2xl text-[#8B5CF6] shrink-0">
                            <HelpCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-[18px] md:text-[20px] font-bold mb-1">Not Sure What You Need?</h2>
                            <p className="text-white/60 text-xs md:text-sm">Tell us what's going on and we'll recommend the right treatment during your consultation.</p>
                          </div>
                        </div>
                        <textarea
                          value={customRequest}
                          onChange={e => setCustomRequest(e.target.value)}
                          rows={3}
                          placeholder="e.g. I've had breakouts along my jawline for a few months and nothing I try seems to help…"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 focus:border-[#8B5CF6] outline-none text-[14px] text-white placeholder:text-white/30 transition-colors resize-none"
                        />
                        <button
                          onClick={handleCustomRequest}
                          className="mt-4 inline-flex items-center bg-[#6D4C91] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#5c3f80] transition-colors"
                        >
                          Continue to Consultation
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>

                    </div>
                  );
                })()
              )}
            </motion.div>
          )}

          {/* ── Step 2: Intake Form (only when service has form_fields) ── */}
          {step === 2 && selectedService && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8 md:mb-10">
                <div className="inline-flex items-center gap-2 bg-[#6D4C91]/10 text-[#6D4C91] px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest mb-4">
                  <ClipboardList className="w-4 h-4" /> Pre-Treatment Intake Form
                </div>
                <h2 className="text-[24px] md:text-[32px] font-serif mb-2 md:mb-3 italic">{selectedService.name}</h2>
                <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
                  To ensure we provide the safest and most effective treatment, please answer the following questions before booking.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3 mb-6 md:mb-8">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-800">Your responses are confidential and shared only with your treating practitioner. Fields marked <span className="text-red-500 font-bold">*</span> are required.</p>
              </div>

              {intakeResponses._custom_request !== undefined && (
                <div className="bg-[#6D4C91]/5 border border-[#6D4C91]/15 rounded-2xl p-5 md:p-6 mb-6 md:mb-8">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-3">What you told us</label>
                  <textarea
                    value={intakeResponses._custom_request}
                    onChange={e => updateIntake('_custom_request', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-transparent focus:border-[#6D4C91] outline-none text-[14px] transition-colors resize-none"
                  />
                </div>
              )}

              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
                <div className="space-y-7">
                  {selectedService.form_fields?.map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <IntakeField
                        field={field}
                        value={intakeResponses[field.name]}
                        onChange={(v) => updateIntake(field.name, v)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 md:gap-4 mt-10">
                  <button onClick={prevStep} className="flex-1 py-3.5 md:py-5 rounded-full border border-gray-200 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-gray-50 active:scale-95">
                    Back
                  </button>
                  <button
                    onClick={() => { if (validateIntakeForm()) nextStep(); }}
                    className="flex-[2] py-3.5 md:py-5 rounded-full bg-[#1A1A1A] text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all active:scale-95"
                  >
                    Continue to Scheduling
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Date & Time ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-[24px] md:text-[32px] font-serif mb-2 md:mb-4 italic">Schedule Your Visit</h2>
                <p className="text-gray-500 text-sm md:text-base">Pick a convenient date and time for your {selectedService?.name}.</p>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-10">
                <div className="mb-8 md:mb-10">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#6D4C91] mb-4 md:mb-6 flex items-center">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Select Date
                  </h3>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {availableDates.map((date) => (
                      <button
                        key={date.toDateString()}
                        onClick={() => setSelectedDate(date)}
                        className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all active:scale-95 ${selectedDate?.toDateString() === date.toDateString() ? 'bg-[#6D4C91] text-white shadow-md' : 'bg-[#FDFBF7] hover:bg-gray-100'}`}
                      >
                        {formatDateLabel(date)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8 md:mb-10">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#6D4C91] mb-4 md:mb-6 flex items-center">
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
                          className={`py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
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
                  <button onClick={prevStep} className="flex-1 py-3.5 md:py-5 rounded-full border border-gray-200 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-gray-50 active:scale-95">Back</button>
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={nextStep}
                    className="flex-[2] py-3.5 md:py-5 rounded-full bg-[#1A1A1A] text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[#6D4C91] disabled:opacity-50 disabled:hover:bg-[#1A1A1A] transition-all active:scale-95"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Details & Payment ── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-[24px] md:text-[32px] font-serif mb-2 md:mb-4 italic">Almost There!</h2>
                <p className="text-gray-500 text-sm md:text-base">Provide your details to confirm the booking.</p>
              </div>

              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-center">
                  <p className="text-[15px] font-bold text-amber-900 mb-2">Login Required</p>
                  <p className="text-[13px] text-amber-700 mb-4">You need an account to book an appointment so we can link it to your profile.</p>
                  <Link to="/login" className="inline-block bg-[#6D4C91] text-white px-8 py-3 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all">
                    Login / Sign Up
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                      <input type="text" placeholder="e.g. Jane Doe" className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all text-sm md:text-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                      <input type="email" placeholder="jane.doe@example.com" className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all text-sm md:text-base" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                      <input type="tel" placeholder="07XX XXX XXX" className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#FDFBF7] border-transparent focus:border-[#6D4C91] outline-none transition-all text-sm md:text-base" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Booking Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 sticky top-[120px] md:top-[160px]">
                    <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest mb-4 md:mb-6">Booking Summary</h3>
                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                      <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-400">Service:</span><span className="font-bold text-right max-w-[60%]">{selectedService?.name}</span></div>
                      <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-400">Date:</span><span className="font-bold text-right">{selectedDate ? formatDateLabel(selectedDate) : '—'}</span></div>
                      <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-400">Time:</span><span className="font-bold">{selectedTime}</span></div>
                      <div className="pt-3 md:pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[14px] md:text-[16px] font-bold">{hidePrice ? 'Pricing:' : 'Price:'}</span>
                        <span className={`font-bold text-[#6D4C91] ${hidePrice ? 'text-[13px] md:text-[14px] text-right' : 'text-[16px] md:text-[18px]'}`}>
                          {hidePrice ? 'To be confirmed at consultation' : formatPrice(selectedService?.base_price || 0)}
                        </span>
                      </div>
                      <div className="bg-[#FDFBF7] p-3 md:p-4 rounded-xl md:rounded-2xl">
                        <p className="text-xs text-[#6D4C91] font-bold uppercase tracking-widest mb-1">No Online Payment</p>
                        <p className="text-xs md:text-sm text-gray-600">We'll confirm your booking and payment over WhatsApp — no charge happens here.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleWhatsAppBooking}
                      disabled={!formData.name || !formData.phone || isLoading || !user}
                      className="w-full bg-[#6D4C91] text-white py-3.5 md:py-5 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[#5a3e79] shadow-lg transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isLoading ? 'Booking...' : 'Confirm via WhatsApp'}
                    </button>
                    <button type="button" onClick={prevStep} disabled={isLoading} className="w-full mt-3 md:mt-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] disabled:opacity-50">
                      Go Back
                    </button>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-3 text-center text-[11px] font-bold text-[#6D4C91] hover:underline"
                      >
                        Didn't open? Tap here to open WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* ── Booking Confirmation Popup ── */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="bg-white rounded-[32px] p-8 md:p-12 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', damping: 15, stiffness: 300 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarCheck className="w-10 h-10 text-green-600" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-[26px] md:text-[30px] font-serif italic mb-3">Request Sent!</h2>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-2">Your request for <span className="font-bold text-[#1A1A1A]">{selectedService?.name}</span> has been received.</p>
                {selectedDate && selectedTime && (
                  <div className="flex items-center justify-center space-x-4 my-5 bg-[#F2F1F8] rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-[13px] font-medium"><Calendar className="w-4 h-4 text-[#6D4C91]" /><span>{formatDateLabel(selectedDate)}</span></div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center space-x-2 text-[13px] font-medium"><Clock className="w-4 h-4 text-[#6D4C91]" /><span>{selectedTime}</span></div>
                  </div>
                )}
                <p className="text-gray-400 text-[12px] mb-8">We've opened WhatsApp with your booking details — send the message to confirm with our team. You will be redirected to the home page shortly.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => { if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current); navigate('/account'); }} className="flex-1 py-3.5 rounded-full border-2 border-[#6D4C91] text-[#6D4C91] text-[13px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] hover:text-white transition-all">My Appointments</button>
                  <button onClick={() => { if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current); navigate('/'); }} className="flex-1 py-3.5 rounded-full bg-[#1A1A1A] text-white text-[13px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all flex items-center justify-center space-x-2"><Home className="w-4 h-4" /><span>Go Home</span></button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
