import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingCart, CalendarDays, Box, Users, Settings, LogOut, Bell, Search, Menu, X, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../../../assets/logo.png';

export function DashboardLayout() {
  const { user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Simple protection for the prototype
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      // For the sake of the prototype demo, we'll allow viewing but show a warning
      // In a real app, we'd navigate away: navigate('/login');
    }
  }, [user, navigate]);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Appointments', path: '/dashboard/appointments', icon: CalendarDays },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Box },
    { name: 'Customers', path: '/dashboard/customers', icon: Users, permission: 'admin' },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings, permission: 'admin' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRestricted = (item: typeof navItems[0]) => {
    return item.permission === 'admin' && user?.role !== 'admin';
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Sidebar */}
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
            const isActive = location.pathname === item.path;
            const restricted = isRestricted(item);

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
                  <ShieldAlert className="w-4 h-4 ml-auto text-amber-500" />
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

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center bg-[#F8F9FA] px-4 py-2 rounded-xl w-full max-w-md border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input placeholder="Search orders, appointments..." className="bg-transparent outline-none text-[14px] w-full" />
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-gray-100" />
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-[14px] font-bold leading-none mb-1">{user?.name || 'Staff Member'}</p>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest">{user?.role || 'Staff'}</p>
              </div>
              <div className="w-10 h-10 bg-[#6D4C91]/10 rounded-xl flex items-center justify-center text-[#6D4C91] font-bold">
                {user?.name?.[0].toUpperCase() || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 bg-[#F8F9FA]">
          {(!user || (user.role !== 'admin' && user.role !== 'employee')) && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-8 flex items-center space-x-4">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-[14px] text-amber-800 font-bold">Guest View Mode</p>
                <p className="text-[12px] text-amber-700">You are currently viewing the dashboard as a prototype. Some administrative functions may be locked.</p>
              </div>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
