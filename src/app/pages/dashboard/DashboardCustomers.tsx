import { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, ChevronRight, UserPlus, Download } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';

interface ApiCustomer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  orders: { id: string; total: number; created_at: string; status: string }[];
}

interface DisplayCustomer {
  rawId: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  lastOrder: string | null;
  totalSpent: number;
  orders: number;
  status: 'Active' | 'Inactive';
  joinedAt: string;
}

function mapCustomer(c: ApiCustomer): DisplayCustomer {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const lastOrderDate = c.orders.length > 0
    ? c.orders.reduce((latest, o) => o.created_at > latest ? o.created_at : latest, c.orders[0].created_at)
    : null;

  const isActive = lastOrderDate ? new Date(lastOrderDate) > ninetyDaysAgo : false;
  const totalSpent = c.orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return {
    rawId: c.id,
    id: c.id.slice(-6).toUpperCase(),
    name: c.full_name || 'Unknown',
    email: c.email || '—',
    phone: c.phone || '—',
    lastOrder: lastOrderDate,
    totalSpent,
    orders: c.orders.length,
    status: isActive ? 'Active' : 'Inactive',
    joinedAt: c.created_at,
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return 'No orders yet';
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DashboardCustomers() {
  const { token, sessionId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<DisplayCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/customers', {}, token, sessionId)
      .then((data: ApiCustomer[]) => setCustomers((data || []).map(mapCustomer)))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = customers.filter(c =>
    [c.name, c.email, c.phone].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Derived stats
  const activeCount   = customers.filter(c => c.status === 'Active').length;
  const totalOrders   = customers.reduce((s, c) => s + c.orders, 0);
  const totalRevenue  = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const now = new Date();
  const newThisMonth  = customers.filter(c => {
    const d = new Date(c.joinedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const exportCustomersCSV = () => {
    const rows = [
      ['Customer ID', 'Name', 'Email', 'Phone', 'Total Spent (KES)', 'Orders', 'Status', 'Joined', 'Last Order'],
      ...filtered.map(c => [
        `#${c.id}`,
        c.name,
        c.email,
        c.phone,
        String(c.totalSpent),
        String(c.orders),
        c.status,
        formatDate(c.joinedAt),
        formatDate(c.lastOrder),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Customer Relations</h1>
          <p className="text-gray-500">View and manage your client database and history.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportCustomersCSV} className="bg-white text-black border border-gray-100 px-6 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            <span>Export CSV</span>
          </button>
          <button className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center shadow-lg active:scale-95">
            <UserPlus className="w-5 h-5 mr-2" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Total Customers</p>
          <p className="text-[28px] font-bold">{loading ? '—' : customers.length.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 font-bold">All registered profiles</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Active Clients</p>
          <p className="text-[28px] font-bold">{loading ? '—' : activeCount.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 font-bold">
            {loading || customers.length === 0 ? '—' : `${Math.round((activeCount / customers.length) * 100)}% of total base`}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Avg. Order Value</p>
          <p className="text-[28px] font-bold">{loading ? '—' : `KES ${avgOrderValue.toLocaleString()}`}</p>
          <p className="text-[11px] text-gray-400 font-bold">Across {totalOrders} orders</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">New This Month</p>
          <p className="text-[28px] font-bold">{loading ? '—' : newThisMonth}</p>
          <p className="text-[11px] text-gray-400 font-bold">Joined this calendar month</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center bg-[#F8F9FA] px-4 py-3 rounded-2xl w-full max-w-md border border-gray-100 focus-within:ring-2 focus-within:ring-[#6D4C91]/20 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input
              placeholder="Search by name, email, or phone..."
              className="bg-transparent outline-none text-[14px] w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 border border-gray-100 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-[13px] font-bold uppercase tracking-widest">Loading customers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-gray-400 text-[15px]">{searchTerm ? 'No customers match your search.' : 'No customers found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Contact</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Spent</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Orders</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Last Order</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cust) => (
                  <tr key={cust.rawId} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full flex items-center justify-center font-bold text-[14px]">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold">{cust.name}</p>
                          <p className="text-[12px] text-gray-400">#{cust.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-[13px] text-gray-600">
                          <Mail className="w-3 h-3 mr-2" />
                          {cust.email}
                        </div>
                        <div className="flex items-center text-[13px] text-gray-600">
                          <Phone className="w-3 h-3 mr-2" />
                          {cust.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[14px] font-bold">KES {cust.totalSpent.toLocaleString()}</td>
                    <td className="px-8 py-6 text-[14px]">{cust.orders}</td>
                    <td className="px-8 py-6 text-[14px] text-gray-500">{formatDate(cust.lastOrder)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        cust.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
