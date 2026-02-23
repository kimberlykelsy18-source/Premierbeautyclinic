import { useState } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, Calendar, ShoppingBag, MapPin, ChevronRight, UserPlus, Download } from 'lucide-react';

const CUSTOMERS = [
  { id: 'CUST-001', name: 'Jane Doe', email: 'jane@example.com', phone: '+254 712 345 678', lastOrder: 'Feb 18, 2026', totalSpent: '12,500', orders: 3, status: 'Active' },
  { id: 'CUST-002', name: 'John Smith', email: 'john@example.com', phone: '+254 722 987 654', lastOrder: 'Feb 15, 2026', totalSpent: '45,200', orders: 12, status: 'Active' },
  { id: 'CUST-003', name: 'Sarah Wanjiku', email: 'sarah@example.com', phone: '+254 733 111 222', lastOrder: 'Jan 28, 2026', totalSpent: '8,400', orders: 2, status: 'Inactive' },
  { id: 'CUST-004', name: 'Michael Kamau', email: 'michael@example.com', phone: '+254 744 555 666', lastOrder: 'Feb 20, 2026', totalSpent: '2,800', orders: 1, status: 'Active' },
];

export function DashboardCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Customer Relations</h1>
          <p className="text-gray-500">View and manage your client database and history.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white text-black border border-gray-100 px-6 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm">
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
          <p className="text-[28px] font-bold">1,284</p>
          <p className="text-[11px] text-green-600 font-bold">+12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Active Clients</p>
          <p className="text-[28px] font-bold">856</p>
          <p className="text-[11px] text-gray-400 font-bold">67% of total base</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">Avg. Order Value</p>
          <p className="text-[28px] font-bold">KES 4,850</p>
          <p className="text-[11px] text-green-600 font-bold">+5% vs. goal</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">New Bookings</p>
          <p className="text-[28px] font-bold">42</p>
          <p className="text-[11px] text-gray-400 font-bold">In the last 7 days</p>
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
              {CUSTOMERS.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#FDFBF7] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#6D4C91]/10 text-[#6D4C91] rounded-full flex items-center justify-center font-bold text-[14px]">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold">{cust.name}</p>
                        <p className="text-[12px] text-gray-400">{cust.id}</p>
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
                  <td className="px-8 py-6 text-[14px] font-bold">KES {cust.totalSpent}</td>
                  <td className="px-8 py-6 text-[14px]">{cust.orders}</td>
                  <td className="px-8 py-6 text-[14px] text-gray-500">{cust.lastOrder}</td>
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
      </div>
    </div>
  );
}
