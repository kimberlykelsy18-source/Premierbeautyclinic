// Isolated recharts component so the ~250 KB recharts bundle is only loaded
// when this component is actually rendered (lazy-loaded from DashboardOverview).
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  sales: number;
  appointments: number;
}

interface SalesChartProps {
  data: DataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
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
  );
}
