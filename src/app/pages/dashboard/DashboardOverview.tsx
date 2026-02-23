import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingBag, Calendar, Users, ArrowUpRight, ArrowDownRight, DollarSign, Download, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const DATA = [
  { name: 'Mon', sales: 4000, appointments: 2400 },
  { name: 'Tue', sales: 3000, appointments: 1398 },
  { name: 'Wed', sales: 2000, appointments: 9800 },
  { name: 'Thu', sales: 2780, appointments: 3908 },
  { name: 'Fri', sales: 1890, appointments: 4800 },
  { name: 'Sat', sales: 2390, appointments: 3800 },
  { name: 'Sun', sales: 3490, appointments: 4300 },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'order', user: 'Sarah Kimani', detail: 'Purchased Glow Serum + 2 others', amount: 'KES 12,400', time: '10 mins ago' },
  { id: 2, type: 'appointment', user: 'James Omondi', detail: 'Scheduled Skin Analysis', amount: 'KES 2,500', time: '25 mins ago' },
  { id: 3, type: 'order', user: 'Anita Wanjiku', detail: 'Purchased Hydrating Cleanser', amount: 'KES 2,800', time: '1 hour ago' },
  { id: 4, type: 'appointment', user: 'David Kipkorir', detail: 'Scheduled Consultation', amount: 'KES 3,500', time: '2 hours ago' },
];

export function DashboardOverview() {
  const { user } = useStore();
  const isAdmin = user?.role === 'admin';

  const stats = [
    { label: 'Total Revenue', value: 'KES 1.2M', change: '+12.5%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', restricted: true },
    { label: 'Total Orders', value: '142', change: '+8.2%', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Appointments', value: '48', change: '-2.4%', icon: Calendar, color: 'text-[#6D4C91]', bg: 'bg-[#6D4C91]/5' },
    { label: 'New Customers', value: '24', change: '+18.1%', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
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
              <select className="bg-[#F8F9FA] border-none text-[12px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            )}
          </div>
          
          <div className="h-[400px]">
            {isAdmin && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D4C91" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6D4C91" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6D4C91" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="appointments" stroke="#1A1A1A" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-[18px] font-bold mb-8">Recent Activity</h3>
          <div className="space-y-8">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex space-x-4">
                <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${activity.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-[#6D4C91]/10 text-[#6D4C91]'}`}>
                  {activity.type === 'order' ? <ShoppingBag className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <p className="text-[14px] font-bold">{activity.user}</p>
                    <span className="text-[11px] text-gray-400">{activity.time}</span>
                  </div>
                  <p className="text-[12px] text-gray-500 mb-1">{activity.detail}</p>
                  <p className="text-[13px] font-bold">{isAdmin ? activity.amount : '••••••'}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 border border-gray-100 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
