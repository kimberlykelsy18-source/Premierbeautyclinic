import { useState, useMemo, useEffect } from 'react';
import { Search, Download, CheckCircle2, Clock, XCircle, ShoppingBag, MapPin, Mail, ExternalLink, RefreshCw, CreditCard, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { apiFetch, toShortOrderId } from '../../lib/api';
import logoUrl from '../../../assets/logo.png';

interface ApiOrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  products: { name: string } | null;
}

interface ApiPayment {
  status: string | null;
  checkout_request_id: string | null;
  mpesa_receipt: string | null;
  failure_reason: string | null;
  phone: string | null;
}

interface ApiOrder {
  id: string;
  order_number: number | null;
  status: string;
  created_at: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  customer_email: string | null;
  shipping_address: {
    street?: string;
    building?: string;
    city?: string;
    county?: string;
    additionalInfo?: string;
    raw?: string;
  } | null;
  order_items: ApiOrderItem[];
  payments: ApiPayment[] | null;
}

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function mapStatus(status: string) {
  const map: Record<string, string> = {
    pending: 'Processing',
    paid: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] ?? (status.charAt(0).toUpperCase() + status.slice(1));
}

function formatAddress(addr: ApiOrder['shipping_address']) {
  if (!addr) return '—';
  if (addr.raw) return addr.raw;
  return [addr.street, addr.building, addr.city, addr.county].filter(Boolean).join(', ') || '—';
}

// Derives the effective payment status, falling back to order.status when the
// payments join returns no records (e.g. schema cache lag or RLS edge case).
function resolvePayment(order: ApiOrder) {
  const pay = order.payments?.[0] ?? null;
  const rawStatus = pay?.status ?? null;

  // Infer from order status when no payment record is present
  const effectiveStatus = rawStatus ?? (
    order.status === 'paid' || order.status === 'delivered' || order.status === 'shipped' ? 'paid' :
    order.status === 'cancelled' ? 'failed' :
    'pending'
  );

  const isPaid   = effectiveStatus === 'paid' || effectiveStatus === 'completed' || !!pay?.mpesa_receipt;
  const isFailed = effectiveStatus === 'failed';
  const payLabel = isPaid ? 'Paid' : isFailed ? 'Failed' : 'Pending';

  // For cancelled orders with no explicit failure reason, use a default
  const failureReason = pay?.failure_reason ?? (
    isFailed && !rawStatus ? 'Network Timeout — no callback received from M-Pesa' : null
  );

  return { pay, isPaid, isFailed, payLabel, failureReason };
}

