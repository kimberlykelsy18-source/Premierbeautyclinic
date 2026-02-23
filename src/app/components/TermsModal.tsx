import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ButtonWithLoading } from './Loading';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onAccept }: TermsModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolled = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolled) setHasScrolled(true);
  };

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-[24px] md:text-[32px] font-serif italic mb-2">Terms & Conditions</h2>
                <p className="text-[13px] md:text-[14px] text-gray-500">Please read and accept our terms to continue</p>
              </div>

              {/* Content */}
              <div 
                className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
                onScroll={handleScroll}
              >
                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">1. Introduction</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    Welcome to Premier Beauty Clinic. By accessing and using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before making any purchase or booking any service.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">2. Services & Products</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed mb-3">
                    Premier Beauty Clinic provides:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-[14px] md:text-[15px] text-gray-600">
                    <li>Skincare and beauty products for purchase</li>
                    <li>Professional beauty consultation services</li>
                    <li>Skin analysis and treatment bookings</li>
                    <li>Home delivery services within Kenya</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">3. Orders & Payment</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    All orders are subject to acceptance and availability. We accept payments via M-Pesa and major credit/debit cards. Prices are displayed in Kenyan Shillings (KES) and may be converted to other East African currencies for display purposes only. All transactions are processed in KES.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">4. Shipping & Delivery</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    Shipping fees vary by county and region. Delivery times are estimates and may vary. We are not responsible for delays caused by circumstances beyond our control. Please ensure your delivery address is accurate.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">5. Appointments & Bookings</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    Service bookings require a deposit payment. You may reschedule or cancel your appointment up to 24 hours in advance. Cancellations made within 24 hours may be subject to a cancellation fee. Refunds for valid cancellations will be processed within 5-7 business days.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">6. Returns & Refunds</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    Products may be returned within 14 days of delivery if unopened and in original packaging. Beauty and skincare products cannot be returned once opened for hygiene reasons. Refunds will be issued to the original payment method.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">7. Privacy & Data Protection</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    We collect and process your personal data in accordance with our Privacy Policy. By using our services, you consent to the collection and use of your information as described. We do not share your personal information with third parties without your consent.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">8. Marketing Communications</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    By creating an account, you agree to receive promotional emails about our products, services, and special offers. You may opt out at any time through your account settings or by clicking unsubscribe in our emails.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">9. Limitation of Liability</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    Premier Beauty Clinic is not liable for any allergic reactions or adverse effects from product use. Please read all product ingredients carefully. Consult with our professionals if you have any concerns about product suitability.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] md:text-[18px] font-bold mb-3">10. Changes to Terms</h3>
                  <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
                    We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
                  </p>
                </section>

                {!hasScrolled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"
                  />
                )}
              </div>

              {/* Footer */}
              <div className="p-6 md:p-8 border-t border-gray-100 space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#6D4C91] focus:ring-[#6D4C91]"
                  />
                  <span className="text-[13px] md:text-[14px] text-gray-600 leading-relaxed">
                    I have read and agree to the Terms & Conditions and Privacy Policy of Premier Beauty Clinic
                  </span>
                </label>

                <ButtonWithLoading
                  isLoading={false}
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="w-full bg-[#6D4C91] text-white py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Accept & Continue
                </ButtonWithLoading>

                {!hasScrolled && (
                  <p className="text-[11px] md:text-[12px] text-center text-gray-400 italic">
                    Please scroll to read all terms
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
