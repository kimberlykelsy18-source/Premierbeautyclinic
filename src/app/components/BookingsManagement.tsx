import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Clock, X } from 'lucide-react';
import { ButtonWithLoading } from './Loading';

interface BookingsManagementProps {
  bookings: any[];
  showFeedback: (type: 'success' | 'error', title: string, message: string) => void;
}

export function BookingsManagement({ bookings, showFeedback }: BookingsManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookingsList, setBookingsList] = useState(bookings);
  
  // Reschedule form
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });

  // Cancel form
  const [cancelData, setCancelData] = useState({
    reason: '',
    refundAmount: 0
  });

  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Cancel reasons
  const cancelReasons = [
    'Customer Request',
    'Scheduling Conflict',
    'Medical Emergency',
    'Practitioner Unavailable',
    'Weather/Transportation Issues',
    'Customer No-Show',
    'Other'
  ];

  const checkInBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookingsList(bookingsList.map((b: any) => 
        b.id === bookingId ? { ...b, status: 'Completed' } : b
      ));
      showFeedback('success', 'Check-in Complete', `Booking ${bookingId} checked in successfully.`);
    } catch (error) {
      showFeedback('error', 'Check-in Failed', 'Could not check in booking.');
    } finally {
      setIsLoading(false);
    }
  };

  const openRescheduleModal = (booking: any) => {
    setSelectedBooking(booking);
    setRescheduleData({
      date: '',
      time: '',
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      showFeedback('error', 'Validation Error', 'Please select a new date and time');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBookingsList(bookingsList.map((b: any) => 
        b.id === selectedBooking.id 
          ? { ...b, date: rescheduleData.date, time: rescheduleData.time } 
          : b
      ));
      
      setShowRescheduleModal(false);
      setSelectedBooking(null);
      showFeedback('success', 'Booking Rescheduled', `Booking ${selectedBooking.id} has been rescheduled successfully. Customer will be notified.`);
    } catch (error) {
      showFeedback('error', 'Reschedule Failed', 'Could not reschedule booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelModal = (booking: any) => {
    setSelectedBooking(booking);
    setCancelData({
      reason: '',
      refundAmount: booking.deposit || 1000
    });
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelData.reason) {
      showFeedback('error', 'Validation Error', 'Please select a cancellation reason');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBookingsList(bookingsList.map((b: any) => 
        b.id === selectedBooking.id 
          ? { ...b, status: 'Cancelled' } 
          : b
      ));
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      showFeedback('success', 'Booking Cancelled', `Booking ${selectedBooking.id} has been cancelled. Refund of KES ${cancelData.refundAmount.toLocaleString()} will be processed within 5-7 business days.`);
    } catch (error) {
      showFeedback('error', 'Cancellation Failed', 'Could not cancel booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="bookings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-[24px] md:text-[32px] font-serif">Bookings Management</h2>

      <div className="space-y-4">
        {bookingsList.map((booking: any) => (
          <div key={booking.id} className="border border-gray-100 rounded-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {booking.id}
                </p>
                <p className="text-[16px] md:text-[18px] font-serif mb-1">{booking.customer}</p>
                <p className="text-[13px] md:text-[14px] text-gray-600">{booking.service}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest h-fit ${
                booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date & Time</p>
                <p className="text-[13px] md:text-[14px]">{booking.date} at {booking.time}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Practitioner</p>
                <p className="text-[13px] md:text-[14px]">{booking.practitioner}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Deposit Paid</p>
                <p className="text-[13px] md:text-[14px] font-bold text-[#6D4C91]">KES {(booking.deposit || 1000).toLocaleString()}</p>
              </div>
            </div>

            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
              <div className="flex flex-col sm:flex-row gap-3">
                {booking.status === 'Confirmed' && (
                  <ButtonWithLoading
                    isLoading={isLoading}
                    onClick={() => checkInBooking(booking.id)}
                    className="flex items-center justify-center space-x-2 px-5 py-3 bg-[#6D4C91] text-white rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check In</span>
                  </ButtonWithLoading>
                )}
                <button 
                  onClick={() => openRescheduleModal(booking)}
                  className="px-5 py-3 border border-gray-200 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Reschedule
                </button>
                <button 
                  onClick={() => openCancelModal(booking)}
                  className="px-5 py-3 border border-red-200 text-red-500 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => !isLoading && setShowRescheduleModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-2xl bg-white rounded-2xl md:rounded-[32px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 md:p-8 border-b border-gray-100 bg-[#FDFBF7] flex justify-between items-start flex-shrink-0">
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-serif font-bold mb-1">Reschedule Booking</h3>
                  <p className="text-[12px] md:text-[13px] text-gray-500">{selectedBooking.id} - {selectedBooking.customer}</p>
                  <p className="text-[11px] md:text-[12px] text-gray-400 mt-1">Current: {selectedBooking.date} at {selectedBooking.time}</p>
                </div>
                <button 
                  onClick={() => !isLoading && setShowRescheduleModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-8 space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">Current Booking</p>
                    <p className="text-[13px] md:text-[14px] font-medium">{selectedBooking.service}</p>
                    <p className="text-[12px] md:text-[13px] text-gray-600 mt-1">with {selectedBooking.practitioner}</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">New Date *</label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">New Time *</label>
                    <select
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                      disabled={isLoading}
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Reason (Optional)</label>
                    <textarea
                      value={rescheduleData.reason}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                      placeholder="E.g., Customer requested earlier time slot"
                      rows={3}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px] resize-none"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-[11px] md:text-[12px] text-amber-800">
                      <strong>Note:</strong> Customer will be automatically notified via email and SMS.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={isLoading}
                  className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <ButtonWithLoading
                  onClick={handleReschedule}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="bg-[#6D4C91] text-white px-6 py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Confirm Reschedule
                </ButtonWithLoading>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => !isLoading && setShowCancelModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-2xl bg-white rounded-2xl md:rounded-[32px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 md:p-8 border-b border-gray-100 bg-red-50 flex justify-between items-start flex-shrink-0">
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-serif font-bold mb-1 text-red-900">Cancel Booking</h3>
                  <p className="text-[12px] md:text-[13px] text-red-600">{selectedBooking.id} - {selectedBooking.customer}</p>
                  <p className="text-[11px] md:text-[12px] text-red-500 mt-1">{selectedBooking.date} at {selectedBooking.time}</p>
                </div>
                <button 
                  onClick={() => !isLoading && setShowCancelModal(false)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-all"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-8 space-y-6">
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-[13px] md:text-[14px] font-bold text-red-900 mb-2">⚠️ Are you sure?</p>
                    <p className="text-[12px] md:text-[13px] text-red-700">
                      This will cancel the booking permanently. Customer will be notified and refund will be processed.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Service</p>
                      <p className="text-[13px] md:text-[14px] font-medium mt-1">{selectedBooking.service}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Practitioner</p>
                      <p className="text-[13px] md:text-[14px] font-medium mt-1">{selectedBooking.practitioner}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Deposit Amount</p>
                      <p className="text-[15px] md:text-[16px] font-bold text-[#6D4C91] mt-1">KES {(selectedBooking.deposit || 1000).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Cancellation Reason *</label>
                    <select
                      value={cancelData.reason}
                      onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                      disabled={isLoading}
                    >
                      <option value="">Select a reason</option>
                      {cancelReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Refund Amount (KES)</label>
                    <input
                      type="number"
                      value={cancelData.refundAmount}
                      onChange={(e) => setCancelData({ ...cancelData, refundAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                      disabled={isLoading}
                    />
                    <p className="text-[11px] text-gray-500 mt-2">Standard refund: KES {(selectedBooking.deposit || 1000).toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[11px] md:text-[12px] text-blue-800">
                      <strong>Refund Policy:</strong> Processed to M-Pesa within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isLoading}
                  className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all disabled:opacity-50"
                >
                  Keep Booking
                </button>
                <ButtonWithLoading
                  onClick={handleCancel}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-6 py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Confirm Cancellation
                </ButtonWithLoading>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
