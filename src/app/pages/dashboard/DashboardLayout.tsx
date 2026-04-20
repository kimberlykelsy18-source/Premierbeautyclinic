import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingCart, CalendarDays, Box, Users, Settings, LogOut, Bell, Search, Menu, X, Lock, Eye, EyeOff, ShieldCheck, Truck, ShoppingBag, Calendar, AlertTriangle, CheckCheck, Layers, MessageSquare } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import logo from '../../../assets/logo.png';

// ── Notification types ───────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: 'order' | 'appointment' | 'low_stock';
  title: string;
  detail: string;
  time: string | null;
  link: string;
}

const LAST_SEEN_KEY = 'pbcNotifLastSeen';

function timeAgoShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function DashboardLayout() {
  const { user, token, sessionId, authLoading, logout, updateUser } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen]             = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Notifications ────────────────────────────────────────────────────────
  const [notifOpen, setNotifOpen]           = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading]     = useState(false);
  const [lastSeen, setLastSeen]             = useState<number>(() => {
    const v = localStorage.getItem(LAST_SEEN_KEY);
    return v ? parseInt(v, 10) : 0;
  });
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.time && new Date(n.time).getTime() > lastSeen).length;

  const fetchNotifications = () => {
    setNotifLoading(true);
    apiFetch('/admin/notifications', {}, token, sessionId)
      .then((data: Notification[]) => setNotifications(data))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  };

  useEffect(() => {
    if (user) fetchNotifications();
    // Refresh every 2 minutes
    const interval = setInterval(() => { if (user) fetchNotifications(); }, 120000);
    return () => clearInterval(interval);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleMarkAllRead = () => {
    const now = Date.now();
    localStorage.setItem(LAST_SEEN_KEY, String(now));
    setLastSeen(now);
  };

  const handleOpenNotif = () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen) fetchNotifications();
  };

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
    { name: 'Reviews',      path: '/staff/reviews',       icon: MessageSquare, permission: 'manage_reviews' },
    { name: 'Services',     path: '/staff/services',      icon: Layers, permission: 'admin' },
    { name: 'Customers',    path: '/staff/customers',     icon: Users,   permission: 'admin' },
    { name: 'Shipping',     path: '/staff/shipping',      icon: Truck,   permission: 'admin' },
    { name: 'Settings',     path: '/staff/settings',      icon: Settings, permission: 'admin' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const isRestricted = (item: typeof navItems[0]) => {
    if (!item.permission) return false;
    if (user?.role === 'admin') return false;
    if (item.permission === 'admin') return true;
    return !((user as any)?.permissions ?? []).includes(item.permission);
  };

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

            {/* ── Notification Bell ───────────────────────────────────────── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotif}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${notifOpen ? 'text-white bg-white/12' : 'text-white/50 hover:text-white hover:bg-white/8'}`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-[340px] bg-white rounded-[24px] shadow-2xl border border-gray-100 z-[150] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <div>
                        <h3 className="text-[14px] font-bold">Notifications</h3>
                        {unreadCount > 0 && (
                          <p className="text-[11px] text-[#6D4C91] font-semibold mt-0.5">{unreadCount} unread</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-[#6D4C91] transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark read
                          </button>
                        )}
                        <button onClick={() => setNotifOpen(false)} className="p-1 text-gray-300 hover:text-gray-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifLoading ? (
                        <div className="p-6 space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                              <div className="flex-grow space-y-2 pt-1">
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-12 flex flex-col items-center text-gray-300">
                          <Bell className="w-8 h-8 mb-3 opacity-40" />
                          <p className="text-[12px] font-bold uppercase tracking-widest">All caught up</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map(notif => {
                            const isUnread = notif.time && new Date(notif.time).getTime() > lastSeen;
                            const Icon = notif.type === 'order'
                              ? ShoppingBag
                              : notif.type === 'appointment'
                                ? Calendar
                                : AlertTriangle;
                            const iconBg = notif.type === 'order'
                              ? 'bg-blue-50 text-blue-500'
                              : notif.type === 'appointment'
                                ? 'bg-[#6D4C91]/10 text-[#6D4C91]'
                                : 'bg-amber-50 text-amber-500';
                            return (
                              <Link
                                key={notif.id}
                                to={notif.link}
                                onClick={() => setNotifOpen(false)}
                                className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-[#F8F5FF]' : ''}`}
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-[13px] leading-snug ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                      {notif.title}
                                    </p>
                                    {isUnread && <span className="w-2 h-2 rounded-full bg-[#6D4C91] shrink-0 mt-1.5" />}
                                  </div>
                                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{notif.detail}</p>
                                  {notif.time && (
                                    <p className="text-[10px] text-gray-300 mt-1 font-medium">{timeAgoShort(notif.time)}</p>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                        <button
                          onClick={() => { fetchNotifications(); }}
                          className="w-full text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
