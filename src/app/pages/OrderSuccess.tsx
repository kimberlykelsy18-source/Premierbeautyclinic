import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, XCircle, Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { apiFetch } from '../lib/api';
import logo from '../../assets/logo.png';

type PaymentStatus = 'loading' | 'completed' | 'failed' | 'cancelled' | 'not_found' | 'error';

export function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart, token, sessionId } = useStore();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  // Flutterwave V4 appends: ?status=successful&reference=ORD-A001
  // (V3 fallback)         : ?status=successful&tx_ref=ORD-A001&transaction_id=12345
  const flwStatus = searchParams.get('status');
  const ref       = searchParams.get('reference') || searchParams.get('tx_ref'); // V4 or V3

  useEffect(() => {
    // Customer cancelled on Flutterwave's page — no API call needed
    if (flwStatus === 'cancelled') {
      setStatus('cancelled');
      return;
    }

    if (!ref) {
      setStatus('error');
      return;
    }

    async function verify() {
      try {
        const data = await apiFetch(
          `/flutterwave/verify?reference=${encodeURIComponent(ref!)}&status=${flwStatus || ''}`,
          {},
          token,
          sessionId
        );

        if (data.status === 'completed') {
          clearCart();
          setStatus('completed');
        } else if (data.status === 'cancelled') {
          setStatus('cancelled');
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('error');
      }
    }

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flwStatus, ref, retryCount]);

  return (
    <div className="min-h-screen bg-[#F2F1F8] flex flex-col">
      {/* Mini Header */}
      <header className="py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-center">
          <Link to="/">
            <div className="bg-[#1A1A1A] px-3 py-1.5 rounded-xl">
              <img src={logo} alt="Premier Beauty" className="h-8" />
            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 md:p-16 max-w-md w-full text-center shadow-sm border border-gray-100"
        >
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-[#6D4C91] animate-spin" />
              </div>
              <h1 className="text-[24px] md:text-[28px] font-serif italic mb-3">Confirming your payment…</h1>
              <p className="text-[14px] text-gray-500">Please wait while we verify your card payment.</p>
            </>
          )}

          {status === 'completed' && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-[24px] md:text-[28px] font-serif italic mb-3 text-green-800">Payment Successful!</h1>
              {ref && (
                <p className="text-[13px] font-bold text-[#6D4C91] uppercase tracking-widest mb-3">{ref}</p>
              )}
              <p className="text-[14px] text-gray-600 mb-8">
                Your order has been confirmed. A receipt has been sent to your email address.
              </p>
              <div className="space-y-3">
                <Link
                  to="/shop"
                  className="block w-full bg-[#6D4C91] text-white py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                >
                  <ShoppingBag className="inline w-4 h-4 mr-2 -mt-0.5" />
                  Continue Shopping
                </Link>
                <Link
                  to="/account"
                  className="block w-full border border-gray-200 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  View My Orders
                </Link>
              </div>
            </>
          )}

          {(status === 'failed' || status === 'cancelled') && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-16 h-16 text-red-400" />
              </div>
              <h1 className="text-[24px] md:text-[28px] font-serif italic mb-3 text-red-700">
                {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
              </h1>
              <p className="text-[14px] text-gray-600 mb-8">
                {status === 'cancelled'
                  ? 'You cancelled the payment. No charge was made. You can try again whenever you\'re ready.'
                  : 'Your card payment was declined or could not be processed. Please try again with a different card.'}
              </p>
              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="block w-full bg-[#6D4C91] text-white py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                >
                  Try Again
                </Link>
                <Link
                  to="/cart"
                  className="block w-full border border-gray-200 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Back to Cart
                </Link>
              </div>
            </>
          )}

          {(status === 'not_found' || status === 'error') && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-yellow-500" />
              </div>
              <h1 className="text-[24px] md:text-[28px] font-serif italic mb-3 text-yellow-800">Payment Pending</h1>
              <p className="text-[14px] text-gray-600 mb-8">
                We couldn't confirm your payment status. If you were charged, your order will be updated automatically.
                Please check <strong>My Orders</strong> in a few minutes or contact us.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => { setStatus('loading'); setRetryCount(c => c + 1); }}
                  className="block w-full bg-[#6D4C91] text-white py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                >
                  Check Again
                </button>
                <Link
                  to="/account"
                  className="block w-full border border-gray-200 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  View My Orders
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
