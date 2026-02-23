import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    // In a real app, we would call the signup API here
    login(email, 'customer');
    navigate('/shop');
  };

  return (
    <div className="min-h-screen pt-[120px] pb-24 bg-[#FDFBF7] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100"
      >
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-serif mb-3 text-[#1A1A1A]">Create Account</h1>
          <p className="text-gray-500 text-[15px]">Join Premier Beauty Clinic for a personalized experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
              />
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <button 
              type="button"
              onClick={() => setAgree(!agree)}
              className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agree ? 'bg-[#6D4C91] border-[#6D4C91]' : 'border-gray-300 bg-white'}`}
            >
              {agree && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              I agree to the <Link to="/terms" className="text-[#6D4C91] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#6D4C91] hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          <button 
            type="submit"
            disabled={!agree}
            className="w-full bg-[#6D4C91] text-white py-5 rounded-full font-bold uppercase tracking-widest text-[14px] flex items-center justify-center space-x-2 hover:bg-[#5a3e79] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-[14px]">
            Already have an account? <Link to="/login" className="text-[#6D4C91] font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
