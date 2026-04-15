// Isolated recharts component — lazy-loaded so the ~250 KB bundle only loads for admins.
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';

export interface ChartPoint {
  label: string;   // formatted x-axis label
  revenue: number; // KES
  orders: number;
  appointments: number;
}

interface SalesChartProps {
  data: ChartPoint[];
  period: 'daily' | 'monthly' | 'yearly';
  formatPrice: (n: number) => string;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, formatPrice }: any) {
  if (!active || !payload?.length) return null;

  const revenue      = payload.find((p: any) => p.dataKey === 'revenue')?.value ?? 0;
  const orders       = payload.find((p: any) => p.dataKey === 'orders')?.value ?? 0;
  const appointments = payload.find((p: any) => p.dataKey === 'appointments')?.value ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-w-[180px]">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">{label}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#6D4C91]" />
            <span className="text-[12px] text-gray-500">Revenue</span>
          </div>
          <span className="text-[13px] font-bold text-[#6D4C91]">{formatPrice(revenue)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
            <span className="text-[12px] text-gray-500">Appointments</span>
          </div>
          <span className="text-[13px] font-bold text-[#0EA5E9]">{appointments}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-[12px] text-gray-500">Orders</span>
          </div>
          <span className="text-[13px] font-bold text-[#10B981]">{orders}</span>
        </div>
      </div>
    </div>
  );
}

// ── Custom Legend ─────────────────────────────────────────────────────────────
function CustomLegend() {
  return (
    <div className="flex items-center gap-6 justify-end pr-2 pb-2">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-[#6D4C91]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Revenue</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-8 h-0.5 bg-[#0EA5E9] rounded" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Appointments</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-8 h-0.5 bg-[#10B981] rounded" style={{ borderTop: '2px dashed #10B981' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Orders</span>
      </div>
    </div>
  );
}

// ── KES axis formatter ────────────────────────────────────────────────────────
function kesLabel(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
}

export default function SalesChart({ data, period, formatPrice }: SalesChartProps) {
  if (!data.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
        <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-[12px] font-bold uppercase tracking-widest">No data for this period</p>
      </div>
    );
  }

  // Max revenue value to colour the highest bar differently
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6D4C91" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#9B7EC8" stopOpacity={0.75} />
          </linearGradient>
          <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4A2C7A" stopOpacity={1} />
            <stop offset="100%" stopColor="#6D4C91" stopOpacity={0.9} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="#F3F4F6"
        />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
          dy={8}
          interval={period === 'daily' ? 'preserveStartEnd' : 0}
        />

        {/* Left Y-axis — Revenue (KES) */}
        <YAxis
          yAxisId="revenue"
          orientation="left"
          axisLine={false}
          tickLine={false}
          tickFormatter={kesLabel}
          tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
          width={52}
          label={{ value: 'KES', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: '#C4B5D8', fontWeight: 700, letterSpacing: 2 } }}
        />

        {/* Right Y-axis — Count (appointments / orders) */}
        <YAxis
          yAxisId="count"
          orientation="right"
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
          width={36}
          label={{ value: 'QTY', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 10, fill: '#B0D8E8', fontWeight: 700, letterSpacing: 2 } }}
        />

        <Tooltip
          content={<CustomTooltip formatPrice={formatPrice} />}
          cursor={{ fill: '#F9F5FF', radius: 8 }}
        />

        <Legend content={<CustomLegend />} verticalAlign="top" />

        {/* Revenue bars */}
        <Bar yAxisId="revenue" dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={period === 'yearly' ? 60 : 32}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.revenue === maxRevenue && maxRevenue > 0
                ? 'url(#barGradientPeak)'
                : 'url(#barGradient)'}
            />
          ))}
        </Bar>

        {/* Appointments line */}
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="appointments"
          stroke="#0EA5E9"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }}
        />

        {/* Orders line (dashed) */}
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="orders"
          stroke="#10B981"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={{ r: 3, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
