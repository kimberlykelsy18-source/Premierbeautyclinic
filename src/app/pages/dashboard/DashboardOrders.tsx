import { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, ChevronRight, CheckCircle2, Clock, XCircle, ShoppingBag, MapPin, Phone, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const ORDERS = [
  { id: '#ORD-7821', customer: 'Sarah Kimani', date: 'Feb 18, 2026', status: 'Delivered', amount: 'KES 12,400', items: 3 },
  { id: '#ORD-7822', customer: 'James Omondi', date: 'Feb 18, 2026', status: 'Processing', amount: 'KES 5,800', items: 2 },
  { id: '#ORD-7823', customer: 'Anita Wanjiku', date: 'Feb 17, 2026', status: 'Shipped', amount: 'KES 3,200', items: 1 },
  { id: '#ORD-7824', customer: 'David Kipkorir', date: 'Feb 17, 2026', status: 'Processing', amount: 'KES 15,900', items: 4 },
  { id: '#ORD-7825', customer: 'Lydia Muthoni', date: 'Feb 16, 2026', status: 'Delivered', amount: 'KES 2,800', items: 1 },
];

export function DashboardOrders() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const filteredOrders = useMemo(() => {
    return ORDERS.filter(order => {
      const matchesFilter = filter === 'All' || order.status === filter;
      const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           order.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const STATUSES = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    if (newStatus === 'Cancelled' && !refundReason) {
      toast.error('Please provide a refund reason');
      return;
    }
    
    // In real app, call API to update order status
    if (newStatus === 'Cancelled') {
      toast.success(`Order ${selectedOrder?.id} cancelled. Refund of ${selectedOrder?.amount} initiated.`);
    } else {
      toast.success(`Order ${selectedOrder?.id} updated to ${newStatus}`);
    }
    setSelectedOrder(null);
    setNewStatus('');
    setRefundReason('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Order Management</h1>
          <p className="text-gray-500">Track, process, and manage customer product purchases.</p>
        </div>
        <button className="bg-white text-black border border-gray-100 px-6 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm active:scale-95">
          <Download className="w-4 h-4 mr-2" />
          <span>Export Orders</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex p-1 bg-white border border-gray-100 rounded-full w-full md:w-auto overflow-x-auto no-scrollbar">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === s ? 'bg-[#6D4C91] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-white px-4 py-3 rounded-full w-full md:w-80 border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-[#6D4C91]/20 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-3" />
          <input 
            placeholder="Search orders..." 
            className="bg-transparent outline-none text-[13px] w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative min-h-[400px]">
        {filteredOrders.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="w-12 h-12 text-gray-100 mb-4" />
            <h3 className="text-[18px] font-serif mb-2">No orders found</h3>
            <p className="text-gray-400 text-[14px]">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Amount</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="px-8 py-6 text-[14px] font-bold text-[#6D4C91]">{order.id}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold">{order.customer}</span>
                        <span className="text-[11px] text-gray-400 uppercase tracking-tighter">{order.items} Items</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[14px] text-gray-500">{order.date}</td>
                    <td className="px-8 py-6 text-[14px] font-bold">{order.amount}</td>
                    <td className="px-8 py-6">
                      <span className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                        order.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                        {order.status === 'Processing' && <Clock className="w-3 h-3" />}
                        {order.status === 'Shipped' && <ShoppingBag className="w-3 h-3" />}
                        {order.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-[#6D4C91] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100 active:scale-90"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">Order Details</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><XCircle className="w-6 h-6" /></button>
              </div>
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Customer Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-[14px]">
                        <div className="w-8 h-8 rounded-full bg-[#6D4C91]/10 flex items-center justify-center text-[#6D4C91] font-bold">{selectedOrder.customer.charAt(0)}</div>
                        <span className="font-bold">{selectedOrder.customer}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-500 text-[14px]"><Mail className="w-4 h-4" /> <span>customer@example.com</span></div>
                      <div className="flex items-center space-x-3 text-gray-500 text-[14px]"><Phone className="w-4 h-4" /> <span>+254 7XX XXX XXX</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Shipping Address</h3>
                    <div className="flex items-start space-x-3 text-[14px] text-gray-600">
                      <MapPin className="w-4 h-4 shrink-0 mt-1" />
                      <div>
                        <p>Delta Corner Towers, 7th Floor</p>
                        <p>Westlands, Nairobi, KE</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-gray-100">
                  <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Order Items</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-100"><img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=100" className="w-full h-full object-cover" /></div>
                        <div>
                          <p className="text-[14px] font-bold">Glow Boosting Serum</p>
                          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Qty: {selectedOrder.items}</p>
                        </div>
                      </div>
                      <span className="text-[14px] font-bold">{selectedOrder.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-[14px]">Subtotal</span>
                    <span className="font-bold text-[14px]">{selectedOrder.amount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-[14px]">Shipping</span>
                    <span className="font-bold text-[14px]">KES 500</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="font-serif text-[18px]">Total</span>
                    <span className="font-serif text-[20px] font-bold text-[#6D4C91]">{selectedOrder.amount}</span>
                  </div>
                </div>

                {/* Manual Status Update Section */}
                <div className="pt-8 border-t border-gray-100 space-y-4">
                  <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Order Status
                  </h3>
                  <div className="space-y-3">
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
                    >
                      <option value="">Select new status...</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled (Refund)</option>
                    </select>
                    {newStatus === 'Cancelled' && (
                      <textarea 
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        rows={3}
                        placeholder="Reason for cancellation and refund..."
                        className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-[14px] resize-none"
                      />
                    )}
                    {newStatus === 'Cancelled' && (
                      <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl border border-red-100">
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-[12px] text-red-700">
                          <p className="font-bold mb-1">Refund will be initiated automatically</p>
                          <p>Amount: {selectedOrder.amount} will be refunded via M-Pesa within 3-5 business days.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex space-x-4">
                <button 
                  onClick={handleStatusUpdate}
                  disabled={!newStatus}
                  className="flex-grow bg-[#6D4C91] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-[#5a3e79] active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-[#6D4C91] flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Status
                </button>
                <button className="px-8 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-gray-100 active:scale-95 transition-all">Print Invoice</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}