import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { User, Mail, LogOut, Trash2, ChevronRight, Save, Shield, ShoppingBag, Calendar, MapPin, Phone, Package, RefreshCw, X } from 'lucide-react';
import { useFeedback } from '../components/Feedback';
import { ButtonWithLoading } from '../components/Loading';

// Mock data - replace with API calls
const MOCK_ORDERS = [
  { 
    id: 'ORD-1002', 
    items: [
      { name: 'Vitamin C Serum', price: 4500, quantity: 1, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop' },
      { name: 'Hyaluronic Acid', price: 3200, quantity: 2, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop' },
    ], 
    total: 10900, 
    status: 'Delivered', 
    date: 'Feb 18, 2026',
    shippingAddress: 'Westlands, Nairobi'
  },
  { 
    id: 'ORD-1003', 
    items: [
      { name: 'Retinol Night Cream', price: 5800, quantity: 1, image: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=100&h=100&fit=crop' },
    ], 
    total: 5800, 
    status: 'Processing', 
    date: 'Feb 20, 2026',
    shippingAddress: 'Karen, Nairobi'
  },
];

const MOCK_BOOKINGS = [
  {
    id: 'BK-301',
    service: 'Comprehensive Skin Analysis',
    type: 'Consultation',
    date: 'Feb 25, 2026',
    time: '2:30 PM',
    practitioner: 'Dr. Sarah Kimani',
    status: 'Confirmed',
    deposit: 2000
  },
  {
    id: 'BK-302',
    service: 'Acne Treatment Session',
    type: 'Treatment',
    date: 'Mar 5, 2026',
    time: '10:00 AM',
    practitioner: 'Dr. Michael Odhiambo',
    status: 'Confirmed',
    deposit: 3500
  }
];

export function Account() {
  const { user, logout, updateUser, formatPrice, shippingRegions } = useStore();
  const { showFeedback } = useFeedback();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });

  // Address form data
  const [addressData, setAddressData] = useState({
    county: user?.savedAddress?.county || '',
    city: user?.savedAddress?.city || '',
    streetAddress: user?.savedAddress?.streetAddress || '',
    building: user?.savedAddress?.building || '',
    additionalInfo: user?.savedAddress?.additionalInfo || ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
      setAddressData({
        county: user.savedAddress?.county || '',
        city: user.savedAddress?.city || '',
        streetAddress: user.savedAddress?.streetAddress || '',
        building: user.savedAddress?.building || '',
        additionalInfo: user.savedAddress?.additionalInfo || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    showFeedback('success', 'Signed Out', 'You have been successfully signed out.');
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      logout();
      showFeedback('error', 'Account Deleted', 'Your account has been permanently deleted.');
      navigate('/');
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email) {
      showFeedback('error', 'Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location
      });

      setIsEditing(false);
      showFeedback('success', 'Profile Updated', 'Your profile information has been saved successfully.');
    } catch (error) {
      showFeedback('error', 'Update Failed', 'There was an error updating your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressData.county || !addressData.city || !addressData.streetAddress) {
      showFeedback('error', 'Missing Information', 'Please fill in all required address fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateUser({
        savedAddress: {
          county: addressData.county,
          city: addressData.city,
          streetAddress: addressData.streetAddress,
          building: addressData.building,
          additionalInfo: addressData.additionalInfo
        }
      });

      setIsEditingAddress(false);
      showFeedback('success', 'Address Saved', 'Your delivery address has been saved and will be used for future orders.');
    } catch (error) {
      showFeedback('error', 'Update Failed', 'There was an error saving your address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to add items back to cart
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showFeedback('success', 'Added to Cart', 'Items from this order have been added to your cart.');
      setTimeout(() => navigate('/cart'), 1500);
    } catch (error) {
      showFeedback('error', 'Failed', 'Could not add items to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async (bookingId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showFeedback('success', 'Reschedule Request Sent', 'Our team will contact you to confirm a new date and time.');
      setSelectedBooking(null);
    } catch (error) {
      showFeedback('error', 'Failed', 'Could not process reschedule request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Your deposit will be refunded within 5-7 business days.')) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showFeedback('success', 'Booking Cancelled', 'Your booking has been cancelled and refund is being processed.');
      setSelectedBooking(null);
    } catch (error) {
      showFeedback('error', 'Cancellation Failed', 'Could not cancel booking. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'appointments', label: 'Bookings', icon: Calendar },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="pt-[100px] md:pt-[140px] pb-16 md:pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Sidebar */}
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

          {/* Content Area */}
          <main className="flex-grow bg-white rounded-2xl md:rounded-[32px] p-6 md:p-12 shadow-sm border border-gray-100">
            <AnimatePresence mode="wait">
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
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                            value={formData.location || 'Not set'}
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
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            location: user.location || ''
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
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 md:space-y-10"
                >
                  <h2 className="text-[24px] md:text-[32px] font-serif text-[#1A1A1A]">Order History</h2>
                  <div className="space-y-4">
                    {MOCK_ORDERS.map(order => (
                      <div key={order.id} className="border border-gray-100 rounded-2xl md:rounded-3xl overflow-hidden hover:border-[#6D4C91]/30 transition-all">
                        {/* Order Header */}
                        <div className="p-5 md:p-6 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order {order.id}</p>
                            <p className="text-[14px] md:text-[15px] font-medium">{order.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>{order.status}</span>
                            <button
                              onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                              className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#6D4C91] hover:underline"
                            >
                              {selectedOrder === order.id ? 'Hide' : 'View'} Details
                            </button>
                          </div>
                        </div>

                        {/* Order Details (Expandable) */}
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
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                      <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] md:text-[14px] font-bold truncate">{item.name}</p>
                                        <p className="text-[12px] md:text-[13px] text-gray-400">Qty: {item.quantity}</p>
                                      </div>
                                      <p className="text-[14px] md:text-[15px] font-bold">{formatPrice(item.price)}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Summary */}
                                <div className="pt-4 border-t border-gray-100">
                                  <div className="flex justify-between text-[13px] md:text-[14px] mb-2">
                                    <span className="text-gray-500">Shipping to:</span>
                                    <span className="font-medium">{order.shippingAddress}</span>
                                  </div>
                                  <div className="flex justify-between text-[15px] md:text-[16px] font-bold">
                                    <span>Total:</span>
                                    <span className="text-[#6D4C91]">{formatPrice(order.total)}</span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <ButtonWithLoading
                                  isLoading={isLoading}
                                  onClick={() => handleReorder(order.id)}
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
                </motion.div>
              )}

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

                  <div className="space-y-4">
                    {MOCK_BOOKINGS.map(booking => (
                      <div key={booking.id} className="p-6 md:p-8 border border-gray-100 rounded-2xl md:rounded-[32px] bg-white hover:shadow-xl hover:shadow-[#6D4C91]/5 transition-all">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                          <div className="flex items-start space-x-3 md:space-x-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FDFBF7] rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#6D4C91]" />
                            </div>
                            <div>
                              <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-1">{booking.type}</p>
                              <h3 className="text-[16px] md:text-[20px] font-serif">{booking.service}</h3>
                              <p className="text-[12px] md:text-[13px] text-gray-400 mt-1">Booking ID: {booking.id}</p>
                            </div>
                          </div>
                          <span className="px-3 md:px-4 py-1.5 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full text-[11px] md:text-[12px] font-bold whitespace-nowrap">
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 py-5 md:py-6 border-y border-gray-50 mb-6">
                          <div>
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date & Time</p>
                            <p className="text-[14px] md:text-[15px]">{booking.date} • {booking.time}</p>
                          </div>
                          <div>
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Practitioner</p>
                            <p className="text-[14px] md:text-[15px]">{booking.practitioner}</p>
                          </div>
                          <div>
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Deposit Paid</p>
                            <p className="text-[14px] md:text-[15px] font-bold text-[#6D4C91]">{formatPrice(booking.deposit)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                          <ButtonWithLoading
                            isLoading={isLoading && selectedBooking === booking.id}
                            onClick={() => {
                              setSelectedBooking(booking.id);
                              handleReschedule(booking.id);
                            }}
                            className="flex-1 py-3 md:py-4 border border-gray-200 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                          >
                            Reschedule
                          </ButtonWithLoading>
                          <ButtonWithLoading
                            isLoading={isLoading && selectedBooking === booking.id}
                            onClick={() => {
                              setSelectedBooking(booking.id);
                              handleCancelBooking(booking.id);
                            }}
                            className="flex-1 py-3 md:py-4 border border-red-100 text-red-500 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                          >
                            Cancel & Refund
                          </ButtonWithLoading>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

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
                    {/* Marketing Emails - ON by default */}
                    <div className="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl flex items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-[15px] md:text-[16px] mb-1">Marketing Emails</p>
                        <p className="text-gray-500 text-[13px] md:text-[14px] leading-relaxed">
                          Receive promotional updates, special offers, and new arrivals. You're currently subscribed.
                        </p>
                      </div>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer flex-shrink-0">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                      </div>
                    </div>

                    {/* Password Change */}
                    <div className="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl flex items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-[15px] md:text-[16px] mb-1">Password</p>
                        <p className="text-gray-500 text-[13px] md:text-[14px]">Last changed 30 days ago</p>
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