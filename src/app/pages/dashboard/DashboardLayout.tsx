import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingCart, CalendarDays, Box, Users, Settings, LogOut, Bell, Search, Menu, X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import logo from '../../../assets/logo.png';

export function DashboardLayout() {
  const { user, token, sessionId, authLoading, logout, updateUser } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── Auth protection ──────────────────────────────────────────────────────
  // Wait for authLoading to finish before checking — prevents a false redirect
  // on page refresh while localStorage is still being read.
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role === 'customer') {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // ── Forced password reset ────────────────────────────────────────────────
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordReset = async () => {
    if (newPwd.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords don't match");
      return;
    }
    setIsResetting(true);
    try {
      await apiFetch('/auth/update-password', {
        method: 'POST',
        body: JSON.stringify({ password: newPwd }),
      }, token, sessionId);
      updateUser({ requiresPasswordReset: false });
      toast.success('Password updated! Welcome to the dashboard.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsResetting(false);
    }
  };

  const navItems = [
    { name: 'Overview',     path: '/',              icon: LayoutDashboard },
    { name: 'Orders',       path: '/orders',        icon: ShoppingCart    },
    { name: 'Appointments', path: '/appointments',  icon: CalendarDays    },
    { name: 'Inventory',    path: '/inventory',     icon: Box             },
    { name: 'Customers',    path: '/customers',     icon: Users,  permission: 'admin' },
    { name: 'Settings',     path: '/settings',      icon: Settings, permission: 'admin' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRestricted = (item: typeof navItems[0]) =>
    item.permission === 'admin' && user?.role !== 'admin';

  // ── Loading screen while auth restores ───────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex h-screen bg-[#F8F9FA] items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400">Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated — render nothing while redirect fires ──────────────
  if (!user || user.role === 'customer') {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* ── Forced Password Reset Overlay ───────────────────────────────── */}
      <AnimatePresence>
        {user.requiresPasswordReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-[#1A1A1A]/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 bg-[#FDFBF7] text-center">
                <div className="w-16 h-16 bg-[#6D4C91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-[#6D4C91]" />
                </div>
                <h2 className="text-[22px] font-serif font-bold mb-1">Set Your Password</h2>
                <p className="text-gray-500 text-[13px]">
                  You're logged in with a temporary password.<br />
                  Please create a new password to continue.
                </p>
              </div>

              <div className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
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
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordReset()}
                    />
                  </div>
                </div>

                {confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-[12px] text-red-500 font-medium">Passwords don't match</p>
                )}
              </div>

              <div className="px-8 pb-8">
                <button
                  onClick={handlePasswordReset}
                  disabled={isResetting || newPwd.length < 6 || newPwd !== confirmPwd}
                  className="w-full bg-[#6D4C91] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isResetting
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    : <ShieldCheck className="w-4 h-4 mr-2" />}
                  {isResetting ? 'Updating…' : 'Set New Password & Continue'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 py-3 text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                >
                  Logout Instead
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`bg-[#1A1A1A] text-white flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'}`}>
        <div className="p-8 flex items-center justify-between">
          <Link to="/" className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto' : 'w-0 opacity-0'}`}>
            <img src={logo} alt="Premier" className="h-10 brightness-0 invert" />
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-grow px-4 mt-8 space-y-2">
          {navItems.map((item) => {
            const isActive    = location.pathname === item.path;
            const restricted  = isRestricted(item);
            return (
              <Link
                key={item.path}
                to={restricted ? '#' : item.path}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all relative group ${isActive ? 'bg-[#6D4C91] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'} ${restricted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                {isSidebarOpen && (
                  <span className="text-[14px] font-medium font-sans">{item.name}</span>
                )}
                {restricted && isSidebarOpen && (
                  <Lock className="w-4 h-4 ml-auto text-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 p-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="text-[14px] font-medium font-sans">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center bg-[#F8F9FA] px-4 py-2 rounded-xl w-full max-w-md border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input placeholder="Search orders, appointments…" className="bg-transparent outline-none text-[14px] w-full" />
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-gray-100" />
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-[14px] font-bold leading-none mb-1">{user.name}</p>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-[#6D4C91]/10 rounded-xl flex items-center justify-center text-[#6D4C91] font-bold">
                {user.name?.[0]?.toUpperCase() ?? 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 bg-[#F8F9FA]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
