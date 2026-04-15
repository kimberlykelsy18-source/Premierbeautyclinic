import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, CreditCard, Users, Link as LinkIcon, Globe, Palette, Database, UserPlus, ChevronDown, ChevronUp, Edit, Trash2, Plus, X, Save, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClinicSettings {
  clinic_name: string;
  support_email: string;
  currency: string;
  timezone: string;
  default_deposit_percentage: number;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  permissions: string[];
  is_temporary_password: boolean;
  created_at: string;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  order_num: number;
}

interface MarqueeItem {
  id: string;
  text: string;
  active: boolean;
}

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: ClinicSettings = {
  clinic_name: 'Premier Beauty Clinic',
  support_email: 'customersupport@premierbeautyclinic.com',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  default_deposit_percentage: 20,
};

const DEFAULT_HERO: HeroContent = {
  title: 'Experience Your Best Skin Ever',
  subtitle: 'Dermatologist-approved skincare tailored for your unique skin journey.',
  ctaText: 'Shop Collection',
  ctaLink: '/shop',
};

const FAQ_CATEGORIES = ['Products', 'Shipping', 'Orders', 'Returns', 'Services', 'Account', 'General'];

const ALL_PERMISSIONS: { key: string; label: string; description: string }[] = [
  { key: 'view_orders',          label: 'View Orders',             description: 'See all customer orders' },
  { key: 'mark_delivered',       label: 'Update Order Status',     description: 'Mark orders as shipped / delivered / cancelled' },
  { key: 'view_inventory',       label: 'View Inventory',          description: 'See products and stock levels' },
  { key: 'edit_stock',           label: 'Edit Stock',              description: 'Add stock quantities to products' },
  { key: 'view_appointments',    label: 'View Appointments',       description: 'See all client bookings' },
  { key: 'complete_appointment', label: 'Check In Clients',        description: 'Mark appointments as completed' },
  { key: 'create_walkin',        label: 'Record Walk-ins',         description: 'Add walk-in appointments' },
  { key: 'view_sales',           label: 'View Sales Reports',      description: 'See revenue charts and analytics' },
  { key: 'manage_staff',         label: 'Manage Staff & Settings', description: 'Invite employees and change clinic settings' },
];

