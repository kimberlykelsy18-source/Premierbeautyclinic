import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { User, Mail, LogOut, Trash2, Save, Shield, ShoppingBag, Calendar, MapPin, Phone, RefreshCw } from 'lucide-react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';
import { apiFetch, toShortOrderId, toShortAptId } from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ApiOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  products: {
    id: number;
    name: string;
    price: string;
    images: string[] | null;
  } | null;
}

interface ApiOrder {
  id: number;
  order_number: number | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: any;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: ApiOrderItem[];
}

interface ApiAppointment {
  id: number;
  appointment_number: number | null;
  service_id: number;
  appointment_time: string;
  deposit_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  services: { name: string } | null;
  payments: { status: string; mpesa_receipt: string | null; failure_reason: string | null }[] | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit',
  });
}

function formatAddress(addr: any): string {
  if (!addr) return '—';
  if (typeof addr === 'string') return addr;
  return [addr.street, addr.building, addr.city, addr.county].filter(Boolean).join(', ') || '—';
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'delivered':
    case 'confirmed':  return 'bg-green-100 text-green-700';
    case 'processing':
    case 'pending':    return 'bg-amber-100 text-amber-700';
    case 'cancelled':
    case 'failed':     return 'bg-red-100 text-red-700';
    default:           return 'bg-gray-100 text-gray-700';
  }
}