function printInvoice(order: ApiOrder, logoSrc: string) {
  const { payLabel, pay, failureReason } = resolvePayment(order);
  const shortId = toShortOrderId(order.order_number);
  const orderDate = new Date(order.created_at).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const itemsRows = (order.order_items || []).map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">${item.products?.name ?? 'Product'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:right;">KES ${Number(item.price_at_time).toLocaleString()}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:right;font-weight:600;">KES ${(item.price_at_time * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const payBadgeColor = payLabel === 'Paid' ? '#16a34a' : payLabel === 'Failed' ? '#dc2626' : '#d97706';
  const payBg         = payLabel === 'Paid' ? '#f0fdf4' : payLabel === 'Failed' ? '#fef2f2' : '#fffbeb';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${shortId} · Premier Beauty Clinic</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#fff; color:#1a1a1a; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display:none !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:680px;margin:32px auto;padding:0 24px;">

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:24px;border-bottom:2px solid #1a1a1a;margin-bottom:32px;">
      <img src="${logoSrc}" alt="Premier Beauty Clinic" style="height:52px;object-fit:contain;" />
      <div style="text-align:right;">
        <p style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">INVOICE</p>
        <p style="font-size:13px;color:#6b7280;margin-top:4px;">${shortId}</p>
        <p style="font-size:13px;color:#6b7280;">${orderDate}</p>
      </div>
    </div>

    <!-- Bill To + Payment Info -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px;">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:8px;">Billed To</p>
        <p style="font-size:14px;font-weight:600;">${order.customer_email || 'Guest Customer'}</p>
        <p style="font-size:13px;color:#6b7280;margin-top:6px;line-height:1.5;">${formatAddress(order.shipping_address)}</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:8px;">Payment</p>
        <span style="display:inline-block;background:${payBg};color:${payBadgeColor};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${payLabel}</span>
        ${pay?.mpesa_receipt ? `<p style="font-size:12px;color:#6b7280;margin-top:6px;">Receipt: <strong>${pay.mpesa_receipt}</strong></p>` : ''}
        ${pay?.phone ? `<p style="font-size:12px;color:#6b7280;margin-top:2px;">Phone: ${pay.phone}</p>` : ''}
        ${failureReason ? `<p style="font-size:11px;color:#dc2626;margin-top:6px;">${failureReason}</p>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#fafaf9;">
          <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Unit Price</th>
          <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:40px;">
      <div style="width:240px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280;">
          <span>Subtotal</span><span>KES ${Number(order.subtotal).toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">
          <span>Shipping</span><span>KES ${Number(order.shipping_fee).toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 6px;font-size:16px;font-weight:700;">
          <span>Total</span><span style="color:#6D4C91;">KES ${Number(order.total).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;">
      <p style="font-size:12px;color:#9ca3af;">Premier Beauty Clinic · Nairobi, Kenya</p>
      <p style="font-size:12px;color:#9ca3af;margin-top:4px;">Thank you for your order!</p>
    </div>

    <!-- Print button (hidden when printing) -->
    <div class="no-print" style="text-align:center;margin-top:32px;">
      <button onclick="window.print()" style="background:#6D4C91;color:#fff;border:none;padding:12px 32px;border-radius:9999px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;">
        Save as PDF / Print
      </button>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=780,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function DashboardOrders() {
  const { token, sessionId } = useStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    return apiFetch('/admin/orders', {}, token, sessionId)
      .then((data: ApiOrder[]) => setOrders(data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const displayOrders = useMemo(() => {
    return orders.filter(order => {
      const displayStatus = mapStatus(order.status);
      const matchesFilter = filter === 'All' || displayStatus === filter;
      const shortId = toShortOrderId(order.order_number);
      const customer = order.customer_email || 'Guest';
      const matchesSearch =
        customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shortId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, searchTerm]);

  const STATUSES = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const handleStatusUpdate = async () => {
    if (!newStatus) { toast.error('Please select a status'); return; }
    if (newStatus === 'Cancelled' && !refundReason) { toast.error('Please provide a refund reason'); return; }
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      if (newStatus === 'Delivered') {
        await apiFetch(
          `/admin/orders/${selectedOrder.id}/deliver`,
          { method: 'POST', body: JSON.stringify({ notes: 'Marked as delivered from dashboard' }) },
          token, sessionId
        );
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'delivered' } : o));
        toast.success(`${toShortOrderId(selectedOrder.order_number)} marked as delivered`);
      } else if (newStatus === 'Shipped') {
        await apiFetch(
          `/admin/orders/${selectedOrder.id}/status`,
          { method: 'PATCH', body: JSON.stringify({ status: 'shipped' }) },
          token, sessionId
        );
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'shipped' } : o));
        toast.success(`${toShortOrderId(selectedOrder.order_number)} marked as shipped`);
      } else if (newStatus === 'Processing') {
        await apiFetch(
          `/admin/orders/${selectedOrder.id}/status`,
          { method: 'PATCH', body: JSON.stringify({ status: 'pending' }) },
          token, sessionId
        );
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'pending' } : o));
        toast.success(`Order status reset to Processing`);
      } else if (newStatus === 'Cancelled') {
        await apiFetch(
          `/admin/orders/${selectedOrder.id}/status`,
          { method: 'PATCH', body: JSON.stringify({ status: 'cancelled', notes: refundReason }) },
          token, sessionId
        );
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'cancelled' } : o));
        toast.success('Order cancelled. Process refund manually via M-Pesa.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
      setSelectedOrder(null);
      setNewStatus('');
      setRefundReason('');
    }
  };

  const exportOrdersCSV = () => {
    const rows = [
      ['Order ID', 'Customer', 'Date', 'Amount (KES)', 'Payment Status', 'M-Pesa Receipt', 'Transaction ID', 'Failure Reason', 'Order Status', 'Items', 'Shipping Address'],
      ...displayOrders.map(o => {
        const { payLabel, pay } = resolvePayment(o);
        return [
          toShortOrderId(o.order_number),
          o.customer_email || 'Guest',
          formatOrderDate(o.created_at),
          String(o.total),
          payLabel,
          pay?.mpesa_receipt || '',
          pay?.checkout_request_id || '',
          pay?.failure_reason || '',
          mapStatus(o.status),
          (o.order_items || []).map(i => `${i.products?.name || 'Product'} x${i.quantity}`).join('; '),
          formatAddress(o.shipping_address),
        ];
      }),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Order Management</h1>
          <p className="text-gray-500">Loading orders...</p>
        </div>
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Order Management</h1>
          <p className="text-gray-500">Track, process, and manage customer product purchases.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="bg-white text-black border border-gray-100 px-5 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button onClick={exportOrdersCSV} className="bg-white text-black border border-gray-100 px-6 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm active:scale-95">
            <Download className="w-4 h-4 mr-2" />
            <span>Export Orders</span>
          </button>
        </div>
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
        {displayOrders.length === 0 ? (
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
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Payment</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayOrders.map((order) => {
                  const shortId = `#${toShortOrderId(order.order_number)}`;
                  const displayStatus = mapStatus(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors group">
                      <td className="px-8 py-6 text-[14px] font-bold text-[#6D4C91]">{shortId}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold">{order.customer_email || 'Guest Customer'}</span>
                          <span className="text-[11px] text-gray-400 uppercase tracking-tighter">{order.order_items?.length ?? 0} Items</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[14px] text-gray-500">{formatOrderDate(order.created_at)}</td>
                      <td className="px-8 py-6 text-[14px] font-bold">KES {order.total?.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        {(() => {
                          const { pay, isPaid, isFailed, payLabel, failureReason } = resolvePayment(order);
                          const colors = isPaid
                            ? 'bg-green-100 text-green-700'
                            : isFailed
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700';
                          const txnId = pay?.mpesa_receipt || pay?.checkout_request_id;
                          return (
                            <div className="flex flex-col gap-1">
                              <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit ${colors}`}>
                                <CreditCard className="w-3 h-3" />
                                <span>{payLabel}</span>
                              </span>
                              {txnId && <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]" title={txnId}>{txnId}</span>}
                              {isFailed && failureReason && (
                                <span className="text-[9px] text-red-400 truncate max-w-[140px]" title={failureReason}>{failureReason}</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit ${
                          displayStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                          displayStatus === 'Shipped'   ? 'bg-blue-100 text-blue-700' :
                          displayStatus === 'Processing'? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {displayStatus === 'Delivered'  && <CheckCircle2 className="w-3 h-3" />}
                          {displayStatus === 'Processing' && <Clock className="w-3 h-3" />}
                          {displayStatus === 'Shipped'    && <ShoppingBag className="w-3 h-3" />}
                          {displayStatus === 'Cancelled'  && <XCircle className="w-3 h-3" />}
                          <span>{displayStatus}</span>
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
                  );
                })}
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
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">#{toShortOrderId(selectedOrder.order_number)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><XCircle className="w-6 h-6" /></button>
              </div>
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Customer Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-[14px]">
                        <div className="w-8 h-8 rounded-full bg-[#6D4C91]/10 flex items-center justify-center text-[#6D4C91] font-bold">
                          {(selectedOrder.customer_email || 'G').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold">{selectedOrder.customer_email || 'Guest Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-500 text-[14px]">
                        <Mail className="w-4 h-4" />
                        <span>{selectedOrder.customer_email || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Shipping Address</h3>
                    <div className="flex items-start space-x-3 text-[14px] text-gray-600">
                      <MapPin className="w-4 h-4 shrink-0 mt-1" />
                      <p>{formatAddress(selectedOrder.shipping_address)}</p>
                    </div>
                  </div>
                </div>

                {(() => {
                  const { pay, isPaid, isFailed, payLabel, failureReason } = resolvePayment(selectedOrder);
                  const badgeColors = isPaid
                    ? 'bg-green-100 text-green-700'
                    : isFailed
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700';
                  return (
                    <div className="space-y-4 pt-8 border-t border-gray-100">
                      <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment Details
                      </h3>
                      <div className="p-4 rounded-2xl bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-gray-500">Payment Status</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeColors}`}>
                            {payLabel}
                          </span>
                        </div>
                        {isFailed && failureReason && (
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-[13px] text-gray-500 shrink-0">Failure Reason</span>
                            <span className="text-[12px] text-red-600 text-right">{failureReason}</span>
                          </div>
                        )}
                        {pay?.mpesa_receipt && (
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] text-gray-500">M-Pesa Receipt</span>
                            <span className="text-[13px] font-mono font-bold text-[#6D4C91]">{pay.mpesa_receipt}</span>
                          </div>
                        )}
                        {pay?.checkout_request_id && (
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] text-gray-500">Transaction ID</span>
                            <span className="text-[11px] font-mono text-gray-600 truncate max-w-[200px]" title={pay.checkout_request_id}>{pay.checkout_request_id}</span>
                          </div>
                        )}
                        {pay?.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] text-gray-500">M-Pesa Phone</span>
                            <span className="text-[13px] font-bold">{pay.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-4 pt-8 border-t border-gray-100">
                  <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Order Items</h3>
                  <div className="space-y-3">
                    {(selectedOrder.order_items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#6D4C91]/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#6D4C91]" />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold">{item.products?.name ?? 'Product'}</p>
                            <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-[14px] font-bold">KES {(item.price_at_time * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-[14px]">Subtotal</span>
                    <span className="font-bold text-[14px]">KES {selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-[14px]">Shipping</span>
                    <span className="font-bold text-[14px]">KES {selectedOrder.shipping_fee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="font-serif text-[18px]">Total</span>
                    <span className="font-serif text-[20px] font-bold text-[#6D4C91]">KES {selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>

                {['shipped', 'delivered', 'cancelled'].includes(selectedOrder.status) ? (
                  <div className="pt-8 border-t border-gray-100">
                    {selectedOrder.status === 'cancelled' ? (
                      <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="text-[13px] text-red-700">
                          <p className="font-bold mb-1">Order Cancelled</p>
                          <p>This order has been cancelled and cannot be updated further.</p>
                        </div>
                      </div>
                    ) : selectedOrder.status === 'delivered' ? (
                      <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div className="text-[13px] text-green-700">
                          <p className="font-bold mb-1">Order Delivered</p>
                          <p>This order has been delivered and cannot be updated further.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <ShoppingBag className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-[13px] text-blue-700">
                          <p className="font-bold mb-1">Order Shipped</p>
                          <p>This order has been shipped and cannot be updated further.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
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
                            <p>KES {selectedOrder.total?.toLocaleString()} will be refunded via M-Pesa within 3–5 business days.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 bg-gray-50 flex space-x-4">
                {!['shipped', 'delivered', 'cancelled'].includes(selectedOrder.status) && (
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || updatingStatus}
                    className="flex-grow bg-[#6D4C91] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-[#5a3e79] active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-[#6D4C91] flex items-center justify-center"
                  >
                    {updatingStatus
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      : <RefreshCw className="w-4 h-4 mr-2" />}
                    Update Status
                  </button>
                )}
                <button
                  onClick={() => printInvoice(selectedOrder, logoUrl)}
                  className={`${['shipped', 'delivered', 'cancelled'].includes(selectedOrder.status) ? 'flex-grow bg-[#6D4C91] text-white hover:bg-[#5a3e79]' : 'px-8 border border-gray-200 hover:bg-gray-100'} py-4 rounded-full font-bold uppercase tracking-widest text-[11px] active:scale-95 transition-all flex items-center justify-center`}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
