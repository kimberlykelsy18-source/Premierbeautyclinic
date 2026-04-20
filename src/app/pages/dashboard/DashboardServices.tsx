import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, ToggleLeft, ToggleRight, X, ChevronDown, ChevronUp, Clock, Tag, DollarSign, FileText, Layers, ShoppingBag, Star, Search, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router';

interface FormField {
  name: string;
  label: string;
  type: 'select' | 'multiselect' | 'radio' | 'text' | 'textarea' | 'date';
  options?: string[];
  required: boolean;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  deposit_percentage: number;
  duration_minutes: number;
  category: string | null;
  is_active: boolean;
  images: string[];
  form_fields: FormField[];
  benefits: string[];
  results_stat: string | null;
}

interface Product {
  id: number;
  name: string;
  price: string;
  images: string[] | null;
  categories: { name: string } | null;
}

const CATEGORIES = ['Facial', 'Chemical Peel', 'Body Treatment', 'Massage', 'Waxing', 'Nail Care', 'Consultation', 'Other'];

const EMPTY_SERVICE: Partial<Service> = {
  name: '',
  description: '',
  base_price: 0,
  deposit_percentage: 0,
  duration_minutes: 60,
  category: '',
  images: [],
  form_fields: [],
  benefits: [],
  results_stat: '',
  is_active: true,
};

// ── Label component ────────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D4C91]/25 focus:border-[#6D4C91] bg-white transition-colors';

