import { useEffect, useState, lazy, Suspense } from 'react';

// Lazy-load SalesChart so recharts (~250 KB) is only fetched when an admin opens the overview
const SalesChart = lazy(() => import('./SalesChart'));
import type { ChartPoint } from './SalesChart';
import { ShoppingBag, Calendar, Users, ArrowUpRight, ArrowDownRight, DollarSign, Download, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';
import { timeAgo } from '../../lib/dateFormatters';

type ChartPeriod = 'daily' | 'monthly' | 'yearly';

// Fallback chart data shown to non-admins (chart is blurred/locked anyway)
const MOCK_DATA: ChartPoint[] = [
  { label: 'Mon', revenue: 42000, orders: 8,  appointments: 5 },
  { label: 'Tue', revenue: 31500, orders: 6,  appointments: 3 },
  { label: 'Wed', revenue: 58000, orders: 11, appointments: 7 },
  { label: 'Thu', revenue: 27000, orders: 5,  appointments: 4 },
  { label: 'Fri', revenue: 68500, orders: 14, appointments: 9 },
  { label: 'Sat', revenue: 79000, orders: 17, appointments: 11 },
];

interface RawSalesRow {
  period: string;   // YYYY-MM-DD | YYYY-MM | YYYY
  revenue: number;
  orders: number;
  appointments: number;
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

function formatPeriodLabel(period: string, type: ChartPeriod): string {
  if (type === 'daily') {
    const d = new Date(period + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (type === 'monthly') {
    const d = new Date(period + '-01T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  return period; // yearly — just the year
}

function transformSalesData(raw: RawSalesRow[], type: ChartPeriod): ChartPoint[] {
  return raw.map(row => ({
    label:        formatPeriodLabel(row.period, type),
    revenue:      row.revenue      ?? 0,
    orders:       row.orders       ?? 0,
    appointments: row.appointments ?? 0,
  }));
}

export function DashboardOverview() {
  const { user, token, sessionId, formatPrice } = useStore();
  const isAdmin = user?.role === 'admin';

  const [chartData, setChartData]                = useState<ChartPoint[]>([]);
  const [chartPeriod, setChartPeriod]            = useState<ChartPeriod>('daily');
  const [chartLoading, setChartLoading]          = useState(false);
  const [recentActivity, setRecentActivity]      = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading]    = useState(true);

  // Stat card values — sourced from /admin/stats
  interface StatValues {
    revenue:      { current: number; change: number; total: number };
    orders:       { current: number; change: number };
    appointments: { current: number; change: number };
    newCustomers: { current: number; change: number };
  }
  const [stats, setStats] = useState<StatValues | null>(null);

  // Refetch chart when period changes (admin only)
  // Fetch stat card KPIs (admin only — includes revenue which is restricted)
  useEffect(() => {
    if (!isAdmin) return;
    apiFetch('/admin/stats', {}, token, sessionId)
      .then((data: StatValues) => setStats(data))
      .catch(() => {/* silently ignore */});
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch chart when period changes (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    setChartLoading(true);
    apiFetch(`/admin/sales?period=${chartPeriod}`, {}, token, sessionId)
      .then((raw: RawSalesRow[]) => {
        if (Array.isArray(raw) && raw.length > 0) {
          setChartData(transformSalesData(raw, chartPeriod));
        } else {
          setChartData([]);
        }
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [isAdmin, chartPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {

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
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setActivityLoading(false));
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // While loading show mock data (blurred anyway for non-admins)
  const displayChartData = chartData.length > 0 ? chartData : MOCK_DATA;

  // Format a change value like +12.5% or -2.4%
  const fmtChange = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

  const statCards = [
    {
      label:      'Total Revenue',
      value:      stats ? formatPrice(stats.revenue.total) : 'KES —',
      change:     stats ? fmtChange(stats.revenue.change) : null,
      icon:       DollarSign,
      color:      'text-green-600',
      bg:         'bg-green-50',
      restricted: true,
    },
    {
      label:  'Total Orders',
      value:  stats ? String(stats.orders.current) : '—',
      change: stats ? fmtChange(stats.orders.change) : null,
      icon:   ShoppingBag,
      color:  'text-blue-600',
      bg:     'bg-blue-50',
    },
    {
      label:  'Appointments',
      value:  stats ? String(stats.appointments.current) : '—',
      change: stats ? fmtChange(stats.appointments.change) : null,
      icon:   Calendar,
      color:  'text-[#6D4C91]',
      bg:     'bg-[#6D4C91]/5',
    },
    {
      label:  'New Customers',
      value:  stats ? String(stats.newCustomers.current) : '—',
      change: stats ? fmtChange(stats.newCustomers.change) : null,
      icon:   Users,
      color:  'text-amber-600',
      bg:     'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-[24px] md:text-[32px] font-serif font-bold italic mb-2">Operations Overview</h1>
          <p className="text-gray-500 text-[14px] md:text-base">Welcome back. Here's what's happening at Premier Beauty Clinic today.</p>
        </div>
        {isAdmin && (
          <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 md:px-6 py-3 rounded-xl text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm self-start sm:self-auto">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const isLocked   = stat.restricted && !isAdmin;
          const isPositive = stat.change ? stat.change.startsWith('+') : true;
          const isZero     = stat.change === '+0.0%' || stat.change === '-0.0%';
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
                {!isLocked && stat.change && (
                  <div className={`flex items-center text-[12px] font-bold px-2 py-1 rounded-full ${
                    isZero ? 'bg-gray-50 text-gray-400' :
                    isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {!isZero && (isPositive
                      ? <ArrowUpRight className="w-3 h-3 mr-1" />
                      : <ArrowDownRight className="w-3 h-3 mr-1" />)}
                    {stat.change}
                  </div>
                )}
                {!isLocked && !stat.change && (
                  <div className="w-16 h-6 bg-gray-100 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-[28px] font-bold">{isLocked ? '••••••' : stat.value}</h3>
                {!isLocked && stat.change && (
                  <p className="text-[11px] text-gray-400 mt-1">vs previous 30 days</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden ${!isAdmin ? 'min-h-[300px]' : ''}`}>
          {!isAdmin && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-12">
              <div className="bg-red-50 p-6 rounded-full mb-6">
                <Lock className="w-10 h-10 text-red-600" />
              </div>
              <h4 className="text-[20px] font-bold mb-2">Financial Analytics Restricted</h4>
              <p className="text-gray-500 max-w-sm mx-auto">Access to sales and revenue charts is restricted to administrators only.</p>
            </div>
          )}

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[18px] font-bold">Revenue & Activity</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">Sales revenue, orders placed, and appointments booked</p>
            </div>

            {/* Period tabs */}
            {isAdmin && (
              <div className="flex items-center bg-[#F8F5FF] rounded-2xl p-1 self-start sm:self-auto">
                {(['daily', 'monthly', 'yearly'] as ChartPeriod[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                      chartPeriod === p
                        ? 'bg-[#6D4C91] text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {p === 'daily' ? 'Daily' : p === 'monthly' ? 'Monthly' : 'Yearly'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KPI summary strip */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {
                  label: 'Total Revenue',
                  value: formatPrice(displayChartData.reduce((s, d) => s + d.revenue, 0)),
                  color: 'text-[#6D4C91]',
                  bg: 'bg-[#F8F5FF]',
                },
                {
                  label: 'Appointments',
                  value: String(displayChartData.reduce((s, d) => s + d.appointments, 0)),
                  color: 'text-[#0EA5E9]',
                  bg: 'bg-[#F0F9FF]',
                },
                {
                  label: 'Orders',
                  value: String(displayChartData.reduce((s, d) => s + d.orders, 0)),
                  color: 'text-[#10B981]',
                  bg: 'bg-[#F0FDF4]',
                },
              ].map(kpi => (
                <div key={kpi.label} className={`${kpi.bg} rounded-2xl px-4 py-3`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
                  <p className={`text-[16px] font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="h-[220px] md:h-[320px]">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 border-2 border-[#6D4C91]/30 border-t-[#6D4C91] rounded-full animate-spin" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">Loading chart…</p>
                </div>
              </div>
            ) : isAdmin ? (
              <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-300 text-[12px]">Loading…</div>}>
                <SalesChart data={displayChartData} period={chartPeriod} formatPrice={formatPrice} />
              </Suspense>
            ) : null}
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
