import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';
import logo from '../../assets/logo.png';
import { apiFetch } from '../lib/api';

type PortalMode = 'employee' | 'admin';

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
      navigate('/');
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
      navigate('/');
    } catch (error) {
      showFeedback('error', 'Login Failed', error instanceof Error ? error.message : 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1A1A1A] rounded-full p-4 flex items-center justify-center">
            <img
              src={logo}
              alt="Premier Beauty Clinic"
              className="h-11 w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2 p-1.5 bg-white rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => switchPortal('employee')}
              className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                portalMode === 'employee' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Employee
            </button>
            <button
              onClick={() => switchPortal('admin')}
              className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                portalMode === 'admin' ? 'bg-[#6D4C91] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Context badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#6D4C91] shrink-0" />
            <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">
              {portalMode === 'admin'
                ? 'Admin Dashboard Access — full permissions'
                : 'Staff Dashboard Access — credentials sent by management'}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={portalMode}
            initial={{ opacity: 0, x: portalMode === 'admin' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: portalMode === 'admin' ? -20 : 20 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-[#6D4C91] outline-none transition-all text-[15px] shadow-sm"
                  placeholder={portalMode === 'admin' ? 'admin@premierbeauty.com' : 'staff@premierbeauty.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-4 rounded-2xl bg-white border border-gray-100 focus:border-[#6D4C91] outline-none transition-all text-[15px] shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <ButtonWithLoading
              isLoading={isLoading}
              type="submit"
              className={`w-full text-white py-5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2 mt-2 ${
                portalMode === 'admin'
                  ? 'bg-[#6D4C91] hover:bg-[#5a3e79]'
                  : 'bg-[#1A1A1A] hover:bg-[#6D4C91]'
              }`}
            >
              <span>
                {portalMode === 'admin' ? 'Sign In as Admin' : 'Sign In as Employee'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </ButtonWithLoading>
          </motion.form>
        </AnimatePresence>

        <p className="text-center text-[12px] text-gray-400 mt-8">
          Contact your admin if you need access or a password reset.
        </p>
      </motion.div>
    </div>
  );
}
