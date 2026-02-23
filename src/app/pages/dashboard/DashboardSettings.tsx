import { useState } from 'react';
import { Settings, Shield, Bell, CreditCard, Users, Link as LinkIcon, Globe, Palette, Database } from 'lucide-react';

export function DashboardSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const TABS = [
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'M-Pesa & Billing', icon: CreditCard },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'design', label: 'Storefront Design', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">System Configuration</h1>
          <p className="text-gray-500">Configure your store, services, and administrative preferences.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-72 space-y-2 shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#6D4C91] text-white shadow-lg' : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-grow bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 md:p-12">
          {activeTab === 'general' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-[24px] font-serif mb-2">General Information</h2>
                <p className="text-gray-500 text-[14px]">Update your clinic details and public contact information.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Clinic Name</label>
                  <input className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]" defaultValue="Premier Beauty Clinic" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Support Email</label>
                  <input className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]" defaultValue="support@premierbeauty.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Currency</label>
                  <select className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]">
                    <option>Kenyan Shilling (KES)</option>
                    <option>US Dollar (USD)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Timezone</label>
                  <select className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]">
                    <option>(GMT+03:00) Nairobi</option>
                  </select>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <button className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] active:scale-[0.98] transition-all shadow-lg">Save General Settings</button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-[24px] font-serif mb-2">M-Pesa Integration</h2>
                <p className="text-gray-500 text-[14px]">Configure Daraja API and automated payment confirmations.</p>
              </div>

              <div className="p-8 border-2 border-dashed border-gray-100 rounded-[32px] text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-[18px] font-serif">M-Pesa Paybill Connected</h3>
                  <p className="text-gray-500 text-[14px]">Paybill: 400200 • Shortcode: 123456</p>
                </div>
                <button className="text-[#6D4C91] font-bold uppercase tracking-widest text-[11px] hover:underline underline-offset-4">Configure Webhooks</button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Booking Deposit Amount (KES)</label>
                  <input type="number" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]" defaultValue="1000" />
                </div>
              </div>
            </div>
          )}
          
          {activeTab !== 'general' && activeTab !== 'payments' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Database className="w-12 h-12 text-gray-200" />
              <div>
                <h3 className="text-[20px] font-serif">Under Construction</h3>
                <p className="text-gray-500 text-[14px]">This section is currently being updated for the latest system standards.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
