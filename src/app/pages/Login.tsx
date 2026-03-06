import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, ArrowLeft, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';
import { TermsModal } from '../components/TermsModal';
import logo from '../../assets/logo.png';
import { apiFetch } from '../lib/api';

type ViewMode = 'signup' | 'login' | 'forgot-password';

export function Login() {
  const { user, authLoading, isFirstTimeUser, setIsFirstTimeUser, login } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>(isFirstTimeUser ? 'signup' : 'login');
  const [showPassword, setShowPassword] = useState(false);
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
  // We can't log the user in until they accept terms, but we don't want to call the API twice.
  const [pendingAuthData, setPendingAuthData] = useState<{ user: any; session: any } | null>(null);

  // ── Signup ──────────────────────────────────────────────────────────────
  // Calls POST /auth/signup. On success, shows the Terms modal.
  // The actual login() call happens in handleTermsAccept below.
  const handleSignup = async (e: React.FormEvent) => {
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

      // Save the response — we'll use it when the user accepts terms
      setPendingAuthData(data);
      setShowTerms(true);
    } catch (error) {
      showFeedback('error', 'Signup Failed', error instanceof Error ? error.message : 'There was an error creating your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Called when the user clicks "Accept" in the Terms modal.
  // Now we have their consent — log them in with the API response we saved.
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
  const handleLogin = async (e: React.FormEvent) => {
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
  // Calls POST /auth/forgot-password. The backend uses Supabase to send
  // a reset email with a magic link pointing back to our /reset-password page.
  const handleForgotPassword = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-[90px] md:pt-[120px] pb-16 md:pb-24">
      <div className="max-w-md mx-auto px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-6 md:mb-8">
          <div className="bg-[#1A1A1A] rounded-full p-3 md:p-4 flex items-center justify-center">
            <img
              src={logo}
              alt="Premier Beauty Clinic"
              className="h-9 md:h-11 w-auto object-contain"
            />
          </div>
        </Link>

        <AnimatePresence mode="wait">
          {/* SIGNUP FORM */}
          {viewMode === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSignup}
              className="space-y-5 md:space-y-6"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
                    placeholder="07XX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-14 pr-14 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <ButtonWithLoading
                isLoading={isLoading}
                type="submit"
                className="w-full bg-[#6D4C91] text-white py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center space-x-2 shadow-lg mt-8"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </ButtonWithLoading>

              <div className="text-center pt-4">
                <p className="text-[13px] md:text-[14px] text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="text-[#6D4C91] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </motion.form>
          )}

          {/* LOGIN FORM */}
          {viewMode === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-5 md:space-y-6"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-14 pr-14 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
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

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setViewMode('forgot-password')}
                  className="text-[13px] text-[#6D4C91] hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <ButtonWithLoading
                isLoading={isLoading}
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all flex items-center justify-center space-x-2 mt-6"
              >
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </ButtonWithLoading>

              <div className="text-center pt-4">
                <p className="text-[13px] md:text-[14px] text-gray-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setViewMode('signup')}
                    className="text-[#6D4C91] font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </motion.form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {viewMode === 'forgot-password' && (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleForgotPassword}
              className="space-y-5 md:space-y-6"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all text-[15px]"
                    placeholder="you@example.com"
                  />
                </div>
                <p className="text-[12px] md:text-[13px] text-gray-500 mt-2">
                  We'll send password reset instructions to this email
                </p>
              </div>

              <ButtonWithLoading
                isLoading={isLoading}
                type="submit"
                className="w-full bg-[#6D4C91] text-white py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all mt-6"
              >
                Send Reset Link
              </ButtonWithLoading>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-[13px] md:text-[14px] text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-[12px] text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure 256-bit SSL Encryption</span>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal isOpen={showTerms} onAccept={handleTermsAccept} />
    </div>
  );
}