// ── Add / Edit Modal ───────────────────────────────────────────────────────────
function ServiceModal({ service, onClose, onSave }: { service: Partial<Service> | null; onClose: () => void; onSave: (s: Partial<Service>) => Promise<void> }) {
  const isNew = !service?.id;
  const [form, setForm]                     = useState<Partial<Service>>(service ?? EMPTY_SERVICE);
  const [saving, setSaving]                 = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [rawFormFields, setRawFormFields]   = useState(service?.form_fields ? JSON.stringify(service.form_fields, null, 2) : '[]');
  const [formFieldsError, setFormFieldsError] = useState('');
  const [rawBenefits, setRawBenefits]       = useState((service?.benefits ?? []).join('\n'));
  const [rawImages, setRawImages]           = useState((service?.images ?? []).join('\n'));

  const set = (key: keyof Service, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name?.trim()) { toast.error('Service name is required'); return; }
    if (!form.base_price || form.base_price <= 0) { toast.error('A valid price is required'); return; }

    let parsedFields: FormField[] = [];
    if (rawFormFields.trim() && rawFormFields.trim() !== '[]') {
      try {
        parsedFields = JSON.parse(rawFormFields);
        if (!Array.isArray(parsedFields)) throw new Error();
        setFormFieldsError('');
      } catch {
        setFormFieldsError('Invalid JSON — must be an array of field objects');
        return;
      }
    }

    const benefits = rawBenefits.split('\n').map(s => s.trim()).filter(Boolean);
    const images   = rawImages.split('\n').map(s => s.trim()).filter(Boolean);

    setSaving(true);
    try {
      await onSave({ ...form, form_fields: parsedFields, benefits, images });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-base font-bold text-gray-900">{isNew ? 'Add service' : 'Edit service'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Name */}
          <div>
            <Label required>Service name</Label>
            <input value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Hydrafacial Deluxe" className={inputCls} />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief description visible to customers when booking…" className={`${inputCls} resize-none`} />
          </div>

          {/* Price / Deposit / Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label required>Price (KES)</Label>
              <input type="number" min={0} value={form.base_price ?? ''} onChange={e => set('base_price', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <Label>Deposit %</Label>
              <input type="number" min={0} max={100} value={form.deposit_percentage ?? 0} onChange={e => set('deposit_percentage', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <input type="number" min={15} step={15} value={form.duration_minutes ?? 60} onChange={e => set('duration_minutes', Number(e.target.value))} className={inputCls} />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <select value={form.category ?? ''} onChange={e => set('category', e.target.value)} className={inputCls}>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Benefits — one per line */}
          <div>
            <Label>Benefits <span className="text-xs font-normal text-gray-400">(one per line, shown as checkmarks on the treatments page)</span></Label>
            <textarea
              value={rawBenefits}
              onChange={e => setRawBenefits(e.target.value)}
              rows={5}
              placeholder={'Instant glow\nDeep hydration\nReduces fine lines\nSuitable for all skin types'}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Results stat */}
          <div>
            <Label>Results stat <span className="text-xs font-normal text-gray-400">(short outcome line, e.g. "95% client satisfaction")</span></Label>
            <input
              value={form.results_stat ?? ''}
              onChange={e => set('results_stat', e.target.value)}
              placeholder="e.g. 95% of clients saw improvement in 7 days"
              className={inputCls}
            />
          </div>

          {/* Images — one URL per line */}
          <div>
            <Label>
              <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Result photos <span className="text-xs font-normal text-gray-400">(image URLs, one per line — first is the cover)</span></span>
            </Label>
            <textarea
              value={rawImages}
              onChange={e => setRawImages(e.target.value)}
              rows={4}
              placeholder="https://example.com/before-after-1.jpg"
              className={`${inputCls} resize-none font-mono text-xs`}
            />
            {/* Preview thumbnails */}
            {rawImages.trim() && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {rawImages.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 6).map((url, i) => (
                  <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-100" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                ))}
              </div>
            )}
          </div>

          {/* Active toggle (edit mode only) */}
          {!isNew && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-700">Active</p>
                <p className="text-xs text-gray-400 mt-0.5">Visible to customers on the treatments page</p>
              </div>
              <button type="button" onClick={() => set('is_active', !form.is_active)} className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${form.is_active ? 'bg-[#6D4C91]' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          )}

          {/* Intake form fields — collapsible */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setShowFormFields(v => !v)} className="w-full flex items-center justify-between px-4 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6D4C91]" />
                Intake form fields
                {(form.form_fields?.length ?? 0) > 0 && (
                  <span className="bg-[#6D4C91] text-white text-xs rounded-full px-2 py-0.5 leading-none">{form.form_fields?.length}</span>
                )}
              </span>
              {showFormFields ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showFormFields && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                <p className="text-xs text-gray-500 mt-4 mb-2">JSON array of question objects. Use <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">[]</span> for no intake form.</p>
                <textarea
                  value={rawFormFields}
                  onChange={e => { setRawFormFields(e.target.value); setFormFieldsError(''); }}
                  rows={8}
                  spellCheck={false}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#6D4C91]/25 focus:border-[#6D4C91] resize-none"
                />
                {formFieldsError && <p className="text-red-500 text-xs mt-2">{formFieldsError}</p>}
                <p className="text-xs text-gray-400 mt-2">Each object must include: <span className="font-mono">name, label, type, required</span>. Optional: <span className="font-mono">options[]</span>. Types: select, multiselect, radio, text, textarea, date.</p>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#6D4C91] text-white hover:bg-[#5c3f80] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : isNew ? 'Create service' : 'Save changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Related products panel (inside expanded service row) ───────────────────────
function RelatedProductsPanel({ serviceId, token, sessionId }: { serviceId: string; token: string | null; sessionId: string | null }) {
  const [linked, setLinked]           = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [adding, setAdding]           = useState(false);
  const [showSearch, setShowSearch]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/services/${serviceId}/products`, {}, token, sessionId);
      setLinked(Array.isArray(data) ? data : []);
    } catch {
      setLinked([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    if (allProducts.length > 0) return;
    try {
      const data = await apiFetch('/products', {}, token, sessionId);
      setAllProducts(Array.isArray(data) ? data : []);
    } catch {
      setAllProducts([]);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddProduct = async (productId: number) => {
    setAdding(true);
    try {
      await apiFetch(`/admin/services/${serviceId}/products`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      }, token, sessionId);
      await load();
      toast.success('Product linked');
    } catch (err: any) {
      toast.error(err.message || 'Failed to link product');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    try {
      await apiFetch(`/admin/services/${serviceId}/products/${productId}`, { method: 'DELETE' }, token, sessionId);
      setLinked(prev => prev.filter(p => p.id !== productId));
      toast.success('Product unlinked');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unlink product');
    }
  };

  const linkedIds = new Set(linked.map(p => p.id));
  const filteredProducts = allProducts.filter(p =>
    !linkedIds.has(p.id) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      {/* Linked products */}
      {loading ? (
        <div className="flex gap-2 flex-wrap">
          {[1, 2].map(i => <div key={i} className="w-20 h-8 bg-gray-100 rounded-full animate-pulse" />)}
        </div>
      ) : linked.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No products linked yet.</p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {linked.map(p => (
            <div key={p.id} className="flex items-center gap-1.5 bg-[#F2F1F8] text-[#6D4C91] rounded-full px-3 py-1.5 text-xs font-semibold">
              <span className="max-w-[120px] truncate">{p.name}</span>
              <button onClick={() => handleRemoveProduct(p.id)} className="hover:text-red-500 transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add product button */}
      <button
        onClick={() => { setShowSearch(v => !v); if (!showSearch) loadAll(); }}
        className="text-xs font-semibold text-[#6D4C91] hover:underline flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        Link a product
      </button>

      {/* Product search */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4C91]"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredProducts.slice(0, 20).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleAddProduct(p.id)}
                    disabled={adding}
                    className="w-full flex items-center gap-2 p-2 hover:bg-white rounded-lg transition-colors text-left disabled:opacity-50"
                  >
                    <img src={p.images?.[0] || ''} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">KES {Number(p.price).toLocaleString()}</p>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-[#6D4C91] shrink-0" />
                  </button>
                ))}
                {filteredProducts.length === 0 && <p className="text-xs text-gray-400 text-center py-4">{search ? 'No matching products.' : 'All products already linked.'}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────────
function ServiceSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-6 h-6 bg-gray-200 rounded-md flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-48" />
          <div className="flex gap-4">
            <div className="h-3 bg-gray-200 rounded-full w-24" />
            <div className="h-3 bg-gray-200 rounded-full w-16" />
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function DashboardServices() {
  const { token, sessionId } = useStore();
  const [services, setServices]     = useState<Service[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editTarget, setEditTarget] = useState<Partial<Service> | null>(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<'details' | 'products'>('details');
  const [filter, setFilter]         = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/services', {}, token, sessionId);
      setServices(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd    = () => { setEditTarget({ ...EMPTY_SERVICE }); setModalOpen(true); };
  const openEdit   = (s: Service) => { setEditTarget({ ...s }); setModalOpen(true); };
  const closeModal = () => { setEditTarget(null); setModalOpen(false); };

  const handleSave = async (form: Partial<Service>) => {
    try {
      if (form.id) {
        const updated = await apiFetch(`/admin/services-v2/${form.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        }, token, sessionId);
        setServices(ss => ss.map(s => s.id === updated.id ? updated : s));
        toast.success('Service updated');
      } else {
        const created = await apiFetch('/admin/services-v2', {
          method: 'POST',
          body: JSON.stringify(form),
        }, token, sessionId);
        setServices(ss => [...ss, created]);
        toast.success('Service created');
      }
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save service');
      throw err;
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      const updated = await apiFetch(`/admin/services-v2/${s.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !s.is_active }),
      }, token, sessionId);
      setServices(ss => ss.map(x => x.id === updated.id ? updated : x));
      toast.success(updated.is_active ? 'Service activated' : 'Service deactivated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update service');
    }
  };

  const handleExpand = (id: string, tab: 'details' | 'products') => {
    if (expandedId === id && expandedTab === tab) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setExpandedTab(tab);
    }
  };

  const filtered = services.filter(s => {
    if (filter === 'active')   return s.is_active;
    if (filter === 'inactive') return !s.is_active;
    return true;
  });

  const byCategory = filtered.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const activeCount   = services.filter(s => s.is_active).length;
  const inactiveCount = services.filter(s => !s.is_active).length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeCount} active &middot; {inactiveCount} inactive &middot;&nbsp;
            <Link to="/staff/reviews" className="text-[#6D4C91] hover:underline">Manage reviews →</Link>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#6D4C91] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5c3f80] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add service
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
              filter === f ? 'bg-[#6D4C91] text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No services found</p>
          <p className="text-xs text-gray-400 mb-4">{filter !== 'all' ? `No ${filter} services.` : 'Get started by adding your first service.'}</p>
          {filter === 'all' && <button onClick={openAdd} className="text-sm font-semibold text-[#6D4C91] hover:underline">Add first service</button>}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{cat}</h2>
              <div className="space-y-2">
                {items.map(svc => (
                  <div key={svc.id} className={`bg-white rounded-2xl border transition-all ${svc.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                    <div className="flex items-center gap-4 px-5 py-4">
                      {/* Active toggle */}
                      <button onClick={() => toggleActive(svc)} title={svc.is_active ? 'Deactivate' : 'Activate'} className="flex-shrink-0 transition-colors text-gray-400 hover:text-[#6D4C91]">
                        {svc.is_active ? <ToggleRight className="w-6 h-6 text-[#6D4C91]" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                      </button>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{svc.name}</span>
                          {!svc.is_active && <span className="text-xs font-semibold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>}
                          {svc.form_fields.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#F2F1F8] text-[#6D4C91] px-2 py-0.5 rounded-full">
                              <FileText className="w-3 h-3" /> Intake form
                            </span>
                          )}
                          {(svc.benefits?.length ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3" /> {svc.benefits.length} benefits
                            </span>
                          )}
                          {(svc.images?.length ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              <ImageIcon className="w-3 h-3" /> {svc.images.length} photos
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400"><DollarSign className="w-3 h-3" />KES {svc.base_price.toLocaleString()}</span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{svc.duration_minutes} min</span>
                          {svc.deposit_percentage > 0 && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Tag className="w-3 h-3" />{svc.deposit_percentage}% deposit</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Details expand */}
                        <button
                          onClick={() => handleExpand(svc.id, 'details')}
                          title="Details & photos"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${expandedId === svc.id && expandedTab === 'details' ? 'bg-[#F2F1F8] text-[#6D4C91]' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          {expandedId === svc.id && expandedTab === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {/* Products expand */}
                        <button
                          onClick={() => handleExpand(svc.id, 'products')}
                          title="Related products"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${expandedId === svc.id && expandedTab === 'products' ? 'bg-[#F2F1F8] text-[#6D4C91]' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                        {/* Reviews link */}
                        <Link
                          to="/staff/reviews"
                          title="Manage reviews"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#6D4C91] transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Link>
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(svc)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#F2F1F8] hover:text-[#6D4C91] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded panel */}
                    <AnimatePresence>
                      {expandedId === svc.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-0 border-t border-gray-50">
                            {expandedTab === 'details' && (
                              <div className="pt-4 space-y-4">
                                {svc.description && (
                                  <p className="text-sm text-gray-600 leading-relaxed">{svc.description}</p>
                                )}
                                {svc.results_stat && (
                                  <div className="inline-flex items-center gap-2 bg-[#F2F1F8] text-[#6D4C91] rounded-full px-4 py-1.5 text-xs font-semibold">
                                    <Star className="w-3.5 h-3.5" /> {svc.results_stat}
                                  </div>
                                )}
                                {svc.benefits && svc.benefits.length > 0 && (
                                  <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Benefits</p>
                                    <div className="flex flex-wrap gap-2">
                                      {svc.benefits.map((b, i) => (
                                        <span key={i} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">{b}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {svc.images && svc.images.length > 0 && (
                                  <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Result Photos</p>
                                    <div className="flex gap-2 flex-wrap">
                                      {svc.images.map((img, i) => (
                                        <img key={i} src={img} alt="" className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {svc.form_fields.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Intake questions ({svc.form_fields.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                      {svc.form_fields.map((f, i) => (
                                        <span key={i} className="text-xs font-medium bg-[#F2F1F8] text-[#6D4C91] px-3 py-1.5 rounded-full">
                                          {f.label}{f.required && <span className="ml-1 opacity-60">*</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {expandedTab === 'products' && (
                              <div className="pt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <ShoppingBag className="w-4 h-4 text-[#6D4C91]" />
                                  Related Products
                                </p>
                                <RelatedProductsPanel serviceId={svc.id} token={token} sessionId={sessionId} />
                              </div>
                            )}
                          </div>
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

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && editTarget !== null && (
          <ServiceModal service={editTarget} onClose={closeModal} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  );
}
