import { FAQsManagementContent } from '../components/FAQsManagement';
import { DashboardInventory } from './dashboard/DashboardInventory';
import { ContentManagement } from '../components/ContentManagement';
import { ShippingManagement } from '../components/ShippingManagement';
import { BookingsManagement } from '../components/BookingsManagement';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Calendar, 
  Users, 
  Settings, 
  HelpCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  UserPlus,
  Download,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Home,
  Truck,
  Bell,
  Shield,
  Eye,
  Check,
  Clock
} from 'lucide-react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading, FullScreenLoading } from '../components/Loading';

type DashboardTab = 'overview' | 'orders' | 'bookings' | 'customers' | 'products' | 'faqs' | 'content' | 'shipping' | 'staff' | 'settings';

// Mock data
const MOCK_ORDERS = [
  { id: 'ORD-1001', customer: 'Jane Doe', items: 3, total: 12500, status: 'Processing', date: '2026-02-23', time: '10:30 AM' },
  { id: 'ORD-1002', customer: 'John Smith', items: 1, total: 2800, status: 'Delivered', date: '2026-02-22', time: '2:15 PM' },
  { id: 'ORD-1003', customer: 'Mary Johnson', items: 5, total: 18900, status: 'Pending', date: '2026-02-23', time: '11:45 AM' },
];

const MOCK_BOOKINGS = [
  { id: 'BK-301', customer: 'Alice Williams', service: 'Skin Analysis', date: '2026-02-25', time: '2:30 PM', status: 'Confirmed', practitioner: 'Dr. Sarah Kimani' },
  { id: 'BK-302', customer: 'Bob Anderson', service: 'Consultation', date: '2026-02-26', time: '10:00 AM', status: 'Pending', practitioner: 'Dr. Michael Odhiambo' },
  { id: 'BK-303', customer: 'Carol Martinez', service: 'Facial Treatment', date: '2026-02-24', time: '3:00 PM', status: 'Completed', practitioner: 'Dr. Sarah Kimani' },
];

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Jane Doe', email: 'jane@example.com', phone: '0712345678', orders: 15, spent: 45000, joined: '2025-08-15' },
  { id: '2', name: 'John Smith', email: 'john@example.com', phone: '0723456789', orders: 8, spent: 28000, joined: '2025-10-22' },
  { id: '3', name: 'Mary Johnson', email: 'mary@example.com', phone: '0734567890', orders: 22, spent: 67500, joined: '2025-06-10' },
];

const MOCK_STAFF = [
  { id: '1', name: 'Dr. Sarah Kimani', role: 'Practitioner', email: 'sarah@premierclinic.co.ke', phone: '0701234567', permissions: ['bookings', 'orders', 'customers'] },
  { id: '2', name: 'Michael Ochieng', role: 'Sales Assistant', email: 'michael@premierclinic.co.ke', phone: '0712345678', permissions: ['orders'] },
  { id: '3', name: 'Dr. Michael Odhiambo', role: 'Practitioner', email: 'michael.o@premierclinic.co.ke', phone: '0723456789', permissions: ['bookings', 'customers'] },
];

