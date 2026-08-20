import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, ArrowLeft, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import { TermsModal } from '../components/TermsModal';
import { apiFetch } from '../lib/api';
import { Seo } from '../lib/seo';
import logo from '../../assets/premier logo-1.png';
import bgImage from '../../assets/purple-v2.webp';

type ViewMode = 'signup' | 'login' | 'forgot-password';

// ── Left panel branding copy per view ──────────────────────────────────────
const PANEL_COPY: Record<ViewMode, { heading: string; tagline: string }> = {
  signup: {
    heading: 'Welcome to Premier Beauty Clinic',
    tagline: 'Manage your appointments, products, and beauty services all in one place.',
  },
  login: {
    heading: 'Welcome Back',
    tagline: 'Sign in to access your bookings, orders, and exclusive beauty services.',
  },
  'forgot-password': {
    heading: 'Reset Your Password',
    tagline: "No worries — we'll send a secure link straight to your inbox.",
  },
};

export function Login() {
  const { user, authLoading, isFirstTimeUser, setIsFirstTimeUser, login } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>(isFirstTimeUser ? 'signup' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { showFeedback } = useFeedback();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect already-logged-in customers away from the login page
  useEffect(() => {
    if (authLoading || !user) return;
    navigate('/');
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Holds the API response temporarily between "Create Account" click and "Accept Terms" click.
  const [pendingAuthData, setPendingAuthData] = useState<{ user: any; session: any } | null>(null);

  // ── Signup ──────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      showFeedback('error', 'Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (!formData.email.includes('@')) {
      showFeedback('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (formData.phone.length < 10) {
      showFeedback('error', 'Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    if (formData.password.length < 6) {
      showFeedback('error', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showFeedback('error', "Passwords Don't Match", 'Please ensure both passwords are identical.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          phone: formData.phone,
        }),
      });

      setPendingAuthData(data);
      setShowTerms(true);
    } catch (error) {
      showFeedback('error', 'Signup Failed', error instanceof Error ? error.message : 'There was an error creating your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Called when the user clicks "Accept" in the Terms modal.
  const handleTermsAccept = () => {
    setShowTerms(false);

    if (pendingAuthData) {
      login(
        {
          id: pendingAuthData.user.id,
          name: pendingAuthData.user.user_metadata?.full_name || formData.name,
          email: pendingAuthData.user.email,
          role: 'customer',
        },
        pendingAuthData.session.access_token
      );
    }

    setIsFirstTimeUser(false);
    showFeedback('success', 'Welcome to Premier Beauty!', 'Your account has been created successfully.');
    setTimeout(() => navigate('/'), 1000);
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showFeedback('error', 'Missing Credentials', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      login(
        {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email,
          email: data.user.email,
          phone: data.user.user_metadata?.phone || '',
          role: 'customer',
        },
        data.session.access_token
      );

      showFeedback('success', 'Welcome back!', 'You are now signed in.');
      navigate('/');
    } catch (error) {
      showFeedback('error', 'Login Failed', error instanceof Error ? error.message : 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password ──────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email) {
      showFeedback('error', 'Email Required', 'Please enter your email address.');
      return;
    }
    if (!formData.email.includes('@')) {
      showFeedback('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email }),
      });

      showFeedback('success', 'Reset Email Sent', `Password reset instructions have been sent to ${formData.email}`);
      setTimeout(() => setViewMode('login'), 2000);
    } catch (error) {
      showFeedback('error', 'Error', error instanceof Error ? error.message : 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const panelCopy = PANEL_COPY[viewMode];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col md:flex-row overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
    >
      <Seo title="Log In" path="/login" noindex />

      {/* ── LEFT PANEL — transparent, branding floats over full bg ───────── */}
      <div className="relative flex-shrink-0 w-full md:w-[55%] flex flex-col items-center justify-center px-8 py-5 md:py-0 md:min-h-0">
        {/* Branding */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center gap-5 max-w-sm"
          >
            <img src={logo} alt="Premier Beauty Clinic" className="w-16 h-16 md:w-32 md:h-32 object-contain" />
            <div>
              <h2 className="text-[#1a0a2e] text-[17px] md:text-[26px] font-serif font-bold leading-snug">
                {panelCopy.heading}
              </h2>
              <p className="mt-1 text-[#3b1f6b]/80 text-xs md:text-sm leading-relaxed hidden sm:block">
                {panelCopy.tagline}
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#6D4C91]/50" />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── RIGHT PANEL — transparent, form floats over background ─────────── */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-start md:justify-center px-6 py-8 md:py-0 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <AnimatePresence mode="wait">

            {/* SIGNUP FORM */}
            {viewMode === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignup}
                className="space-y-3"
              >
                <div className="mb-3">
                  <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 leading-tight">Create Account</h1>
                  <p className="text-sm text-gray-400 mt-1">Join Premier Beauty Clinic today.</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#6D4C91] text-white py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#5a3e79] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Create Account</span><ArrowRight className="w-4 h-4 shrink-0" /></>
                  }
                </button>

                <p className="text-center text-sm text-gray-400 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="text-[#6D4C91] font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </motion.form>
            )}

            {/* LOGIN FORM */}
            {viewMode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="mb-6">
                  <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 leading-tight">Welcome Back</h1>
                  <p className="text-sm text-gray-400 mt-1">Sign in to your account.</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
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

                <div className="text-right -mt-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('forgot-password')}
                    className="text-xs text-[#6D4C91] hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#000000] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#6D4C91] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Sign In</span><ArrowRight className="w-4 h-4 shrink-0" /></>
                  }
                </button>

                <p className="text-center text-sm text-gray-400 pt-2">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setViewMode('signup')}
                    className="text-[#6D4C91] font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {viewMode === 'forgot-password' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <div className="mb-6">
                  <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 leading-tight">Reset Password</h1>
                  <p className="text-sm text-gray-400 mt-1">Enter your email and we'll send a reset link.</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-[#6D4C91] focus:ring-2 focus:ring-[#6D4C91]/10 outline-none transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    We'll send password reset instructions to this email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#6D4C91] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#5a3e79] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span>Send Reset Link</span>
                  }
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 mx-auto transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>

          {/* Security badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure 256-bit SSL Encryption</span>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal isOpen={showTerms} onAccept={handleTermsAccept} />
    </div>
  );
}
