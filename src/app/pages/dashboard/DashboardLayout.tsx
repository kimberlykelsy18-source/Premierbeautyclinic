import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingCart, CalendarDays, Box, Users, Settings, LogOut, Bell, Search, Menu, X, Lock, Eye, EyeOff, ShieldCheck, Truck } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen]           = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Auth protection ──────────────────────────────────────────────────────
  // Wait for authLoading to finish before checking — prevents a false redirect
  // on page refresh while localStorage is still being read.
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role === 'customer') {
      navigate('/staff/login');
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
    { name: 'Overview',     path: '/staff',              icon: LayoutDashboard },
    { name: 'Orders',       path: '/staff/orders',        icon: ShoppingCart    },
    { name: 'Appointments', path: '/staff/appointments',  icon: CalendarDays    },
    { name: 'Inventory',    path: '/staff/inventory',     icon: Box             },
    { name: 'Customers',    path: '/staff/customers',     icon: Users,   permission: 'admin' },
    { name: 'Shipping',     path: '/staff/shipping',      icon: Truck,   permission: 'admin' },
    { name: 'Settings',     path: '/staff/settings',      icon: Settings, permission: 'admin' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const isRestricted = (item: typeof navItems[0]) =>
    item.permission === 'admin' && user?.role !== 'admin';

  // ── Loading screen while auth restores ───────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex h-screen bg-[#F2F1F8] items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="Premier Beauty Clinic" className="h-12 w-auto mx-auto mb-6 opacity-60" />
          <div className="w-10 h-10 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
    <div className="flex h-screen bg-[#F2F1F8] overflow-hidden relative">
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
              <div className="p-8 border-b border-gray-100 bg-[#F2F1F8] text-center">
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

      {/* ── Mobile Sidebar Backdrop ──────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[90] md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`
        bg-[#0A0A0A] text-white flex flex-col transition-all duration-300
        fixed inset-y-0 left-0 z-[95] md:relative md:z-auto border-r border-white/5
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isSidebarOpen ? 'w-[260px]' : 'md:w-[72px] w-[260px]'}
      `}>
        {/* Logo row */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/5">
          <Link to="/staff" className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'md:w-0 md:opacity-0 w-auto opacity-100'}`}>
            <img src={logo} alt="Premier" className="h-8" />
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-grow px-3 py-4 space-y-0.5 overflow-y-auto">
          {isSidebarOpen && (
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 px-3 pb-2 pt-1">Menu</p>
          )}
          {navItems.map((item) => {
            const isActive   = location.pathname === item.path;
            const restricted = isRestricted(item);
            return (
              <Link
                key={item.path}
                to={restricted ? '#' : item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group
                  ${isActive
                    ? 'bg-[#6D4C91] text-white shadow-lg shadow-[#6D4C91]/20'
                    : 'text-white/50 hover:bg-white/6 hover:text-white'}
                  ${restricted ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                  ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className={`text-[13px] font-semibold tracking-wide transition-all duration-300 ${isSidebarOpen ? 'md:block' : 'md:hidden'} block`}>
                  {item.name}
                </span>
                {restricted && (
                  <Lock className="w-3 h-3 ml-auto text-amber-500/70 shrink-0" />
                )}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card + logout */}
        <div className="px-3 py-3 border-t border-white/5 space-y-1">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 ${isSidebarOpen ? '' : 'md:justify-center'}`}>
            <div className="w-8 h-8 rounded-lg bg-[#6D4C91] flex items-center justify-center text-white font-bold text-[13px] shrink-0">
              {user.name?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className={`min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:block' : 'md:hidden'} block`}>
              <p className="text-[12px] font-bold text-white leading-none truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all ${isSidebarOpen ? '' : 'md:justify-center'}`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/5">
              <LogOut className="w-4 h-4" />
            </div>
            <span className={`text-[13px] font-semibold transition-all duration-300 ${isSidebarOpen ? 'md:block' : 'md:hidden'} block`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[60px] md:h-[68px] bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-4 md:px-6 shrink-0 gap-4">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 text-white/60 hover:text-white transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/staff">
              <img src={logo} alt="Premier Beauty Clinic" className="h-7 w-auto" />
            </Link>
          </div>

          {/* Desktop: search bar */}
          <div className="hidden md:flex items-center bg-white/6 border border-white/8 focus-within:border-[#6D4C91]/50 focus-within:bg-white/8 px-4 py-2.5 rounded-xl w-full max-w-xs transition-all gap-3">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              placeholder="Search orders, appointments…"
              className="bg-transparent outline-none text-[13px] text-white placeholder:text-white/25 w-full"
            />
            <span className="text-[10px] text-white/20 font-mono bg-white/8 px-1.5 py-0.5 rounded hidden lg:block shrink-0">⌘K</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <button className="relative w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 rounded-xl transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold text-white leading-none">{user.name}</p>
                <p className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-[#6D4C91] rounded-lg flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                {user.name?.[0]?.toUpperCase() ?? 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8 bg-[#F2F1F8]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
