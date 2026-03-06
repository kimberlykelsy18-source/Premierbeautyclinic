import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, CreditCard, Users, Link as LinkIcon, Globe, Palette, Database, UserPlus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';
import { toast } from 'sonner';

interface ClinicSettings {
  clinic_name: string;
  support_email: string;
  currency: string;
  timezone: string;
  default_deposit_percentage: number;
}

const DEFAULT_SETTINGS: ClinicSettings = {
  clinic_name: 'Premier Beauty Clinic',
  support_email: 'support@premierbeauty.com',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  default_deposit_percentage: 20,
};

export function DashboardSettings() {
  const { token, sessionId } = useStore();
  const [activeTab, setActiveTab] = useState('general');

  // ── Clinic settings ──
  const [settings, setSettings]         = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingGeneral, setSavingGeneral]     = useState(false);
  const [savingPayments, setSavingPayments]   = useState(false);

  useEffect(() => {
    apiFetch('/admin/settings', {}, token, sessionId)
      .then((data: ClinicSettings) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => toast.error('Could not load settings.'))
      .finally(() => setLoadingSettings(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          clinic_name:   settings.clinic_name,
          support_email: settings.support_email,
          currency:      settings.currency,
          timezone:      settings.timezone,
        }),
      }, token, sessionId);
      toast.success('General settings saved.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSavePayments = async () => {
    if (settings.default_deposit_percentage < 1 || settings.default_deposit_percentage > 100) {
      toast.error('Deposit percentage must be between 1 and 100.');
      return;
    }
    setSavingPayments(true);
    try {
      await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ default_deposit_percentage: settings.default_deposit_percentage }),
      }, token, sessionId);
      toast.success('Payment settings saved.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save payment settings.');
    } finally {
      setSavingPayments(false);
    }
  };

  // All grantable permissions with human-readable labels
  const ALL_PERMISSIONS: { key: string; label: string; description: string }[] = [
    { key: 'view_orders',          label: 'View Orders',           description: 'See all customer orders' },
    { key: 'mark_delivered',       label: 'Update Order Status',   description: 'Mark orders as shipped / delivered / cancelled' },
    { key: 'view_inventory',       label: 'View Inventory',        description: 'See products and stock levels' },
    { key: 'edit_stock',           label: 'Edit Stock',            description: 'Add stock quantities to products' },
    { key: 'view_appointments',    label: 'View Appointments',     description: 'See all client bookings' },
    { key: 'complete_appointment', label: 'Check In Clients',      description: 'Mark appointments as completed' },
    { key: 'create_walkin',        label: 'Record Walk-ins',       description: 'Add walk-in appointments' },
    { key: 'view_sales',           label: 'View Sales Reports',    description: 'See revenue charts and analytics' },
    { key: 'manage_staff',         label: 'Manage Staff & Settings', description: 'Invite employees and change clinic settings' },
  ];

  // Staff invite form
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'staff', permissions: [] as string[] });
  const [isInviting, setIsInviting]  = useState(false);

  const togglePermission = (key: string) => {
    setInviteForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleInviteEmployee = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast.error('Please fill in name and email.');
      return;
    }
    setIsInviting(true);
    try {
      const payload: Record<string, any> = {
        name:  inviteForm.name,
        email: inviteForm.email,
        role:  inviteForm.role,
      };
      // For admin, backend defaults to ['all']. For others, send selected permissions.
      if (inviteForm.role !== 'admin') {
        payload.permissions = inviteForm.permissions;
      }
      await apiFetch('/admin/invite-employee', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token, sessionId);
      toast.success(`Invite sent to ${inviteForm.email}`);
      setInviteForm({ name: '', email: '', role: 'staff', permissions: [] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invite.');
    } finally {
      setIsInviting(false);
    }
  };

  const TABS = [
    { id: 'general',       label: 'General Settings',  icon: Globe      },
    { id: 'security',      label: 'Security & Access', icon: Shield     },
    { id: 'notifications', label: 'Notifications',     icon: Bell       },
    { id: 'payments',      label: 'M-Pesa & Billing',  icon: CreditCard },
    { id: 'staff',         label: 'Staff Management',  icon: Users      },
    { id: 'design',        label: 'Storefront Design', icon: Palette    },
    { id: 'integrations',  label: 'Integrations',      icon: LinkIcon   },
    { id: 'data',          label: 'Data & Privacy',    icon: Database   },
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
          {/* ── General Tab ── */}
          {activeTab === 'general' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-[24px] font-serif mb-2">General Information</h2>
                <p className="text-gray-500 text-[14px]">Update your clinic details and public contact information.</p>
              </div>

              {loadingSettings ? (
                <div className="space-y-6 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-14 bg-gray-100 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Clinic Name</label>
                    <input
                      value={settings.clinic_name}
                      onChange={e => setSettings({ ...settings, clinic_name: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Support Email</label>
                    <input
                      type="email"
                      value={settings.support_email}
                      onChange={e => setSettings({ ...settings, support_email: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={e => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    >
                      <option value="KES">Kenyan Shilling (KES)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="TZS">Tanzanian Shilling (TZS)</option>
                      <option value="UGX">Ugandan Shilling (UGX)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    >
                      <option value="Africa/Nairobi">(GMT+03:00) Nairobi</option>
                      <option value="Africa/Dar_es_Salaam">(GMT+03:00) Dar es Salaam</option>
                      <option value="Africa/Kampala">(GMT+03:00) Kampala</option>
                      <option value="Africa/Kigali">(GMT+02:00) Kigali</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-100">
                <button
                  onClick={handleSaveGeneral}
                  disabled={savingGeneral || loadingSettings}
                  className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {savingGeneral && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {savingGeneral ? 'Saving…' : 'Save General Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ── Payments Tab ── */}
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
                  <p className="text-gray-500 text-[14px]">Configured via MPESA_SHORTCODE in your backend .env file.</p>
                </div>
              </div>

              {loadingSettings ? (
                <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      Default Booking Deposit (%)
                    </label>
                    <p className="text-[13px] text-gray-400">
                      Used as the default deposit percentage when creating new services. Existing services keep their own percentage.
                    </p>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.default_deposit_percentage}
                      onChange={e => setSettings({ ...settings, default_deposit_percentage: Number(e.target.value) })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-100">
                <button
                  onClick={handleSavePayments}
                  disabled={savingPayments || loadingSettings}
                  className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {savingPayments && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {savingPayments ? 'Saving…' : 'Save Payment Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ── Staff Tab ── */}
          {activeTab === 'staff' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-[24px] font-serif mb-2">Staff Management</h2>
                <p className="text-gray-500 text-[14px]">Invite new employees and assign their access roles.</p>
              </div>

              <div className="p-8 bg-[#FDFBF7] rounded-[24px] border border-gray-100 space-y-6">
                <h3 className="text-[16px] font-bold">Invite New Staff Member</h3>
                <p className="text-gray-500 text-[13px]">
                  They will receive an email with a temporary password and be prompted to change it on first login.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Full Name *</label>
                    <input
                      value={inviteForm.name}
                      onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
                      placeholder="e.g. Mary Wambui"
                      className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email Address *</label>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder="e.g. mary@premierbeauty.com"
                      className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Role</label>
                    <select
                      value={inviteForm.role}
                      onChange={e => setInviteForm({ ...inviteForm, role: e.target.value, permissions: [] })}
                      className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[15px]"
                    >
                      <option value="staff">Staff — custom permissions (selected below)</option>
                      <option value="finance">Finance — accounts &amp; reporting access</option>
                      <option value="admin">Admin — full access to all features</option>
                    </select>
                  </div>

                  {/* Permissions checkboxes — only shown for non-admin roles */}
                  {inviteForm.role !== 'admin' && (
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Permissions <span className="normal-case font-normal text-gray-400">(select what this person can access)</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ALL_PERMISSIONS.map(perm => (
                          <button
                            key={perm.key}
                            type="button"
                            onClick={() => togglePermission(perm.key)}
                            className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                              inviteForm.permissions.includes(perm.key)
                                ? 'border-[#6D4C91] bg-[#6D4C91]/5'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                              inviteForm.permissions.includes(perm.key)
                                ? 'bg-[#6D4C91] border-[#6D4C91]'
                                : 'border-gray-300'
                            }`}>
                              {inviteForm.permissions.includes(perm.key) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold">{perm.label}</p>
                              <p className="text-[11px] text-gray-400">{perm.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {inviteForm.permissions.length === 0 && (
                        <p className="text-[12px] text-amber-600 font-medium">
                          No permissions selected — this staff member will only be able to log in but not access any data.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleInviteEmployee}
                  disabled={isInviting || !inviteForm.name || !inviteForm.email}
                  className="flex items-center bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Invite…
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Placeholder for unbuilt tabs ── */}
          {activeTab !== 'general' && activeTab !== 'payments' && activeTab !== 'staff' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Settings className="w-12 h-12 text-gray-200" />
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