// Skeleton shown while orders / appointments are loading
function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map(i => (
        <div key={i} className="border border-gray-100 rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="p-5 md:p-6 bg-gray-50 flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-40" />
            </div>
            <div className="h-7 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Account() {
  const { user, logout, updateUser, formatPrice, shippingRegions, token, sessionId, addToCart } = useStore();
  const { showFeedback } = useFeedback();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]               = useState('profile');
  const [isEditing, setIsEditing]               = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [selectedOrder, setSelectedOrder]       = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking]   = useState<number | null>(null);

  // ── Real data ──
  const [orders, setOrders]                               = useState<ApiOrder[]>([]);
  const [loadingOrders, setLoadingOrders]                 = useState(true);
  const [appointments, setAppointments]                   = useState<ApiAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments]     = useState(true);

  // ── Marketing consent ──
  const [marketingEnabled, setMarketingEnabled]     = useState(user?.marketingEmails ?? false);
  const [togglingMarketing, setTogglingMarketing]   = useState(false);

  // ── Profile form ──
  // 'county' maps to user.savedAddress.county — shown in the Location field
  const [formData, setFormData] = useState({
    name:   user?.name  || '',
    email:  user?.email || '',
    phone:  user?.phone || '',
    county: user?.savedAddress?.county || '',
  });

  // ── Delivery address form ──
  const [addressData, setAddressData] = useState({
    county:         user?.savedAddress?.county         || '',
    city:           user?.savedAddress?.city           || '',
    streetAddress:  user?.savedAddress?.streetAddress  || '',
    building:       user?.savedAddress?.building       || '',
    additionalInfo: user?.savedAddress?.additionalInfo || '',
  });

  // Re-sync forms when user context changes (e.g. after updateUser() calls)
  useEffect(() => {
    if (user) {
      setFormData({
        name:   user.name  || '',
        email:  user.email || '',
        phone:  user.phone || '',
        county: user.savedAddress?.county || '',
      });
      setAddressData({
        county:         user.savedAddress?.county         || '',
        city:           user.savedAddress?.city           || '',
        streetAddress:  user.savedAddress?.streetAddress  || '',
        building:       user.savedAddress?.building       || '',
        additionalInfo: user.savedAddress?.additionalInfo || '',
      });
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // ── Load order, appointment history, and profile from backend ──
  // All three requests fire in parallel on mount.
  // We only run this when user is present (token is available).
  useEffect(() => {
    if (!user) return;

    apiFetch('/orders', {}, token, sessionId)
      .then((data: ApiOrder[]) => setOrders(data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));

    apiFetch('/appointments', {}, token, sessionId)
      .then((data: ApiAppointment[]) => setAppointments(data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoadingAppointments(false));

    // Load real marketing_consent from profile
    apiFetch('/profile', {}, token, sessionId)
      .then((data: any) => setMarketingEnabled(Boolean(data.marketing_consent)))
      .catch(() => {/* keep default */});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  // ── Handlers ──

  const handleLogout = () => {
    logout();
    showFeedback('success', 'Signed Out', 'You have been successfully signed out.');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await apiFetch('/account', { method: 'DELETE' }, token, sessionId);
      logout();
      showFeedback('success', 'Account Deleted', 'Your account has been permanently deleted.');
      navigate('/');
    } catch (err: any) {
      showFeedback('error', 'Delete Failed', err.message || 'Could not delete account. Please contact support.');
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email) {
      showFeedback('error', 'Missing Information', 'Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: formData.name, phone: formData.phone }),
      }, token, sessionId);
      updateUser({
        name:  formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setIsEditing(false);
      showFeedback('success', 'Profile Updated', 'Your profile information has been saved.');
    } catch (err: any) {
      showFeedback('error', 'Update Failed', err.message || 'Could not save profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Address save is also local-only — address is used at checkout as a pre-fill
  const handleSaveAddress = async () => {
    if (!addressData.county || !addressData.city || !addressData.streetAddress) {
      showFeedback('error', 'Missing Information', 'Please fill in all required address fields.');
      return;
    }
    setIsLoading(true);
    try {
      updateUser({
        savedAddress: {
          county:         addressData.county,
          city:           addressData.city,
          streetAddress:  addressData.streetAddress,
          building:       addressData.building,
          additionalInfo: addressData.additionalInfo,
        }
      });
      setIsEditingAddress(false);
      showFeedback('success', 'Address Saved', 'Your delivery address will be pre-filled at checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder — adds every item from a past order back into the cart
  const handleReorder = (order: ApiOrder) => {
    const addable = order.order_items.filter(item => item.products);
    if (addable.length === 0) {
      showFeedback('info', 'Cannot Reorder', 'Product details are unavailable for this order.');
      return;
    }
    addable.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          id:          String(item.products!.id),
          name:        item.products!.name,
          price:       Number(item.products!.price),
          image:       item.products!.images?.[0] ?? '',
          category:    '',
          description: '',
        });
      }
    });
    showFeedback('success', 'Added to Cart', `${addable.length} item(s) added to your cart.`);
    setTimeout(() => navigate('/cart'), 1500);
  };

  // Marketing consent — toggle saves immediately to backend
  const handleMarketingToggle = async () => {
    const newValue = !marketingEnabled;
    setMarketingEnabled(newValue);
    setTogglingMarketing(true);
    try {
      await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ marketing_consent: newValue }),
      }, token, sessionId);
      updateUser({ marketingEmails: newValue });
      showFeedback('success', 'Preference Saved', newValue ? 'You are now subscribed to marketing emails.' : 'You have unsubscribed from marketing emails.');
    } catch {
      // Revert on error
      setMarketingEnabled(!newValue);
      showFeedback('error', 'Update Failed', 'Could not save your preference. Please try again.');
    } finally {
      setTogglingMarketing(false);
    }
  };

  // Reschedule / Cancel — no API yet, show a contact message
  const handleReschedule = () => {
    showFeedback('info', 'Contact Us to Reschedule', 'Please call or WhatsApp us to reschedule your appointment.');
    setSelectedBooking(null);
  };

  const handleCancelBooking = () => {
    showFeedback('info', 'Contact Us to Cancel', 'Please reach out to us directly to process a cancellation and refund.');
    setSelectedBooking(null);
  };

  const TABS = [
    { id: 'profile',      label: 'Profile Settings', icon: User },
    { id: 'orders',       label: 'Order History',    icon: ShoppingBag },
    { id: 'appointments', label: 'Bookings',          icon: Calendar },
    { id: 'security',     label: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-64 space-y-2">
            <div className="mb-6 md:mb-10 text-center lg:text-left px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#6D4C91] rounded-full flex items-center justify-center text-white text-[24px] md:text-[32px] font-serif mb-3 md:mb-4 mx-auto lg:mx-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-[20px] md:text-[24px] font-serif mb-1">{user.name}</h1>
              <p className="text-gray-400 text-[12px] md:text-[14px] uppercase tracking-widest font-bold">{user.role}</p>
            </div>

            <nav className="space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[13px] md:text-[14px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-[#6D4C91] shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>

            <div className="pt-6 md:pt-8 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[13px] md:text-[14px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Logout</span>
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center space-x-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete Account</span>
                <span className="sm:hidden">Delete</span>
              </button>
            </div>
          </aside>

          {/* ── Content Area ── */}
          <main className="flex-grow bg-white rounded-2xl md:rounded-[32px] p-6 md:p-12 shadow-sm border border-gray-100">
            <AnimatePresence mode="wait">

              {/* ───────────── Profile Tab ───────────── */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 md:space-y-10"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-[24px] md:text-[32px] font-serif text-[#1A1A1A]">Profile Information</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#6D4C91] hover:underline underline-offset-4"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        <input
                          disabled={!isEditing}
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] md:text-[15px] disabled:opacity-70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        <input
                          disabled={!isEditing}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] md:text-[15px] disabled:opacity-70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        <input
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="07XX XXX XXX"
                          className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] md:text-[15px] disabled:opacity-70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400">Location (County)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        {isEditing ? (
                          <select
                            value={formData.county}
                            onChange={(e) => setFormData({...formData, county: e.target.value})}
                            className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] md:text-[15px]"
                          >
                            <option value="">Select county</option>
                            {shippingRegions.map(region => (
                              <option key={region.id} value={region.county}>{region.county}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            disabled
                            value={formData.county || 'Not set'}
                            className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-none rounded-xl md:rounded-2xl outline-none text-[14px] md:text-[15px] disabled:opacity-70"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 md:gap-4">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name:   user.name  || '',
                            email:  user.email || '',
                            phone:  user.phone || '',
                            county: user.savedAddress?.county || '',
                          });
                        }}
                        className="px-6 md:px-8 py-3 md:py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[11px] md:text-[12px] hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <ButtonWithLoading
                        isLoading={isLoading}
                        onClick={handleSaveProfile}
                        className="flex-1 flex items-center justify-center space-x-2 bg-[#6D4C91] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold uppercase tracking-widest text-[11px] md:text-[12px] hover:bg-[#5a3e79] transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </ButtonWithLoading>
                    </div>
                  )}

                  {/* Saved Delivery Address */}
                  <div className="border-t border-gray-100 pt-8 md:pt-10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[18px] md:text-[22px] font-serif">Saved Delivery Address</h3>
                      {!isEditingAddress && (
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#6D4C91] hover:underline underline-offset-4"
                        >
                          {user.savedAddress ? 'Edit Address' : 'Add Address'}
                        </button>
                      )}
                    </div>

                    {!isEditingAddress ? (
                      user.savedAddress ? (
                        <div className="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl space-y-1 text-[14px] md:text-[15px] text-gray-600">
                          <p className="font-bold text-gray-900">{user.savedAddress.streetAddress}</p>
                          {user.savedAddress.building && <p>{user.savedAddress.building}</p>}
                          <p>{user.savedAddress.city}, {user.savedAddress.county}</p>
                          {user.savedAddress.additionalInfo && <p className="italic text-[13px]">{user.savedAddress.additionalInfo}</p>}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-[14px]">No saved address. Add one to speed up checkout.</p>
                      )
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">County *</label>
                          <select
                            value={addressData.county}
                            onChange={e => setAddressData({...addressData, county: e.target.value})}
                            className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border-transparent focus:border-[#6D4C91] outline-none transition-all text-[14px] md:text-[15px]"
                          >
                            <option value="">Select county</option>
                            {shippingRegions.map(r => <option key={r.id} value={r.county}>{r.county}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">City/Town *</label>
                          <input value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border-transparent focus:border-[#6D4C91] outline-none transition-all text-[14px] md:text-[15px]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Street Address *</label>
                          <input value={addressData.streetAddress} onChange={e => setAddressData({...addressData, streetAddress: e.target.value})} placeholder="e.g. Kimathi Street" className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border-transparent focus:border-[#6D4C91] outline-none transition-all text-[14px] md:text-[15px]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Building / Apt</label>
                          <input value={addressData.building} onChange={e => setAddressData({...addressData, building: e.target.value})} placeholder="e.g. Apt 5B" className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border-transparent focus:border-[#6D4C91] outline-none transition-all text-[14px] md:text-[15px]" />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setIsEditingAddress(false)} className="px-6 py-3 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-all">Cancel</button>
                          <ButtonWithLoading isLoading={isLoading} onClick={handleSaveAddress} className="flex-1 bg-[#6D4C91] text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-[#5a3e79] transition-all">
                            Save Address
                          </ButtonWithLoading>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───────────── Orders Tab ───────────── */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 md:space-y-10"
                >
                  <h2 className="text-[24px] md:text-[32px] font-serif text-[#1A1A1A]">Order History</h2>

                  {loadingOrders ? (
                    <HistorySkeleton />
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 text-[15px] mb-6">You haven't placed any orders yet.</p>
                      <Link to="/shop" className="inline-block bg-[#6D4C91] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] transition-all">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-gray-100 rounded-2xl md:rounded-3xl overflow-hidden hover:border-[#6D4C91]/30 transition-all">
                          {/* Order Header */}
                          <div className="p-5 md:p-6 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-1">{toShortOrderId(order.order_number)}</p>
                              <p className="text-[14px] md:text-[15px] font-medium">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                {formatStatus(order.status)}
                              </span>
                              <button
                                onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#6D4C91] hover:underline"
                              >
                                {selectedOrder === order.id ? 'Hide' : 'View'} Details
                              </button>
                            </div>
                          </div>

                          {/* Order Details (expandable) */}
                          <AnimatePresence>
                            {selectedOrder === order.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-5 md:p-6 space-y-4 border-t border-gray-100">
                                  {/* Items */}
                                  <div className="space-y-3">
                                    {order.order_items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-4">
                                        {item.products?.images?.[0] ? (
                                          <img
                                            src={item.products.images[0]}
                                            alt={item.products.name}
                                            className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gray-100 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] md:text-[14px] font-bold truncate">
                                            {item.products?.name ?? `Product #${item.product_id}`}
                                          </p>
                                          <p className="text-[12px] md:text-[13px] text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-[14px] md:text-[15px] font-bold flex-shrink-0">
                                          {formatPrice(item.price_at_time)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Summary */}
                                  <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between text-[13px] md:text-[14px]">
                                      <span className="text-gray-500">Shipping to:</span>
                                      <span className="font-medium text-right max-w-[60%]">{formatAddress(order.shipping_address)}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px] md:text-[14px]">
                                      <span className="text-gray-500">Shipping fee:</span>
                                      <span className="font-medium">{formatPrice(order.shipping_fee)}</span>
                                    </div>
                                    <div className="flex justify-between text-[15px] md:text-[16px] font-bold">
                                      <span>Total:</span>
                                      <span className="text-[#6D4C91]">{formatPrice(order.total)}</span>
                                    </div>
                                  </div>

                                  {/* Reorder button */}
                                  <ButtonWithLoading
                                    isLoading={isLoading}
                                    onClick={() => handleReorder(order)}
                                    className="w-full flex items-center justify-center space-x-2 py-3 md:py-4 bg-[#6D4C91] text-white rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[11px] md:text-[12px] hover:bg-[#5a3e79] transition-all"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Reorder</span>
                                  </ButtonWithLoading>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ───────────── Appointments Tab ───────────── */}
              {activeTab === 'appointments' && (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 md:space-y-10"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-[24px] md:text-[32px] font-serif text-[#1A1A1A]">Bookings</h2>
                    <Link to="/book" className="w-full sm:w-auto text-center bg-[#6D4C91] text-white px-5 md:px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] md:text-[12px] hover:bg-[#5a3e79] transition-all">
                      New Booking
                    </Link>
                  </div>

                  {loadingAppointments ? (
                    <HistorySkeleton />
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-16">
                      <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 text-[15px] mb-6">No appointments booked yet.</p>
                      <Link to="/book" className="inline-block bg-[#6D4C91] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] transition-all">
                        Book Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map(appt => {
                        const isFailed    = appt.status === 'failed';
                        const isCompleted = appt.status === 'completed';
                        const payment     = appt.payments?.[0] ?? null;
                        const failReason  = payment?.failure_reason ?? null;
                        return (
                          <div key={appt.id} className={`p-6 md:p-8 border rounded-2xl md:rounded-[32px] bg-white transition-all ${isFailed ? 'border-red-100 bg-red-50/30' : 'border-gray-100 hover:shadow-xl hover:shadow-[#6D4C91]/5'}`}>
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                              <div className="flex items-start space-x-3 md:space-x-4">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 ${isFailed ? 'bg-red-100' : 'bg-[#FDFBF7]'}`}>
                                  <Calendar className={`w-6 h-6 md:w-8 md:h-8 ${isFailed ? 'text-red-400' : 'text-[#6D4C91]'}`} />
                                </div>
                                <div>
                                  <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-1">Appointment</p>
                                  <h3 className="text-[16px] md:text-[20px] font-serif">{appt.services?.name ?? 'Service'}</h3>
                                  <p className="text-[12px] md:text-[13px] text-gray-400 mt-1">Booking Ref: {toShortAptId(appt.appointment_number)}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 md:px-4 py-1.5 rounded-full text-[11px] md:text-[12px] font-bold whitespace-nowrap ${getStatusColor(appt.status)}`}>
                                  {isFailed ? 'Payment Failed' : formatStatus(appt.status)}
                                </span>
                                {payment?.mpesa_receipt && (
                                  <span className="text-[11px] font-mono text-[#6D4C91]">{payment.mpesa_receipt}</span>
                                )}
                              </div>
                            </div>

                            {isFailed && failReason && (
                              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] text-red-600">
                                ⚠ {failReason}
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 py-5 md:py-6 border-y border-gray-50 mb-6">
                              <div>
                                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date & Time</p>
                                <p className="text-[14px] md:text-[15px]">
                                  {formatDate(appt.appointment_time)} · {formatTime(appt.appointment_time)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Fee</p>
                                <p className="text-[14px] md:text-[15px]">{formatPrice(appt.total_amount)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Deposit Paid</p>
                                <p className={`text-[14px] md:text-[15px] font-bold ${isFailed ? 'text-red-400' : 'text-[#6D4C91]'}`}>{formatPrice(appt.deposit_amount)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">{isCompleted ? 'Balance Paid' : 'Balance Due'}</p>
                                <p className="text-[14px] md:text-[15px]">{isCompleted ? <span className="text-green-600 font-bold">Fully Settled</span> : formatPrice(appt.total_amount - appt.deposit_amount)}</p>
                              </div>
                            </div>

                            {isFailed ? (
                              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700 text-center">
                                This booking was cancelled due to a failed payment. Please try booking again.
                              </div>
                            ) : !isCompleted && (
                              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <ButtonWithLoading
                                  isLoading={isLoading && selectedBooking === appt.id}
                                  onClick={() => { setSelectedBooking(appt.id); handleReschedule(); }}
                                  className="flex-1 py-3 md:py-4 border border-gray-200 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                  Reschedule
                                </ButtonWithLoading>
                                <ButtonWithLoading
                                  isLoading={isLoading && selectedBooking === appt.id}
                                  onClick={() => { setSelectedBooking(appt.id); handleCancelBooking(); }}
                                  className="flex-1 py-3 md:py-4 border border-red-100 text-red-500 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                                >
                                  Cancel & Refund
                                </ButtonWithLoading>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ───────────── Security Tab ───────────── */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 md:space-y-10"
                >
                  <h2 className="text-[24px] md:text-[32px] font-serif text-[#1A1A1A]">Privacy & Security</h2>
                  <div className="space-y-5 md:space-y-6">
                    <div className="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl flex items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-[15px] md:text-[16px] mb-1">Marketing Emails</p>
                        <p className="text-gray-500 text-[13px] md:text-[14px] leading-relaxed">
                          Receive promotional updates, special offers, and new arrivals.{' '}
                          {marketingEnabled ? "You're currently subscribed." : "You're currently unsubscribed."}
                        </p>
                      </div>
                      <button
                        onClick={handleMarketingToggle}
                        disabled={togglingMarketing}
                        aria-label={marketingEnabled ? 'Unsubscribe from marketing emails' : 'Subscribe to marketing emails'}
                        className={`w-12 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 disabled:opacity-50 ${marketingEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${marketingEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl flex items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-[15px] md:text-[16px] mb-1">Password</p>
                        <p className="text-gray-500 text-[13px] md:text-[14px]">Use the forgot password flow to reset your password.</p>
                      </div>
                      <Link
                        to="/login"
                        className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#6D4C91] hover:underline whitespace-nowrap"
                      >
                        Change
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