const TABS = [
  { id: 'general',       label: 'General Settings',  icon: Globe    },
  { id: 'payments',      label: 'M-Pesa & Billing',  icon: CreditCard },
  { id: 'staff',         label: 'Staff Management',  icon: Users    },
  { id: 'design',        label: 'Storefront Design', icon: Palette  },
  { id: 'security',      label: 'Security & Access', icon: Shield   },
  { id: 'notifications', label: 'Notifications',     icon: Bell     },
  { id: 'integrations',  label: 'Integrations',      icon: LinkIcon },
  { id: 'data',          label: 'Data & Privacy',    icon: Database },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function DashboardSettings() {
  const { token, sessionId, user } = useStore();
  const [activeTab, setActiveTab]   = useState('general');

  // ── General / Payments settings ─────────────────────────────────────────────
  const [settings, setSettings]           = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPayments, setSavingPayments] = useState(false);

  useEffect(() => {
    apiFetch('/admin/settings', {}, token, sessionId)
      .then((data: ClinicSettings) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => toast.error('Could not load settings'))
      .finally(() => setLoadingSettings(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      await apiFetch('/admin/settings', { method: 'PATCH', body: JSON.stringify({
        clinic_name: settings.clinic_name, support_email: settings.support_email,
        currency: settings.currency, timezone: settings.timezone,
      }) }, token, sessionId);
      toast.success('General settings saved');
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSavingGeneral(false); }
  };

  const handleSavePayments = async () => {
    if (settings.default_deposit_percentage < 1 || settings.default_deposit_percentage > 100) {
      toast.error('Deposit must be between 1 and 100'); return;
    }
    setSavingPayments(true);
    try {
      await apiFetch('/admin/settings', { method: 'PATCH', body: JSON.stringify({ default_deposit_percentage: settings.default_deposit_percentage }) }, token, sessionId);
      toast.success('Payment settings saved');
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSavingPayments(false); }
  };

  // ── Staff ───────────────────────────────────────────────────────────────────
  const [employees, setEmployees]         = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [inviteForm, setInviteForm]       = useState({ name: '', email: '', role: 'staff', permissions: [] as string[] });
  const [isInviting, setIsInviting]       = useState(false);

  const loadEmployees = () => {
    setLoadingEmployees(true);
    apiFetch('/admin/employees', {}, token, sessionId)
      .then(setEmployees)
      .catch(() => toast.error('Could not load employees'))
      .finally(() => setLoadingEmployees(false));
  };

  useEffect(() => {
    if (activeTab === 'staff') loadEmployees();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePermission = (key: string) => {
    setInviteForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleInviteEmployee = async () => {
    if (!inviteForm.name || !inviteForm.email) { toast.error('Name and email are required'); return; }
    setIsInviting(true);
    try {
      const payload: Record<string, any> = { name: inviteForm.name, email: inviteForm.email, role: inviteForm.role };
      if (inviteForm.role !== 'admin') payload.permissions = inviteForm.permissions;
      await apiFetch('/admin/invite-employee', { method: 'POST', body: JSON.stringify(payload) }, token, sessionId);
      toast.success(`Invite sent to ${inviteForm.email}`);
      setInviteForm({ name: '', email: '', role: 'staff', permissions: [] });
      loadEmployees();
    } catch (err: any) { toast.error(err.message || 'Failed to send invite'); }
    finally { setIsInviting(false); }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}'s access? This will delete their account.`)) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/employees/${id}`, { method: 'DELETE' }, token, sessionId);
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success(`${name}'s access has been revoked`);
    } catch (err: any) { toast.error(err.message || 'Failed to remove employee'); }
    finally { setDeletingId(null); }
  };

  // ── FAQs ────────────────────────────────────────────────────────────────────
  const [faqs, setFaqs]                   = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs]     = useState(false);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [faqModal, setFaqModal]           = useState(false);
  const [editingFaq, setEditingFaq]       = useState<FAQ | null>(null);
  const [faqForm, setFaqForm]             = useState({ category: '', question: '', answer: '' });
  const [savingFaq, setSavingFaq]         = useState(false);
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);

  const loadFaqs = () => {
    setLoadingFaqs(true);
    apiFetch('/admin/faqs', {}, token, sessionId)
      .then(setFaqs)
      .catch(() => toast.error('Could not load FAQs'))
      .finally(() => setLoadingFaqs(false));
  };

  const openFaqModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({ category: faq.category, question: faq.question, answer: faq.answer });
    } else {
      setEditingFaq(null);
      setFaqForm({ category: '', question: '', answer: '' });
    }
    setFaqModal(true);
  };

  const handleSaveFaq = async () => {
    if (!faqForm.category || !faqForm.question || !faqForm.answer) {
      toast.error('All fields are required'); return;
    }
    setSavingFaq(true);
    try {
      if (editingFaq) {
        const updated = await apiFetch(`/admin/faqs/${editingFaq.id}`, { method: 'PATCH', body: JSON.stringify(faqForm) }, token, sessionId);
        setFaqs(prev => prev.map(f => f.id === editingFaq.id ? updated : f));
        toast.success('FAQ updated');
      } else {
        const created = await apiFetch('/admin/faqs', { method: 'POST', body: JSON.stringify(faqForm) }, token, sessionId);
        setFaqs(prev => [...prev, created]);
        toast.success('FAQ added');
      }
      setFaqModal(false);
    } catch (err: any) { toast.error(err.message || 'Failed to save FAQ'); }
    finally { setSavingFaq(false); }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    setDeletingFaqId(id);
    try {
      await apiFetch(`/admin/faqs/${id}`, { method: 'DELETE' }, token, sessionId);
      setFaqs(prev => prev.filter(f => f.id !== id));
      toast.success('FAQ deleted');
    } catch (err: any) { toast.error(err.message || 'Failed to delete'); }
    finally { setDeletingFaqId(null); }
  };

  // ── Storefront Content ───────────────────────────────────────────────────────
  const [marqueeItems, setMarqueeItems]   = useState<MarqueeItem[]>([]);
  const [heroContent, setHeroContent]     = useState<HeroContent>(DEFAULT_HERO);
  const [features, setFeatures]           = useState<Feature[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [editingHero, setEditingHero]     = useState(false);
  const [heroForm, setHeroForm]           = useState<HeroContent>(DEFAULT_HERO);
  const [newMarqueeText, setNewMarqueeText] = useState('');
  const [addingMarquee, setAddingMarquee] = useState(false);
  const [featureModal, setFeatureModal]   = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [featureForm, setFeatureForm]     = useState({ icon: '✨', title: '', description: '' });

  const loadContent = () => {
    setLoadingContent(true);
    apiFetch('/admin/storefront-content', {}, token, sessionId)
      .then(data => {
        setMarqueeItems(data.marquee_items || []);
        setHeroContent({ ...DEFAULT_HERO, ...(data.hero || {}) });
        setFeatures(data.features || []);
      })
      .catch(() => toast.error('Could not load storefront content'))
      .finally(() => setLoadingContent(false));
  };

  // Design sub-tab state
  const [designSubTab, setDesignSubTab]   = useState<'faqs' | 'content'>('faqs');

  useEffect(() => {
    if (activeTab === 'design') {
      if (designSubTab === 'faqs') loadFaqs();
      else loadContent();
    }
  }, [activeTab, designSubTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveMarquee = async (items: MarqueeItem[]) => {
    setSavingContent(true);
    try {
      await apiFetch('/admin/storefront-content', { method: 'PATCH', body: JSON.stringify({ marquee_items: items }) }, token, sessionId);
      setMarqueeItems(items);
      toast.success('Marquee updated');
    } catch { toast.error('Failed to save marquee'); }
    finally { setSavingContent(false); }
  };

  const saveHero = async () => {
    setSavingContent(true);
    try {
      await apiFetch('/admin/storefront-content', { method: 'PATCH', body: JSON.stringify({ hero: heroForm }) }, token, sessionId);
      setHeroContent(heroForm);
      setEditingHero(false);
      toast.success('Hero section updated');
    } catch { toast.error('Failed to save hero content'); }
    finally { setSavingContent(false); }
  };

  const saveFeatures = async (updated: Feature[]) => {
    setSavingContent(true);
    try {
      await apiFetch('/admin/storefront-content', { method: 'PATCH', body: JSON.stringify({ features: updated }) }, token, sessionId);
      setFeatures(updated);
      toast.success('Features updated');
    } catch { toast.error('Failed to save features'); }
    finally { setSavingContent(false); }
  };

  const handleSaveFeature = async () => {
    if (!featureForm.title || !featureForm.description) { toast.error('Title and description required'); return; }
    const updated = editingFeature
      ? features.map(f => f.id === editingFeature.id ? { ...f, ...featureForm } : f)
      : [...features, { id: Date.now().toString(), ...featureForm }];
    await saveFeatures(updated);
    setFeatureModal(false);
  };

  // ── Grouped FAQs ─────────────────────────────────────────────────────────────
  const groupedFaqs = faqs.reduce((acc, f) => {
    (acc[f.category] = acc[f.category] || []).push(f);
    return acc;
  }, {} as Record<string, FAQ[]>);

  // ── Role badge color ──────────────────────────────────────────────────────────
  const roleBadge = (role: string) => {
    if (role === 'admin')        return 'bg-[#6D4C91]/10 text-[#6D4C91]';
    if (role === 'finance')      return 'bg-blue-50 text-blue-600';
    if (role === 'practitioner') return 'bg-pink-50 text-pink-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-serif font-bold italic mb-1">System Configuration</h1>
        <p className="text-gray-500 text-[14px]">Configure your store, services, and administrative preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#000000] text-white shadow-sm'
                    : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100 hover:border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-grow bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 md:p-10 min-h-[500px]">

          {/* ── General Tab ── */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-[22px] font-serif mb-1">General Information</h2>
                <p className="text-gray-500 text-[13px]">Update your clinic details and public contact information.</p>
              </div>
              {loadingSettings ? (
                <div className="space-y-5 animate-pulse">{[1,2,3,4].map(i=><div key={i} className="h-14 bg-gray-100 rounded-2xl"/>)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Clinic Name', key: 'clinic_name', type: 'text' },
                    { label: 'Support Email', key: 'support_email', type: 'email' },
                  ].map(({ label, key, type }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
                      <input type={type} value={(settings as any)[key]} onChange={e => setSettings({...settings, [key]: e.target.value})}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] text-gray-900" />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Currency</label>
                    <select value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900">
                      <option value="KES">Kenyan Shilling (KES)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="TZS">Tanzanian Shilling (TZS)</option>
                      <option value="UGX">Ugandan Shilling (UGX)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Timezone</label>
                    <select value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900">
                      <option value="Africa/Nairobi">(GMT+03:00) Nairobi</option>
                      <option value="Africa/Dar_es_Salaam">(GMT+03:00) Dar es Salaam</option>
                      <option value="Africa/Kampala">(GMT+03:00) Kampala</option>
                      <option value="Africa/Kigali">(GMT+02:00) Kigali</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="pt-6 border-t border-gray-100">
                <button onClick={handleSaveGeneral} disabled={savingGeneral || loadingSettings}
                  className="flex items-center gap-2 bg-[#6D4C91] text-white px-7 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all shadow-sm disabled:opacity-50">
                  {savingGeneral && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                  {savingGeneral ? 'Saving…' : 'Save General Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ── Payments Tab ── */}
          {activeTab === 'payments' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-[22px] font-serif mb-1">M-Pesa Integration</h2>
                <p className="text-gray-500 text-[13px]">Configure Daraja API and payment confirmations.</p>
              </div>
              <div className="p-6 border-2 border-dashed border-gray-100 rounded-[28px] text-center space-y-3">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-[17px] font-serif">M-Pesa Paybill Connected</h3>
                  <p className="text-gray-500 text-[13px]">Configured via MPESA_SHORTCODE in your backend .env file.</p>
                </div>
              </div>
              {!loadingSettings && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Default Booking Deposit (%)</label>
                  <p className="text-[12px] text-gray-400">Used as the default deposit percentage for new services.</p>
                  <input type="number" min={1} max={100} value={settings.default_deposit_percentage}
                    onChange={e => setSettings({...settings, default_deposit_percentage: Number(e.target.value)})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900 max-w-xs"/>
                </div>
              )}
              <div className="pt-6 border-t border-gray-100">
                <button onClick={handleSavePayments} disabled={savingPayments || loadingSettings}
                  className="flex items-center gap-2 bg-[#6D4C91] text-white px-7 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all shadow-sm disabled:opacity-50">
                  {savingPayments && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                  {savingPayments ? 'Saving…' : 'Save Payment Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ── Staff Tab ── */}
          {activeTab === 'staff' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-[22px] font-serif mb-1">Staff Management</h2>
                <p className="text-gray-500 text-[13px]">Manage team access and invite new employees.</p>
              </div>

              {/* Current employees */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4">Current Team</h3>
                {loadingEmployees ? (
                  <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-[13px]">No employees found.</div>
                ) : (
                  <div className="space-y-2">
                    {employees.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#6D4C91] flex items-center justify-center text-white font-bold text-[13px] shrink-0">
                            {emp.full_name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[13px] font-bold truncate">{emp.full_name}</p>
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${roleBadge(emp.role)}`}>{emp.role}</span>
                              {emp.is_temporary_password && (
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Temp Password</span>
                              )}
                            </div>
                            <p className="text-[12px] text-gray-400 truncate">{emp.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-[11px] text-gray-400 hidden md:block">
                            {emp.permissions?.includes('all') ? 'All permissions' : `${emp.permissions?.length ?? 0} permissions`}
                          </p>
                          {emp.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                              disabled={deletingId === emp.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                              title="Revoke access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invite form */}
              <div className="p-7 bg-[#F2F1F8] rounded-[28px] border border-gray-100 space-y-6">
                <div>
                  <h3 className="text-[15px] font-bold mb-1">Invite New Staff Member</h3>
                  <p className="text-gray-500 text-[13px]">They'll receive an email with a temporary password.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name *</label>
                    <input value={inviteForm.name} onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                      placeholder="e.g. Mary Wambui"
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address *</label>
                    <input type="email" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                      placeholder="mary@premierbeauty.com"
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900"/>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</label>
                    <select value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value, permissions: []})}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]">
                      <option value="staff">Staff — custom permissions</option>
                      <option value="practitioner">Practitioner — beauty &amp; clinical services</option>
                      <option value="finance">Finance — accounts &amp; reporting</option>
                      <option value="admin">Admin — full access</option>
                    </select>
                  </div>
                  {inviteForm.role !== 'admin' && (
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Permissions</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {ALL_PERMISSIONS.map(perm => (
                          <button key={perm.key} type="button" onClick={() => togglePermission(perm.key)}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                              inviteForm.permissions.includes(perm.key) ? 'border-[#6D4C91] bg-[#6D4C91]/5' : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}>
                            <div className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                              inviteForm.permissions.includes(perm.key) ? 'bg-[#6D4C91] border-[#6D4C91]' : 'border-gray-300'
                            }`}>
                              {inviteForm.permissions.includes(perm.key) && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-[12px] font-bold">{perm.label}</p>
                              <p className="text-[11px] text-gray-400">{perm.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {inviteForm.permissions.length === 0 && (
                        <div className="flex items-center gap-2 text-amber-600 text-[12px]">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>No permissions selected — this member can log in but not access any data.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={handleInviteEmployee} disabled={isInviting || !inviteForm.name || !inviteForm.email}
                  className="flex items-center gap-2 bg-[#6D4C91] text-white px-7 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all shadow-sm disabled:opacity-50">
                  {isInviting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <UserPlus className="w-4 h-4"/>}
                  {isInviting ? 'Sending…' : 'Send Invite'}
                </button>
              </div>
            </div>
          )}

          {/* ── Storefront Design Tab ── */}
          {activeTab === 'design' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-serif mb-1">Storefront Design</h2>
                <p className="text-gray-500 text-[13px]">Manage FAQs and the content shown on your customer-facing pages.</p>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {(['faqs', 'content'] as const).map(sub => (
                  <button key={sub} onClick={() => setDesignSubTab(sub)}
                    className={`px-6 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all ${
                      designSubTab === sub ? 'bg-white text-[#6D4C91] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {sub === 'faqs' ? 'FAQs' : 'Content'}
                  </button>
                ))}
              </div>

              {/* FAQs Sub-Tab */}
              {designSubTab === 'faqs' && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] text-gray-500">Manage the FAQ page content visible to customers.</p>
                    <button onClick={() => openFaqModal()}
                      className="flex items-center gap-2 bg-[#000000] text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add FAQ
                    </button>
                  </div>

                  {loadingFaqs ? (
                    <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
                  ) : faqs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[28px]">
                      <p className="text-gray-400 text-[14px] mb-3">No FAQs yet</p>
                      <button onClick={() => openFaqModal()} className="text-[#6D4C91] text-[13px] font-bold hover:underline">Add your first FAQ</button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {Object.entries(groupedFaqs).map(([category, items]) => (
                        <div key={category} className="bg-gray-50 rounded-[22px] p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-[#6D4C91] text-white rounded-full text-[10px] font-bold uppercase tracking-widest">{category}</span>
                            <span className="text-[12px] text-gray-400">({items.length})</span>
                          </div>
                          <div className="space-y-2">
                            {items.map(faq => (
                              <div key={faq.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <div className="p-4 flex items-start justify-between gap-3">
                                  <button className="flex-1 text-left flex items-start justify-between gap-3"
                                    onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}>
                                    <p className="text-[13px] font-semibold">{faq.question}</p>
                                    {expandedFaqId === faq.id
                                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/>
                                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/>}
                                  </button>
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => openFaqModal(faq)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                      <Edit className="w-3.5 h-3.5 text-[#6D4C91]"/>
                                    </button>
                                    <button onClick={() => handleDeleteFaq(faq.id)} disabled={deletingFaqId === faq.id}
                                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                                      <Trash2 className="w-3.5 h-3.5 text-red-500"/>
                                    </button>
                                  </div>
                                </div>
                                <AnimatePresence>
                                  {expandedFaqId === faq.id && (
                                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                                      <p className="text-[13px] text-gray-500 leading-relaxed px-4 pb-4">{faq.answer}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content Sub-Tab */}
              {designSubTab === 'content' && (
                <div className="space-y-8">
                  {loadingContent ? (
                    <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
                  ) : (
                    <>
                      {/* Marquee Promotions */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-[15px] font-bold">Announcement Bar</h3>
                            <p className="text-[12px] text-gray-400 mt-0.5">Text that scrolls across the top of the store.</p>
                          </div>
                          {!addingMarquee && (
                            <button onClick={() => setAddingMarquee(true)}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-[#6D4C91] hover:underline">
                              <Plus className="w-3.5 h-3.5"/> Add Text
                            </button>
                          )}
                        </div>

                        {addingMarquee && (
                          <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <input value={newMarqueeText} onChange={e => setNewMarqueeText(e.target.value)}
                              placeholder="e.g. Free shipping on orders over KES 5,000"
                              className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-lg outline-none text-[13px] focus:ring-2 focus:ring-[#6D4C91]/20"/>
                            <button onClick={async () => {
                              if (!newMarqueeText.trim()) return;
                              const updated = [...marqueeItems, { id: Date.now().toString(), text: newMarqueeText.trim(), active: true }];
                              await saveMarquee(updated);
                              setNewMarqueeText(''); setAddingMarquee(false);
                            }} className="p-2 bg-[#6D4C91] text-white rounded-lg hover:bg-[#5a3e79]"><Save className="w-4 h-4"/></button>
                            <button onClick={() => { setAddingMarquee(false); setNewMarqueeText(''); }}
                              className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg"><X className="w-4 h-4"/></button>
                          </div>
                        )}

                        <div className="space-y-2">
                          {marqueeItems.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                              <button onClick={() => saveMarquee(marqueeItems.map(m => m.id === item.id ? {...m, active: !m.active} : m))}
                                className="shrink-0 text-gray-400 hover:text-[#6D4C91] transition-colors" disabled={savingContent}>
                                {item.active ? <ToggleRight className="w-6 h-6 text-[#6D4C91]"/> : <ToggleLeft className="w-6 h-6"/>}
                              </button>
                              <p className={`flex-1 text-[13px] ${item.active ? 'text-gray-700' : 'text-gray-400 line-through'}`}>{item.text}</p>
                              <button onClick={() => saveMarquee(marqueeItems.filter(m => m.id !== item.id))}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" disabled={savingContent}>
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            </div>
                          ))}
                          {marqueeItems.length === 0 && !addingMarquee && (
                            <p className="text-center text-[13px] text-gray-400 py-4">No announcements yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Hero Section */}
                      <div className="border-t border-gray-100 pt-8">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-[15px] font-bold">Hero Section</h3>
                            <p className="text-[12px] text-gray-400 mt-0.5">The main headline on your home page.</p>
                          </div>
                          {!editingHero && (
                            <button onClick={() => { setHeroForm(heroContent); setEditingHero(true); }}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-[#6D4C91] hover:underline">
                              <Edit className="w-3.5 h-3.5"/> Edit
                            </button>
                          )}
                        </div>

                        {editingHero ? (
                          <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            {[
                              { label: 'Headline', key: 'title', placeholder: 'e.g. Experience Your Best Skin Ever' },
                              { label: 'Subtitle', key: 'subtitle', placeholder: 'e.g. Dermatologist-approved skincare…' },
                              { label: 'CTA Button Text', key: 'ctaText', placeholder: 'e.g. Shop Collection' },
                              { label: 'CTA Button Link', key: 'ctaLink', placeholder: 'e.g. /shop' },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key} className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
                                <input value={(heroForm as any)[key]} onChange={e => setHeroForm({...heroForm, [key]: e.target.value})}
                                  placeholder={placeholder}
                                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900"/>
                              </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                              <button onClick={saveHero} disabled={savingContent}
                                className="flex items-center gap-2 bg-[#6D4C91] text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all disabled:opacity-50">
                                {savingContent ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Save className="w-3.5 h-3.5"/>}
                                Save
                              </button>
                              <button onClick={() => setEditingHero(false)}
                                className="px-5 py-2.5 border border-gray-200 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                            <p className="text-[16px] font-bold">{heroContent.title}</p>
                            <p className="text-[13px] text-gray-500">{heroContent.subtitle}</p>
                            <p className="text-[12px] text-[#6D4C91] font-bold">{heroContent.ctaText} → {heroContent.ctaLink}</p>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="border-t border-gray-100 pt-8">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-[15px] font-bold">Feature Highlights</h3>
                            <p className="text-[12px] text-gray-400 mt-0.5">The three/four feature boxes on the home page.</p>
                          </div>
                          <button onClick={() => { setEditingFeature(null); setFeatureForm({ icon: '✨', title: '', description: '' }); setFeatureModal(true); }}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[#6D4C91] hover:underline">
                            <Plus className="w-3.5 h-3.5"/> Add Feature
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {features.map(f => (
                            <div key={f.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <span className="text-2xl shrink-0">{f.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold">{f.title}</p>
                                <p className="text-[12px] text-gray-400 mt-0.5">{f.description}</p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => { setEditingFeature(f); setFeatureForm({ icon: f.icon, title: f.title, description: f.description }); setFeatureModal(true); }}
                                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5 text-[#6D4C91]"/></button>
                                <button onClick={() => saveFeatures(features.filter(x => x.id !== f.id))}
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-500"/></button>
                              </div>
                            </div>
                          ))}
                          {features.length === 0 && <p className="col-span-2 text-center text-[13px] text-gray-400 py-4">No features added yet.</p>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Placeholder tabs ── */}
          {activeTab !== 'general' && activeTab !== 'payments' && activeTab !== 'staff' && activeTab !== 'design' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Settings className="w-12 h-12 text-gray-200" />
              <div>
                <h3 className="text-[20px] font-serif">Under Construction</h3>
                <p className="text-gray-500 text-[14px]">This section is currently being updated.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FAQ Modal */}
      <AnimatePresence>
        {faqModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={() => setFaqModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
            <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
              className="relative bg-white rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-gray-100 bg-[#F2F1F8] flex justify-between items-center">
                <h2 className="text-[20px] font-serif font-bold">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h2>
                <button onClick={() => setFaqModal(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category *</label>
                  <select value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]">
                    <option value="">Select a category</option>
                    {FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Question *</label>
                  <input value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})}
                    placeholder="What would a customer ask?"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Answer *</label>
                  <textarea value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})}
                    placeholder="Provide a clear, helpful answer…"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900 resize-y"/>
                </div>
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button onClick={() => setFaqModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleSaveFaq} disabled={savingFaq}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#6D4C91] text-white py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all disabled:opacity-60">
                  {savingFaq ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Save className="w-4 h-4"/>}
                  {editingFaq ? 'Update' : 'Add FAQ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feature Modal */}
      <AnimatePresence>
        {featureModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={() => setFeatureModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
            <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
              className="relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-gray-100 bg-[#F2F1F8] flex justify-between items-center">
                <h2 className="text-[20px] font-serif font-bold">{editingFeature ? 'Edit Feature' : 'Add Feature'}</h2>
                <button onClick={() => setFeatureModal(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Icon (emoji)</label>
                  <input value={featureForm.icon} onChange={e => setFeatureForm({...featureForm, icon: e.target.value})}
                    placeholder="✨"
                    className="w-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[20px] text-center"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Title *</label>
                  <input value={featureForm.title} onChange={e => setFeatureForm({...featureForm, title: e.target.value})}
                    placeholder="e.g. Fast Delivery"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description *</label>
                  <textarea value={featureForm.description} onChange={e => setFeatureForm({...featureForm, description: e.target.value})}
                    placeholder="Short description shown under the title…"
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] text-gray-900 resize-none"/>
                </div>
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button onClick={() => setFeatureModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleSaveFeature} disabled={savingContent}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#6D4C91] text-white py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all disabled:opacity-60">
                  {savingContent ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Save className="w-4 h-4"/>}
                  {editingFeature ? 'Update' : 'Add'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
