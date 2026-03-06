import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, Calendar, Users, ArrowUpRight, ArrowDownRight, DollarSign, Download, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';

// Fallback chart data shown to non-admins (chart is blurred/locked anyway)
const MOCK_DATA = [
  { name: 'Mon', sales: 4000, appointments: 2400 },
  { name: 'Tue', sales: 3000, appointments: 1398 },
  { name: 'Wed', sales: 2000, appointments: 9800 },
  { name: 'Thu', sales: 2780, appointments: 3908 },
  { name: 'Fri', sales: 1890, appointments: 4800 },
  { name: 'Sat', sales: 2390, appointments: 3800 },
];

interface SalesSummaryRow {
  period?: string;
  day?: string;
  week?: string;
  date?: string;
  name?: string;
  sales?: number;
  total_sales?: number;
  total_revenue?: number;
  appointments?: number;
  appointment_count?: number;
  order_count?: number;
}

interface RecentOrder {
  id: string;
  total: number;
  created_at: string;
  profiles: { full_name: string | null } | null;
  order_items: { products: { name: string } | null }[];
}

interface RecentAppointment {
  id: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  services: { name: string } | null;
}

interface ActivityResponse {
  recentOrders: RecentOrder[];
  recentAppointments: RecentAppointment[];
  newCustomersCount: number;
  totalOrdersCount: number;
  totalAppointmentsCount: number;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'appointment';
  user: string;
  detail: string;
  amount: string;
  time: string;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function formatPeriod(period: string): string {
  // period is "YYYY-MM-DD" from the RPC
  const d = new Date(period + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function transformSalesData(raw: SalesSummaryRow[]): { name: string; sales: number; appointments: number }[] {
  // Reverse so the chart reads oldest → newest (left → right)
  return [...raw].reverse().map(row => ({
    name:         row.period ? formatPeriod(row.period) : (row.name || row.day || row.week || row.date || '—'),
    sales:        row.sales ?? row.total_sales ?? row.total_revenue ?? 0,
    appointments: row.appointments ?? row.appointment_count ?? 0,
  }));
}

export function DashboardOverview() {
  const { user, token, sessionId, formatPrice } = useStore();
  const isAdmin = user?.role === 'admin';

  const [allChartData, setAllChartData]          = useState<{ name: string; sales: number; appointments: number }[]>([]);
  const [chartRange, setChartRange]              = useState<7 | 30>(7);
  const [totalRevenue, setTotalRevenue]          = useState<number | null>(null);
  const [totalOrders, setTotalOrders]            = useState<number | null>(null);
  const [totalAppointments, setTotalAppointments] = useState<number | null>(null);
  const [recentActivity, setRecentActivity]      = useState<ActivityItem[]>([]);
  const [newCustomersCount, setNewCustomersCount] = useState<number | null>(null);
  const [activityLoading, setActivityLoading]    = useState(true);

  useEffect(() => {
    // Sales chart + revenue — admin only
    if (isAdmin) {
      apiFetch('/admin/sales', {}, token, sessionId)
        .then((data: SalesSummaryRow[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllChartData(transformSalesData(data));
            const rev = data.reduce((s, r) => s + (r.sales ?? r.total_sales ?? r.total_revenue ?? 0), 0);
            if (rev > 0) setTotalRevenue(rev);
          }
        })
        .catch(() => {/* fall back to mock chart */});
    }

    // Recent activity + counts — all roles
    apiFetch('/admin/recent-activity', {}, token, sessionId)
      .then((data: ActivityResponse) => {
        type SortableItem = ActivityItem & { _ts: number };

        const orderItems: SortableItem[] = (data.recentOrders || []).map(o => {
          const firstName = o.order_items[0]?.products?.name;
          const extra     = o.order_items.length > 1 ? ` + ${o.order_items.length - 1} other${o.order_items.length > 2 ? 's' : ''}` : '';
          return {
            id:     String(o.id),
            type:   'order',
            user:   o.profiles?.full_name || 'Guest',
            detail: firstName ? `Purchased ${firstName}${extra}` : 'Placed an order',
            amount: formatPrice(o.total),
            time:   timeAgo(o.created_at),
            _ts:    new Date(o.created_at).getTime(),
          };
        });

        const apptItems: SortableItem[] = (data.recentAppointments || []).map(a => ({
          id:     String(a.id),
          type:   'appointment',
          user:   a.profiles?.full_name || 'Client',
          detail: `Scheduled ${a.services?.name || 'appointment'}`,
          amount: '—',
          time:   timeAgo(a.created_at),
          _ts:    new Date(a.created_at).getTime(),
        }));

        const combined = [...orderItems, ...apptItems]
          .sort((a, b) => b._ts - a._ts)
          .slice(0, 5)
          .map(({ _ts, ...rest }): ActivityItem => rest);

        setRecentActivity(combined);
        setNewCustomersCount(data.newCustomersCount        ?? 0);
        setTotalOrders(data.totalOrdersCount               ?? 0);
        setTotalAppointments(data.totalAppointmentsCount   ?? 0);
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setActivityLoading(false));
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slice to the selected range; fall back to MOCK_DATA while loading
  const chartData = allChartData.length > 0 ? allChartData.slice(-chartRange) : MOCK_DATA;

  const stats = [
    {
      label: 'Total Revenue',
      value: totalRevenue != null ? `KES ${(totalRevenue / 1000).toFixed(0)}K` : 'KES —',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      restricted: true,
    },
    {
      label: 'Total Orders',
      value: totalOrders != null ? String(totalOrders) : '—',
      change: '+8.2%',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Appointments',
      value: totalAppointments != null ? String(totalAppointments) : '—',
      change: '-2.4%',
      icon: Calendar,
      color: 'text-[#6D4C91]',
      bg: 'bg-[#6D4C91]/5',
    },
    {
      label: 'New Customers',
      value: newCustomersCount != null ? String(newCustomersCount) : '—',
      change: '+18.1%',
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Operations Overview</h1>
          <p className="text-gray-500">Welcome back. Here's what's happening at Premier Beauty Clinic today.</p>
        </div>
        {isAdmin && (
          <button className="flex items-center space-x-2 bg-white border border-gray-200 px-6 py-3 rounded-xl text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const isLocked = stat.restricted && !isAdmin;
          return (
            <div key={i} className={`bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden ${isLocked ? 'grayscale opacity-80' : ''}`}>
              {isLocked && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                  <Lock className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Admin Only</p>
                </div>
              )}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {!isLocked && (
                  <div className={`flex items-center text-[12px] font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-[28px] font-bold">{isLocked ? '••••••' : stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden ${!isAdmin ? 'min-h-[300px]' : ''}`}>
          {!isAdmin && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-12">
              <div className="bg-red-50 p-6 rounded-full mb-6">
                <Lock className="w-10 h-10 text-red-600" />
              </div>
              <h4 className="text-[20px] font-bold mb-2">Financial Analytics Restricted</h4>
              <p className="text-gray-500 max-w-sm mx-auto">Access to Sales vs Appointments comparisons and revenue charts is restricted to administrators only.</p>
            </div>
          )}

          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[18px] font-bold">Sales vs Appointments</h3>
            {isAdmin && (
              <select
                value={chartRange}
                onChange={e => setChartRange(Number(e.target.value) as 7 | 30)}
                className="bg-[#F8F9FA] border-none text-[12px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg outline-none"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            )}
          </div>

          <div className="h-[400px]">
            {isAdmin && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6D4C91" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6D4C91" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="sales"        stroke="#6D4C91" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="appointments" stroke="#1A1A1A" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-[18px] font-bold mb-8">Recent Activity</h3>

          {activityLoading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
                  <div className="flex-grow space-y-2 pt-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-[13px]">No recent activity yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {recentActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex space-x-4">
                  <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${activity.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-[#6D4C91]/10 text-[#6D4C91]'}`}>
                    {activity.type === 'order' ? <ShoppingBag className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-[14px] font-bold truncate">{activity.user}</p>
                      <span className="text-[11px] text-gray-400 shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-[12px] text-gray-500 mb-1 truncate">{activity.detail}</p>
                    <p className="text-[13px] font-bold">{isAdmin ? activity.amount : '••••••'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="w-full mt-10 py-4 border border-gray-100 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
