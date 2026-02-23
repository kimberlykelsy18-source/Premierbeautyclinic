import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, ArrowLeft, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';
import { TermsModal } from '../components/TermsModal';
import logo from 'figma:asset/9f791e938296bf5db89926ddac1d6fc1b167f150.png';

type ViewMode = 'signup' | 'login' | 'forgot-password';
type PortalMode = 'customer' | 'employee' | 'admin';

export function Login() {
  const { isFirstTimeUser, setIsFirstTimeUser } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>(isFirstTimeUser ? 'signup' : 'login');
  const [portalMode, setPortalMode] = useState<PortalMode>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { login } = useStore();
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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
      showFeedback('error', 'Passwords Don\'t Match', 'Please ensure both passwords are identical.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show terms modal for first-time users
      setShowTerms(true);
    } catch (error) {
      showFeedback('error', 'Signup Failed', 'There was an error creating your account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleTermsAccept = () => {
    setShowTerms(false);
    setIsLoading(false);
    
    // Create account and login
    login(formData.email, 'customer');
    setIsFirstTimeUser(false);
    
    showFeedback('success', 'Welcome to Premier Beauty!', 'Your account has been created successfully.');
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showFeedback('error', 'Missing Credentials', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      login(formData.email, portalMode);

      if (portalMode === 'admin' || portalMode === 'employee') {
        showFeedback('success', 'Login Successful', `Welcome back, ${portalMode === 'admin' ? 'Administrator' : 'Staff Member'}!`);
        navigate('/dashboard');
      } else {
        showFeedback('success', 'Login Successful', 'Welcome back to Premier Beauty!');
        navigate('/');
      }
    } catch (error) {
      showFeedback('error', 'Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      showFeedback('success', 'Reset Email Sent', `Password reset instructions have been sent to ${formData.email}`);
      
      setTimeout(() => {
        setViewMode('login');
      }, 2000);
    } catch (error) {
      showFeedback('error', 'Error', 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pt-[80px] md:pt-[100px] pb-16 md:pb-24 flex items-center justify-center bg-[#FDFBF7] px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white p-8 md:p-16 rounded-3xl md:rounded-[48px] shadow-sm border border-gray-100">
            <div className="text-center mb-8 md:mb-12">
              <Link to="/">
                <div className="bg-[#1A1A1A] px-3 md:px-4 py-1.5 md:py-2 rounded-xl inline-block mb-6 md:mb-8">
                  <img src={logo} alt="Logo" className="h-10 md:h-14 mx-auto" />
                </div>
              </Link>
              
              {viewMode === 'signup' && (
                <>
                  <h1 className="text-[28px] md:text-[32px] font-serif mb-2 md:mb-3 italic">Create Your Account</h1>
                  <p className="text-[13px] md:text-[14px] text-gray-500">Join Premier Beauty Clinic today</p>
                </>
              )}
              
              {viewMode === 'login' && (
                <>
                  <h1 className="text-[28px] md:text-[32px] font-serif mb-2 md:mb-3 italic">
                    {portalMode === 'admin' ? 'Admin Console' : portalMode === 'employee' ? 'Staff Portal' : 'Welcome Back'}
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-gray-500">
                    {portalMode === 'customer' ? 'Login to your account' : 'Enter your credentials'}
                  </p>
                </>
              )}
              
              {viewMode === 'forgot-password' && (
                <>
                  <h1 className="text-[28px] md:text-[32px] font-serif mb-2 md:mb-3 italic">Reset Password</h1>
                  <p className="text-[13px] md:text-[14px] text-gray-500">We'll send you reset instructions</p>
                </>
              )}
            </div>

            {/* Portal Selector - Only show for login, not signup */}
            {viewMode === 'login' && (
              <div className="flex gap-2 mb-6 md:mb-8 p-1.5 bg-gray-100 rounded-2xl">
                <button
                  onClick={() => setPortalMode('customer')}
                  className={`flex-1 py-3 rounded-xl text-[12px] md:text-[13px] font-bold uppercase tracking-widest transition-all ${
                    portalMode === 'customer' ? 'bg-white shadow-sm text-[#6D4C91]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => setPortalMode('employee')}
                  className={`flex-1 py-3 rounded-xl text-[12px] md:text-[13px] font-bold uppercase tracking-widest transition-all ${
                    portalMode === 'employee' ? 'bg-white shadow-sm text-[#6D4C91]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Staff
                </button>
                <button
                  onClick={() => setPortalMode('admin')}
                  className={`flex-1 py-3 rounded-xl text-[12px] md:text-[13px] font-bold uppercase tracking-widest transition-all ${
                    portalMode === 'admin' ? 'bg-white shadow-sm text-[#6D4C91]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Admin
                </button>
              </div>
            )}

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

                  {portalMode === 'customer' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setViewMode('forgot-password')}
                        className="text-[13px] text-[#6D4C91] hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <ButtonWithLoading
                    isLoading={isLoading}
                    type="submit"
                    className="w-full bg-[#1A1A1A] text-white py-5 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all flex items-center justify-center space-x-2 mt-6"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </ButtonWithLoading>

                  {/* Only show signup link for customer portal */}
                  {portalMode === 'customer' && (
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
                  )}
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

            {(viewMode === 'login' || viewMode === 'signup') && portalMode === 'customer' && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-2 text-[12px] text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure 256-bit SSL Encryption</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Terms Modal */}
      <TermsModal isOpen={showTerms} onAccept={handleTermsAccept} />
    </>
  );
}
