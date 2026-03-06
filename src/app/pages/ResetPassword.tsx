import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import logo from '../../assets/logo.png';
import { apiFetch } from '../lib/api';

export function ResetPassword() {
  const navigate = useNavigate();

  const [recoveryToken, setRecoveryToken] = useState('');
  const [tokenError, setTokenError]       = useState(false);
  const [newPwd, setNewPwd]               = useState('');
  const [confirmPwd, setConfirmPwd]       = useState('');
  const [showPwd, setShowPwd]             = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [done, setDone]                   = useState(false);

  // Supabase redirects here with the recovery token in the URL hash:
  //   /reset-password#access_token=...&type=recovery
  // We extract it so we can use it as the Bearer token when calling the API.
  useEffect(() => {
    const hash   = window.location.hash.substring(1); // strip leading #
    const params = new URLSearchParams(hash);
    const token  = params.get('access_token');
    const type   = params.get('type');

    if (token && type === 'recovery') {
      setRecoveryToken(token);
    } else {
      // No valid recovery token — link was already used or is invalid
      setTokenError(true);
    }
  }, []);

  const handleReset = async () => {
    if (newPwd.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      // Pass the recovery token as the Bearer token — our /auth/update-password
      // endpoint uses authenticate middleware which accepts any valid Supabase JWT.
      await apiFetch('/auth/update-password', {
        method: 'POST',
        body: JSON.stringify({ password: newPwd }),
      }, recoveryToken, null);

      setDone(true);
      toast.success('Password updated! Redirecting to login…');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password. The link may have expired — request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-[90px] md:pt-[120px] pb-16 md:pb-24 flex items-start justify-center">
      <div className="w-full max-w-md px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-6 md:mb-8">
          <div className="bg-[#1A1A1A] rounded-full p-3 md:p-4 flex items-center justify-center">
            <img src={logo} alt="Premier Beauty Clinic" className="h-9 md:h-11 w-auto object-contain" />
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100 text-center">
            <div className="w-14 h-14 bg-[#6D4C91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-[#6D4C91]" />
            </div>
            <h1 className="text-[22px] font-serif font-bold mb-1">Set New Password</h1>
            <p className="text-gray-500 text-[13px]">Choose a strong password for your account.</p>
          </div>

          <div className="p-8">
            {/* Invalid / expired link */}
            {tokenError && (
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-[16px] mb-1">Link Expired or Invalid</p>
                  <p className="text-gray-500 text-[13px] leading-relaxed">
                    This reset link has already been used or has expired.<br />
                    Please request a new one.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="mt-2 bg-[#6D4C91] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] transition-all"
                >
                  Back to Login
                </Link>
              </div>
            )}

            {/* Success state */}
            {done && !tokenError && (
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-[16px] mb-1">Password Updated!</p>
                  <p className="text-gray-500 text-[13px]">Redirecting you to login…</p>
                </div>
              </div>
            )}

            {/* Password form */}
            {!tokenError && !done && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="Repeat your new password"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
                      onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                    />
                  </div>
                </div>

                {confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-[12px] text-red-500 font-medium">Passwords don't match</p>
                )}

                <button
                  onClick={handleReset}
                  disabled={isLoading || newPwd.length < 6 || newPwd !== confirmPwd}
                  className="w-full bg-[#6D4C91] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Updating…</>
                    : <><ShieldCheck className="w-4 h-4 mr-2" />Set New Password</>}
                </button>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-[12px] text-gray-400 hover:text-[#6D4C91] font-bold uppercase tracking-widest transition-colors">
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
