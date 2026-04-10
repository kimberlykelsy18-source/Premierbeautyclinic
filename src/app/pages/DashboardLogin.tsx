import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import logo from '../../assets/logo.png';
import { apiFetch } from '../lib/api';

type PortalMode = 'employee' | 'admin';

const PORTAL_COPY: Record<PortalMode, { heading: string; tagline: string }> = {
  employee: {
    heading: 'Staff Portal',
    tagline: 'Access your schedule, manage appointments, and serve clients with confidence.',
  },
  admin: {
    heading: 'Admin Portal',
    tagline: 'Full dashboard access — manage staff, inventory, orders, and clinic settings.',
  },
};

export function DashboardLogin() {
  const { user, authLoading, login } = useStore();
  const [searchParams] = useSearchParams();

  // Support deep-linking via ?portal=admin or ?portal=employee
  const initialPortal = searchParams.get('portal');
  const [portalMode, setPortalMode] = useState<PortalMode>(
    initialPortal === 'admin' ? 'admin' : 'employee'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showFeedback } = useFeedback();
  const navigate = useNavigate();

  // Redirect already-logged-in staff away from login page
  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'customer') {
      navigate('/staff');
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchPortal = (mode: PortalMode) => {
    setPortalMode(mode);
    setEmail('');
    setPassword('');
  };

  // Both employee and admin use the same endpoint.
  // The backend checks the employees table and returns the actual role + permissions.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showFeedback('error', 'Missing Credentials', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch('/employee/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(
        {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email,
          email: data.user.email,
          role: data.role,
          permissions: data.permissions,
          requiresPasswordReset: data.requiresPasswordReset ?? false,
        },
        data.session.access_token
      );

      if (data.requiresPasswordReset) {
        showFeedback('info', 'Password Reset Required', 'Please change your temporary password before continuing.');
      } else {
        showFeedback('success', 'Login Successful', `Welcome back!`);
      }
      navigate('/staff');
    } catch (error) {
      showFeedback('error', 'Login Failed', error instanceof Error ? error.message : 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copy = PORTAL_COPY[portalMode];

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white overflow-auto">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0 w-full md:w-[55%] min-h-[200px] md:min-h-0 overflow-hidden flex flex-col items-center justify-center px-10 py-12 md:py-0"
        style={{ background: '#000000' }}
      >
        {/* Organic flowing wave shapes — staff portal (inverted flow: lighter top → darker bottom) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          {/* Top light lavender wave */}
          <path d="M -20 80 C 110 44 290 96 490 58 C 690 20 752 74 820 46 L 820 -10 L -20 -10 Z" fill="#F2F1F8" fillOpacity="0.10"/>
          {/* Soft upper purple wave */}
          <path d="M -20 230 C 120 190 295 246 495 208 C 695 170 752 228 820 198 L 820 -10 L -20 -10 Z" fill="#9b6bbf" fillOpacity="0.20"/>
          {/* Brand purple mid wave */}
          <path d="M 0 400 C 145 358 320 418 515 378 C 710 338 758 398 800 368 L 800 -10 L 0 -10 Z" fill="#6D4C91" fillOpacity="0.38"/>
          {/* Deep purple lower wave */}
          <path d="M 0 570 C 160 528 340 590 535 550 C 730 510 768 570 800 540 L 800 -10 L 0 -10 Z" fill="#3b1f6b" fillOpacity="0.60"/>
          {/* Darkest bottom fill */}
          <path d="M 0 730 C 155 692 330 750 528 712 C 726 674 766 732 800 702 L 800 -10 L 0 -10 Z" fill="#1a0a2e" fillOpacity="0.75"/>
        </svg>

        {/* Branding content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={portalMode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center gap-5 max-w-sm"
          >
            <img src={logo} alt="Premier Beauty Clinic" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#b07ed4]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  {portalMode === 'admin' ? 'Admin Access' : 'Staff Access'}
                </span>
              </div>
              <h2 className="text-white text-[20px] md:text-[26px] font-serif font-bold leading-snug drop-shadow">
                {copy.heading}
              </h2>
              <p className="mt-2 text-white/70 text-[13px] md:text-[15px] leading-relaxed">
                {copy.tagline}
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/35" />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 md:py-0 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Portal switcher tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-7">
            {(['employee', 'admin'] as PortalMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => switchPortal(mode)}
                className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                  portalMode === mode
                    ? 'bg-[#6D4C91] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {mode === 'employee' ? 'Employee' : 'Admin'}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={portalMode}
              initial={{ opacity: 0, x: portalMode === 'admin' ? 24 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: portalMode === 'admin' ? -24 : 24 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="mb-6">
                <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 leading-tight">
                  {portalMode === 'admin' ? 'Admin Sign In' : 'Staff Sign In'}
                </h1>
                <p className="text-[13px] text-gray-400 mt-1">
                  {portalMode === 'admin'
                    ? 'Sign in with your admin credentials.'
                    : 'Use the credentials sent by your manager.'}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-800 placeholder:text-gray-300"
                    placeholder={portalMode === 'admin' ? 'admin@premierbeauty.com' : 'staff@premierbeauty.com'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-800 placeholder:text-gray-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#000000] text-white py-3.5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>
                      <span>{portalMode === 'admin' ? 'Sign In as Admin' : 'Sign In as Employee'}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </>
                }
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Footer note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Contact your admin if you need access or a password reset.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
