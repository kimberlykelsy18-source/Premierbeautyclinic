import { useState } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle2, MoreVertical, Plus, X, Search, MapPin, CreditCard, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const APPOINTMENTS = [
  { id: 1, service: 'Comprehensive Skin Analysis', customer: 'Mercy Njeri', date: 'Feb 19, 2026', time: '10:00 AM', status: 'Confirmed', deposit: 'Paid', practitioner: 'Dr. Sarah Kimani' },
  { id: 2, service: 'Dermatology Consultation', customer: 'John Mwangi', date: 'Feb 19, 2026', time: '11:30 AM', status: 'Confirmed', deposit: 'Paid', practitioner: 'Dr. Sarah Kimani' },
  { id: 3, service: 'Advanced Glow Facial', customer: 'Faith Atieno', date: 'Feb 20, 2026', time: '02:30 PM', status: 'Pending', deposit: 'Awaiting', practitioner: 'Esthetician Jane' },
  { id: 4, service: 'Virtual Skin Coach', customer: 'Kevin Ochieng', date: 'Feb 20, 2026', time: '04:00 PM', status: 'Confirmed', deposit: 'Paid', practitioner: 'Dr. Sarah Kimani' },
];

const SERVICES = [
  'Skin Analysis', 'Consultation', 'Facial Treatment', 'Chemical Peels', 'Microneedling', 'Virtual Skin Coach'
];

const PRACTITIONERS = [
  'Dr. Sarah Kimani', 'Dr. Michael Chen', 'Esthetician Jane', 'Nurse Mary'
];

export function DashboardAppointments() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const renderAddAppointmentForm = () => (
    <div className="space-y-8 max-h-[65vh] overflow-y-auto px-1">
      {activeStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Customer Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input placeholder="Search or enter name" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input placeholder="+254 XXX XXX XXX" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Client Notes / Concerns</label>
            <textarea rows={3} placeholder="Any specific skin concerns or medical history..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] resize-none" />
          </div>
        </motion.div>
      )}

      {activeStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Service Category *</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]">
                <option value="">Select Service</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Practitioner *</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]">
                <option value="">Assign Practitioner</option>
                {PRACTITIONERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Date *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Time *</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]">
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>01:00 PM</option>
                  <option>02:00 PM</option>
                  <option>03:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeStep === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Payment & Deposit</h3>
          <div className="space-y-6">
            <div className="p-6 bg-[#FDFBF7] rounded-[24px] border border-[#6D4C91]/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <CreditCard className="w-6 h-6 text-[#6D4C91]" />
                </div>
                <div>
                  <p className="font-bold text-[15px]">M-Pesa Express Deposit</p>
                  <p className="text-[13px] text-gray-500">KES 1,000 standard booking fee</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-[#6D4C91] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Custom Price Override (Optional)</label>
              <input type="number" placeholder="Total service cost" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[12px] text-green-700 font-medium">Automatic confirmation SMS will be sent once booking is finalized.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Service Bookings</h1>
          <p className="text-gray-500">Manage client appointments and clinic consultations.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span>New Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Today', value: '12', sub: '3 Pending' },
          { label: 'Tomorrow', value: '18', sub: '5 Pending' },
          { label: 'This Week', value: '64', sub: '+12% from last week' },
          { label: 'Capacity', value: '85%', sub: 'Optimized' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <h3 className="text-[32px] font-bold mb-1">{stat.value}</h3>
            <p className="text-[12px] text-[#6D4C91] font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {APPOINTMENTS.map((apt) => (
            <div key={apt.id} className="bg-[#FDFBF7] p-8 rounded-[32px] border border-gray-50 flex flex-col hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white rounded-2xl text-[#6D4C91]">
                  <Clock className="w-6 h-6" />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${apt.status === 'Confirmed' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {apt.status}
                </span>
              </div>
              <h4 className="text-[18px] font-bold mb-2 leading-tight">{apt.service}</h4>
              <div className="flex items-center text-gray-400 text-[14px] mb-2">
                <User className="w-4 h-4 mr-2" />
                <span>{apt.customer}</span>
              </div>
              <div className="flex items-center text-gray-400 text-[13px] mb-6">
                <MapPin className="w-3 h-3 mr-2" />
                <span>{apt.practitioner}</span>
              </div>
              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center text-[13px] mb-4">
                  <span className="font-medium text-gray-400">Time:</span>
                  <span className="font-bold">{apt.time}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] mb-8">
                  <span className="font-medium text-gray-400">Deposit:</span>
                  <span className={`font-bold ${apt.deposit === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>{apt.deposit}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-white border border-gray-200 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Reschedule</button>
                  <button className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all active:scale-95">Check In</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">New Appointment</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">Step {activeStep} of 3</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8">
                {renderAddAppointmentForm()}
              </div>

              <div className="p-8 bg-gray-50 flex justify-between items-center">
                <button 
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-30 transition-all"
                >
                  Back
                </button>
                <div className="flex space-x-4">
                  {activeStep < 3 ? (
                    <button 
                      onClick={() => setActiveStep(prev => prev + 1)}
                      className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsAddModalOpen(false)}
                      className="bg-green-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-green-700 active:scale-95 transition-all flex items-center shadow-lg"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      <span>Confirm Booking</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