export function Dashboard() {
  const { user, logout, formatPrice, shippingRegions, updateShippingRegion } = useStore();
  const { showFeedback } = useFeedback();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return <FullScreenLoading />;

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    logout();
    showFeedback('success', 'Signed Out', 'You have been signed out successfully.');
    navigate('/');
  };

  // Define tabs based on role
  const tabs: { id: DashboardTab; label: string; icon: any; adminOnly?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users, adminOnly: true },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'content', label: 'Content', icon: Home },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'staff', label: 'Staff', icon: Shield, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[32px] md:text-[48px] font-serif mb-2 italic">
              {isAdmin ? 'Admin Console' : 'Employee Dashboard'}
            </h1>
            <p className="text-[14px] md:text-[16px] text-gray-500">
              Welcome back, {user.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-6 py-3 border border-red-200 text-red-500 rounded-full text-[12px] md:text-[13px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="space-y-1">
                {visibleTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-[13px] md:text-[14px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#6D4C91] text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-[24px] md:text-[32px] font-serif">Dashboard Overview</h2>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-[#6D4C91] to-[#5a3e79] p-6 rounded-2xl text-white">
                      <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8" />
                        <TrendingUp className="w-5 h-5 text-white/60" />
                      </div>
                      <p className="text-[13px] uppercase tracking-widest text-white/80 mb-1">Revenue (Today)</p>
                      <p className="text-[28px] font-bold">{formatPrice(245000)}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <ShoppingBag className="w-8 h-8 text-[#6D4C91]" />
                        <span className="text-[12px] text-green-600 font-bold">+12%</span>
                      </div>
                      <p className="text-[13px] uppercase tracking-widest text-gray-400 mb-1">Orders</p>
                      <p className="text-[28px] font-bold">47</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-8 h-8 text-[#6D4C91]" />
                        <span className="text-[12px] text-amber-600 font-bold">Pending</span>
                      </div>
                      <p className="text-[13px] uppercase tracking-widest text-gray-400 mb-1">Bookings</p>
                      <p className="text-[28px] font-bold">8</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-[#6D4C91]" />
                        <span className="text-[12px] text-blue-600 font-bold">+5 New</span>
                      </div>
                      <p className="text-[13px] uppercase tracking-widest text-gray-400 mb-1">Customers</p>
                      <p className="text-[28px] font-bold">1,234</p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-[18px] md:text-[20px] font-serif mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[
                        { type: 'order', message: 'New order #ORD-1003 received', time: '5 min ago', icon: ShoppingBag },
                        { type: 'booking', message: 'Booking confirmed for Alice Williams', time: '15 min ago', icon: Calendar },
                        { type: 'customer', message: 'New customer registration', time: '1 hour ago', icon: Users },
                      ].map((activity, idx) => (
                        <div key={idx} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <activity.icon className="w-5 h-5 text-[#6D4C91]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-medium">{activity.message}</p>
                            <p className="text-[12px] text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <OrdersManagement 
                  orders={MOCK_ORDERS} 
                  formatPrice={formatPrice}
                  showFeedback={showFeedback}
                />
              )}

              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <BookingsManagement 
                  bookings={MOCK_BOOKINGS}
                  showFeedback={showFeedback}
                />
              )}

              {/* CUSTOMERS TAB (Admin Only) */}
              {activeTab === 'customers' && isAdmin && (
                <CustomersManagement 
                  customers={MOCK_CUSTOMERS}
                  formatPrice={formatPrice}
                  showFeedback={showFeedback}
                />
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="space-y-0">
                  <DashboardInventory />
                </div>
              )}

              {/* FAQs TAB */}
              {activeTab === 'faqs' && (
                <FAQsManagementContent showFeedback={showFeedback} />
              )}

              {/* CONTENT TAB */}
              {activeTab === 'content' && (
                <ContentManagement />
              )}

              {/* SHIPPING TAB */}
              {activeTab === 'shipping' && (
                <ShippingManagement 
                  regions={shippingRegions}
                  updateRegion={updateShippingRegion}
                  formatPrice={formatPrice}
                  showFeedback={showFeedback}
                />
              )}

              {/* STAFF TAB (Admin Only) */}
              {activeTab === 'staff' && isAdmin && (
                <StaffManagement 
                  staff={MOCK_STAFF}
                  showFeedback={showFeedback}
                />
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <DashboardSettings 
                  user={user}
                  showFeedback={showFeedback}
                />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

// ORDERS MANAGEMENT COMPONENT
function OrdersManagement({ orders, formatPrice, showFeedback }: any) {
  const [isLoading, setIsLoading] = useState(false);

  const exportOrders = async (format: 'csv' | 'pdf') => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showFeedback('success', 'Export Complete', `Orders exported as ${format.toUpperCase()} successfully.`);
    } catch (error) {
      showFeedback('error', 'Export Failed', 'Could not export orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showFeedback('success', 'Status Updated', `Order ${orderId} status updated to ${status}.`);
    } catch (error) {
      showFeedback('error', 'Update Failed', 'Could not update order status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-[24px] md:text-[32px] font-serif">Orders Management</h2>
        <div className="flex gap-3">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => exportOrders('csv')}
            className="flex items-center space-x-2 px-5 py-3 bg-gray-100 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </ButtonWithLoading>
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => exportOrders('pdf')}
            className="flex items-center space-x-2 px-5 py-3 bg-gray-100 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </ButtonWithLoading>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-5 md:p-6 bg-gray-50 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Order {order.id}
                </p>
                <p className="text-[15px] font-medium">{order.customer}</p>
                <p className="text-[13px] text-gray-500">{order.date} at {order.time}</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <p className="text-[18px] font-bold text-[#6D4C91]">{formatPrice(order.total)}</p>
                <select
                  defaultValue={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border-none bg-white cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="p-5 md:p-6 flex items-center justify-between border-t border-gray-100">
              <p className="text-[13px] text-gray-500">{order.items} items</p>
              <button className="text-[12px] font-bold uppercase tracking-widest text-[#6D4C91] hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// CUSTOMERS MANAGEMENT COMPONENT (Admin Only)
function CustomersManagement({ customers, formatPrice, showFeedback }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  const exportCustomers = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showFeedback('success', 'Export Complete', 'Customers exported as CSV successfully.');
    } catch (error) {
      showFeedback('error', 'Export Failed', 'Could not export customers.');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      showFeedback('error', 'Missing Fields', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showFeedback('success', 'Customer Added', `${newCustomer.name} has been added successfully.`);
      setShowAddModal(false);
      setNewCustomer({ name: '', email: '', phone: '' });
    } catch (error) {
      showFeedback('error', 'Add Failed', 'Could not add customer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="customers"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-[24px] md:text-[32px] font-serif">Customers Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-[#6D4C91] text-white rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={exportCustomers}
            className="flex items-center space-x-2 px-5 py-3 bg-gray-100 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </ButtonWithLoading>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Name</th>
              <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Email</th>
              <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Phone</th>
              <th className="text-center py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Orders</th>
              <th className="text-right py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Spent</th>
              <th className="text-right py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: any) => (
              <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 text-[14px] font-medium">{customer.name}</td>
                <td className="py-4 px-4 text-[14px] text-gray-600">{customer.email}</td>
                <td className="py-4 px-4 text-[14px] text-gray-600">{customer.phone}</td>
                <td className="py-4 px-4 text-[14px] text-center">{customer.orders}</td>
                <td className="py-4 px-4 text-[14px] text-right font-bold">{formatPrice(customer.spent)}</td>
                <td className="py-4 px-4 text-right">
                  <button className="text-[#6D4C91] hover:underline text-[12px] font-bold uppercase tracking-widest">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setShowAddModal(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 w-full max-w-lg"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[24px] font-serif">Add New Customer</h3>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#6D4C91]/20"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#6D4C91]/20"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#6D4C91]/20"
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                </div>

                <ButtonWithLoading
                  isLoading={isLoading}
                  onClick={addCustomer}
                  className="w-full bg-[#6D4C91] text-white py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                >
                  Add Customer
                </ButtonWithLoading>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// STAFF MANAGEMENT COMPONENT (Admin Only)
function StaffManagement({ staff, showFeedback }: any) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [staffList, setStaffList] = useState(staff);
  
  // New staff form
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    password: '',
    permissions: [] as string[]
  });

  // Available permissions
  const availablePermissions = [
    { id: 'orders', label: 'Orders Management', description: 'View and manage customer orders' },
    { id: 'bookings', label: 'Bookings Management', description: 'Manage appointments and consultations' },
    { id: 'customers', label: 'Customer Management', description: 'View and manage customer data' },
    { id: 'products', label: 'Products Management', description: 'Manage inventory and products' },
    { id: 'faqs', label: 'FAQs Management', description: 'Edit frequently asked questions' },
    { id: 'content', label: 'Content Management', description: 'Edit website content and promotions' },
    { id: 'shipping', label: 'Shipping Management', description: 'Manage shipping regions and rates' },
    { id: 'reports', label: 'View Reports', description: 'Access analytics and reports' },
  ];

  const predefinedRoles = [
    { 
      name: 'Practitioner', 
      permissions: ['bookings', 'customers', 'reports'],
      description: 'Medical staff managing consultations'
    },
    { 
      name: 'Sales Assistant', 
      permissions: ['orders', 'customers', 'products'],
      description: 'Handle orders and customer service'
    },
    { 
      name: 'Content Manager', 
      permissions: ['content', 'faqs', 'products'],
      description: 'Manage website content and products'
    },
    { 
      name: 'Operations Manager', 
      permissions: ['orders', 'bookings', 'customers', 'products', 'shipping', 'reports'],
      description: 'Full operational access'
    },
  ];

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.phone.trim() || !newStaff.role.trim()) {
      showFeedback('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }

    if (!newStaff.email.includes('@')) {
      showFeedback('error', 'Validation Error', 'Please enter a valid email address');
      return;
    }

    if (newStaff.permissions.length === 0) {
      showFeedback('error', 'Validation Error', 'Please select at least one permission');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const staff = {
        id: Date.now().toString(),
        ...newStaff
      };
      
      setStaffList([...staffList, staff]);
      setNewStaff({ name: '', role: '', email: '', phone: '', password: '', permissions: [] });
      setShowAddModal(false);
      setIsLoading(false);
      showFeedback('success', 'Staff Added', `${staff.name} has been added successfully`);
    }, 1000);
  };

  const handleEditPermissions = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setShowEditPermissionsModal(true);
  };

  const handleSavePermissions = () => {
    if (!selectedStaff || selectedStaff.permissions.length === 0) {
      showFeedback('error', 'Validation Error', 'Please select at least one permission');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setStaffList(staffList.map((s: any) => 
        s.id === selectedStaff.id ? selectedStaff : s
      ));
      setShowEditPermissionsModal(false);
      setSelectedStaff(null);
      setIsLoading(false);
      showFeedback('success', 'Permissions Updated', 'Staff permissions have been updated successfully');
    }, 1000);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(staffList.filter((s: any) => s.id !== staffId));
      showFeedback('success', 'Staff Removed', 'Staff member has been removed successfully');
    }
  };

  const togglePermission = (permission: string, isNewStaff = false) => {
    if (isNewStaff) {
      setNewStaff({
        ...newStaff,
        permissions: newStaff.permissions.includes(permission)
          ? newStaff.permissions.filter(p => p !== permission)
          : [...newStaff.permissions, permission]
      });
    } else if (selectedStaff) {
      setSelectedStaff({
        ...selectedStaff,
        permissions: selectedStaff.permissions.includes(permission)
          ? selectedStaff.permissions.filter((p: string) => p !== permission)
          : [...selectedStaff.permissions, permission]
      });
    }
  };

  const applyRoleTemplate = (template: any) => {
    setNewStaff({
      ...newStaff,
      role: template.name,
      permissions: [...template.permissions]
    });
    showFeedback('success', 'Role Applied', `${template.name} permissions have been applied`);
  };

  return (
    <motion.div
      key="staff"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-[24px] md:text-[32px] font-serif">Staff Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-5 py-3 bg-[#6D4C91] text-white rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all w-full md:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="space-y-4">
        {staffList.map((member: any) => (
          <div key={member.id} className="border border-gray-100 rounded-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div>
                <p className="text-[16px] md:text-[18px] font-serif mb-1">{member.name}</p>
                <p className="text-[12px] md:text-[13px] text-gray-500 uppercase tracking-widest font-bold">{member.role}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditPermissions(member)}
                  className="text-[#6D4C91] hover:underline text-[11px] md:text-[12px] font-bold uppercase tracking-widest"
                >
                  Edit Permissions
                </button>
                <button 
                  onClick={() => handleDeleteStaff(member.id)}
                  className="text-red-600 hover:underline text-[11px] md:text-[12px] font-bold uppercase tracking-widest"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email</p>
                <p className="text-[13px] md:text-[14px] break-all">{member.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                <p className="text-[13px] md:text-[14px]">{member.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {member.permissions.map((perm: string) => (
                  <span key={perm} className="px-3 py-1 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => !isLoading && setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-3xl bg-white rounded-2xl md:rounded-[32px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-8 border-b border-gray-100 bg-[#FDFBF7] flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-serif font-bold">Add New Staff Member</h3>
                  <p className="text-[12px] md:text-[13px] text-gray-500">Create account and set permissions</p>
                </div>
                <button 
                  onClick={() => !isLoading && setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-8 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-[14px] md:text-[16px] font-bold mb-4">Basic Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Full Name *</label>
                        <input
                          type="text"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                          placeholder="e.g., Dr. Sarah Kimani"
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Email Address *</label>
                          <input
                            type="email"
                            value={newStaff.email}
                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                            placeholder="sarah@premierclinic.co.ke"
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Phone Number *</label>
                          <input
                            type="tel"
                            value={newStaff.phone}
                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                            placeholder="0701234567"
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Role/Position *</label>
                          <input
                            type="text"
                            value={newStaff.role}
                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                            placeholder="e.g., Practitioner"
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Initial Password</label>
                          <input
                            type="password"
                            value={newStaff.password}
                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                            placeholder="Temporary password"
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Role Templates */}
                  <div>
                    <h4 className="text-[14px] md:text-[16px] font-bold mb-3">Quick Role Templates</h4>
                    <p className="text-[12px] md:text-[13px] text-gray-500 mb-4">Apply predefined permissions for common roles</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {predefinedRoles.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => applyRoleTemplate(template)}
                          disabled={isLoading}
                          className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#6D4C91] hover:bg-[#6D4C91]/5 transition-all text-left"
                        >
                          <p className="text-[13px] md:text-[14px] font-bold mb-1">{template.name}</p>
                          <p className="text-[11px] md:text-[12px] text-gray-500 mb-2">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.permissions.slice(0, 3).map(perm => (
                              <span key={perm} className="text-[9px] md:text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                {perm}
                              </span>
                            ))}
                            {template.permissions.length > 3 && (
                              <span className="text-[9px] md:text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                +{template.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="text-[14px] md:text-[16px] font-bold mb-3">Access Permissions *</h4>
                    <p className="text-[12px] md:text-[13px] text-gray-500 mb-4">Select what this staff member can access</p>
                    <div className="space-y-2">
                      {availablePermissions.map((perm) => (
                        <button
                          key={perm.id}
                          onClick={() => togglePermission(perm.id, true)}
                          disabled={isLoading}
                          className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                            newStaff.permissions.includes(perm.id)
                              ? 'border-[#6D4C91] bg-[#6D4C91]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-[13px] md:text-[14px] font-bold mb-1">{perm.label}</p>
                              <p className="text-[11px] md:text-[12px] text-gray-500">{perm.description}</p>
                            </div>
                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              newStaff.permissions.includes(perm.id)
                                ? 'bg-[#6D4C91] border-[#6D4C91]'
                                : 'border-gray-300'
                            }`}>
                              {newStaff.permissions.includes(perm.id) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isLoading}
                  className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <ButtonWithLoading
                  onClick={handleAddStaff}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="bg-[#6D4C91] text-white px-6 py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff Member
                </ButtonWithLoading>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Permissions Modal */}
      <AnimatePresence>
        {showEditPermissionsModal && selectedStaff && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => !isLoading && setShowEditPermissionsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-2xl bg-white rounded-2xl md:rounded-[32px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-8 border-b border-gray-100 bg-[#FDFBF7] flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-serif font-bold">Edit Permissions</h3>
                  <p className="text-[12px] md:text-[13px] text-gray-500">{selectedStaff.name} - {selectedStaff.role}</p>
                </div>
                <button 
                  onClick={() => !isLoading && setShowEditPermissionsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-8">
                  <p className="text-[12px] md:text-[13px] text-gray-500 mb-4">Select what {selectedStaff.name.split(' ')[0]} can access in the dashboard</p>
                  <div className="space-y-2">
                    {availablePermissions.map((perm) => (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(perm.id, false)}
                        disabled={isLoading}
                        className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                          selectedStaff.permissions.includes(perm.id)
                            ? 'border-[#6D4C91] bg-[#6D4C91]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-[13px] md:text-[14px] font-bold mb-1">{perm.label}</p>
                            <p className="text-[11px] md:text-[12px] text-gray-500">{perm.description}</p>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedStaff.permissions.includes(perm.id)
                              ? 'bg-[#6D4C91] border-[#6D4C91]'
                              : 'border-gray-300'
                          }`}>
                            {selectedStaff.permissions.includes(perm.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowEditPermissionsModal(false)}
                  disabled={isLoading}
                  className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <ButtonWithLoading
                  onClick={handleSavePermissions}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Permissions
                </ButtonWithLoading>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// DASHBOARD SETTINGS COMPONENT
function DashboardSettings({ user, showFeedback }: any) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-[24px] md:text-[32px] font-serif">Dashboard Settings</h2>
      
      <div className="space-y-4">
        <div className="p-6 bg-gray-50 rounded-2xl">
          <p className="font-bold text-[16px] mb-1">Notifications</p>
          <p className="text-gray-500 text-[14px] mb-4">Receive email notifications for new orders and bookings</p>
          <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-2xl">
          <p className="font-bold text-[16px] mb-1">Account Type</p>
          <p className="text-gray-500 text-[14px]">{user.role === 'admin' ? 'Administrator' : 'Employee'}</p>
        </div>
      </div>
    </motion.div>
  );
}