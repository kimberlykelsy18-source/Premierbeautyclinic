import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, ToggleLeft, ToggleRight, X, ChevronDown, ChevronUp, Clock, Tag, DollarSign, FileText, Layers, ShoppingBag, Star, Search, Image as ImageIcon, MessageSquare, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router';
import { ImageUpload } from '../../components/ui/ImageUpload';

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

const CATEGORIES = [
  'Imaging & Consultation',
  'Facial Treatments',
  'Chemical Peel Treatments',
  'Regenerative Therapy',
  'Skin Treatments',
  'Acne Program',
  'Hyperpigmentation Program',
  'Melasma',
  'Body Treatment',
  'Massage',
  'Waxing',
  'Nail Care',
  'Other',
];

interface BulkServiceRow {
  name: string;
  category: string;
  price: string;
  duration_minutes: string;
  deposit_percentage: string;
  description: string;
}

function parseBulkServicesFile(file: File): Promise<BulkServiceRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const rows = raw.slice(1).filter(r => r.some((c: any) => String(c).trim() !== ''));
        resolve(rows.map(r => ({
          name:               String(r[0] ?? '').trim(),
          category:           String(r[1] ?? '').trim(),
          price:              String(r[2] ?? '').trim(),
          duration_minutes:   String(r[3] ?? '60').trim(),
          deposit_percentage: String(r[4] ?? '0').trim(),
          description:        String(r[5] ?? '').trim(),
        })));
      } catch {
        reject(new Error('Could not read file. Make sure it is a valid .xlsx or .csv file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

async function downloadServiceTemplate() {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['Name', 'Category', 'Price (KES)', 'Duration (min)', 'Deposit %', 'Description'],
    ['Consultation & AI Skin Analysis', 'Imaging & Consultation', 2500, 60, 0, 'Comprehensive assessment combining consultation and professional evaluation of skin type, condition and key skin parameters'],
    ['Dermatologist Consultation', 'Imaging & Consultation', 5000, 60, 0, 'Medical assessment by a Dermatologist to evaluate skin concerns, establish diagnosis and recommend treatment options'],
    ['Scalp Analysis', 'Imaging & Consultation', 2500, 60, 0, 'Thorough examination of scalp and hair to assess dryness, oil imbalance, dandruff, hair thinning or scalp sensitivity'],
    ['Dermatoscopy', 'Imaging & Consultation', 3500, 60, 0, 'Non-invasive diagnostic procedure using a dermatoscope to examine skin lesions, vascular patterns and other structures'],
    ['Hydrafacial', 'Facial Treatments', 15000, 60, 0, 'Deep cleanses, exfoliates, extracts pores and hydrates using serum infusion technology to improve glow and reduce congestion'],
    ['Premier Signature Facial', 'Facial Treatments', 8500, 45, 0, 'Deep cleansing treatment that removes impurities for a clean, balanced and refreshed skin'],
    ['Brightening Facial', 'Facial Treatments', 8500, 60, 0, 'Enhances product absorption and evens out skin tone with brightening ingredients and boosts radiance'],
    ['Premier Anti-Age Facial', 'Facial Treatments', 15000, 50, 0, 'Firming facial using collagen-boosting serums and facial massage including neck and decollete'],
    ['Skin Soothing Facial', 'Facial Treatments', 7500, 45, 0, 'Gentle treatment that reduces irritation, calms the skin and boosts moisture balance for radiance'],
    ['Express Facial', 'Facial Treatments', 5000, 30, 0, 'Quick effective treatment that deep cleanses, exfoliates and hydrates the skin'],
    ['Bridal Facial', 'Facial Treatments', 18000, 90, 0, 'Luxurious radiance boosting treatment that deeply hydrates, firms and brightens face, neck and decollete'],
    ['Clarifying Peel', 'Chemical Peel Treatments', 15000, 60, 0, 'Instant radiance, smoother texture and beginner friendly'],
    ['Brightening Peel', 'Chemical Peel Treatments', 15000, 60, 0, 'Targets hyperpigmentation, sun damage and uneven skin tone'],
    ['Revitalizing Peel', 'Chemical Peel Treatments', 15000, 60, 0, 'Clears congestion, controls oil and reduces breakouts'],
    ['Age-Defying Retinol Peel', 'Chemical Peel Treatments', 18000, 60, 0, 'Anti-aging, collagen boosting treatment that refines pores'],
    ['Microneedling with Concentrate', 'Regenerative Therapy', 18000, 90, 0, 'Promotes collagen production, improves skin texture and reduces scars using concentrated active serum blend'],
    ['Microneedling with GFC', 'Regenerative Therapy', 35000, 90, 0, 'Promotes collagen production and improves skin texture using Growth Factor Concentrate technology'],
    ['Premier Regeneration – Face & Neck', 'Regenerative Therapy', 25000, 90, 0, 'Targets early aging signs, improves elasticity and enhances overall tone and texture'],
    ['Premier Regeneration – Stretch Marks', 'Regenerative Therapy', 35000, 90, 0, 'Customized microneedling protocol for stretch marks, uneven texture or post-inflammatory pigmentation'],
    ['Brightening IV Therapy', 'Regenerative Therapy', 20000, 120, 0, 'Medical-grade IV therapy to improve skin radiance and even skin tone by delivering antioxidants into the bloodstream'],
    ['Weightloss IV Therapy', 'Regenerative Therapy', 20000, 120, 0, 'Medical-grade IV therapy to support metabolism and fat burning while providing essential nutrients and hydration'],
    ['Detox IV Therapy', 'Regenerative Therapy', 20000, 120, 0, 'IV therapy infused with vitamins and antioxidants to support hydration, replenish nutrients and promote wellness'],
    ['Skin Tag Removal', 'Skin Treatments', 0, 45, 0, 'Safe and precise removal of benign skin growths to restore smooth, healthy-looking skin — update price before publishing'],
    ['Microdermabrasion', 'Skin Treatments', 0, 45, 0, 'Non-invasive exfoliation of dead skin cells improving texture and promoting a smoother, radiant complexion — update price before publishing'],
    ['Dermaplaning', 'Skin Treatments', 2000, 30, 0, 'Non-invasive exfoliation to eliminate surface buildup and fine facial hair for a radiant, refined complexion'],
    ['Acne Program – Level 1 (Comedonal)', 'Acne Program', 50000, 0, 30, 'Multi-session program for whiteheads and blackheads: 2x Clarifying Facial+LED, 2x Clarifying Peel+LED, 1x Microneedling'],
    ['Acne Program – Level 2 (Papular)', 'Acne Program', 107000, 0, 30, 'Multi-session program for red inflamed bumps: 2x Clarifying Facial, 3x Clarifying Peel, 1x Microneedling, 3x IV Gut Health'],
    ['Acne Program – Level 3 (Pustular)', 'Acne Program', 142500, 0, 30, 'Multi-session program for pus-filled lesions: 3x Clarifying Facial, 3x Clarifying Peel, 1x Microneedling, 5x IV Gut Health'],
    ['Acne Program – Level 4 (Cystic)', 'Acne Program', 163000, 0, 30, 'Multi-session program for deep cysts: Medical Management, 4x Clarifying Facial, 3x Clarifying Peel, 2x Microneedling, 5x IV Gut Health'],
    ['Hyperpigmentation Program – Level 1 (Mild PIH)', 'Hyperpigmentation Program', 55500, 0, 30, 'Mild brown spots: 1x Clarifying Facial, 2x Brightening Facial, 1x Brightening Peel, 1x Clarifying Peel, 1x Microneedling'],
    ['Hyperpigmentation Program – Level 2 (Moderate)', 'Hyperpigmentation Program', 82500, 0, 30, 'Dark brown spots: 1x Clarifying Facial, 2x Brightening Facial, 1x Clarifying Peel, 2x Brightening Peel, 2x Microneedling'],
    ['Hyperpigmentation Program – Level 3 (Severe PIH)', 'Hyperpigmentation Program', 110500, 0, 30, 'Severe pigmentation: 1x Clarifying Facial, 2x Brightening Facial, 1x Clarifying Peel, 2x Brightening Peel, 2x Microneedling, 1x Microneedling+GFC'],
    ['Melasma – Level 1 (Epidermal)', 'Melasma', 82500, 0, 30, 'Light brown patches: 1x Clarifying Facial, 2x Brightening Facial, 3x Brightening Peel, 2x Microneedling with Tranexamic'],
    ['Melasma – Level 2 (Dermal)', 'Melasma', 122500, 0, 30, 'Dark blurred patches: 1x Clarifying Facial, 2x Brightening Facial, 4x Brightening Peel, 4x Microneedling, 1x Microneedling+GFC'],
    ['Melasma – Level 3 (Mixed)', 'Melasma', 165500, 0, 30, 'Mixed patches: 1x Clarifying Facial, 2x Brightening Facial, 5x Brightening Peel, 3x Microneedling, 2x Microneedling+GFC'],
  ]);
  ws['!cols'] = [{ wch: 45 }, { wch: 28 }, { wch: 14 }, { wch: 15 }, { wch: 12 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Services');
  XLSX.writeFile(wb, 'services_bulk_template.xlsx');
}

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
function ServiceModal({ service, onClose, onSave, token, sessionId, categories }: { service: Partial<Service> | null; onClose: () => void; onSave: (s: Partial<Service>) => Promise<void>; token: string | null; sessionId: string | null; categories: string[] }) {
  const isNew = !service?.id;
  const [form, setForm]                     = useState<Partial<Service>>(service ?? EMPTY_SERVICE);
  const [saving, setSaving]                 = useState(false);
  const [showFormFields, setShowFormFields] = useState(false);
  const [rawFormFields, setRawFormFields]   = useState(service?.form_fields ? JSON.stringify(service.form_fields, null, 2) : '[]');
  const [formFieldsError, setFormFieldsError] = useState('');
  const [rawBenefits, setRawBenefits]       = useState((service?.benefits ?? []).join('\n'));

  const set = (key: keyof Service, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const images      = form.images ?? [];
  const setImages   = (imgs: string[]) => setForm(f => ({ ...f, images: imgs }));
  const addSlot     = () => setImages([...images, '']);
  const removeSlot  = (i: number) => setImages(images.filter((_, idx) => idx !== i));
  const updateSlot  = (i: number, url: string) => setImages(images.map((v, idx) => idx === i ? url : v));

  const handleSubmit = async () => {
    if (!form.name?.trim()) { toast.error('Service name is required'); return; }
    if (form.base_price === undefined || form.base_price === null || isNaN(Number(form.base_price)) || Number(form.base_price) < 0) {
      toast.error('Price must be 0 or more'); return;
    }

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

    const benefits    = rawBenefits.split('\n').map(s => s.trim()).filter(Boolean);
    const cleanImages = images.filter(Boolean);

    setSaving(true);
    try {
      await onSave({ ...form, form_fields: parsedFields, benefits, images: cleanImages });
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
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
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

          {/* Images — upload tiles */}
          <div>
            <Label>
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Photos
                <span className="text-xs font-normal text-gray-400">— first is the cover shown on the services page</span>
              </span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 z-10 bg-[#6D4C91] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Cover</span>
                  )}
                  <ImageUpload
                    value={url}
                    onChange={newUrl => newUrl ? updateSlot(i, newUrl) : removeSlot(i)}
                    token={token}
                    sessionId={sessionId}
                    folder="services"
                    aspectClass="aspect-square"
                  />
                </div>
              ))}
              {images.length < 6 && (
                <button
                  type="button"
                  onClick={addSlot}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#6D4C91]/50 hover:text-[#6D4C91] transition-all text-xs font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add photo
                </button>
              )}
            </div>
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

  // ── Bulk Upload ───────────────────────────────────────────────────────────
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStep,   setBulkStep]   = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [bulkRows,   setBulkRows]   = useState<BulkServiceRow[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: any[] } | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

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

  // ── Bulk upload helpers ───────────────────────────────────────────────────
  function closeBulkModal() {
    setIsBulkModalOpen(false);
    setTimeout(() => { setBulkStep('upload'); setBulkRows([]); setBulkErrors(null); setBulkResult(null); }, 300);
  }

  async function handleBulkFilePick(file: File) {
    setBulkErrors(null);
    try {
      const rows = await parseBulkServicesFile(file);
      if (rows.length === 0) {
        setBulkErrors('No data rows found. Make sure the file has a header row and at least one service row.');
        return;
      }
      setBulkRows(rows);
      setBulkStep('preview');
    } catch (err: any) {
      setBulkErrors(err.message || 'Failed to read file.');
    }
  }

  async function handleServiceBulkImport() {
    const validRows = bulkRows.filter(r => r.name && r.price !== '' && !isNaN(Number(r.price)) && Number(r.price) >= 0);
    if (validRows.length === 0) return;
    setBulkStep('importing');
    try {
      const result = await apiFetch('/admin/services/bulk', {
        method: 'POST',
        body: JSON.stringify({ services: validRows }),
      }, token, sessionId);
      setBulkResult(result);
      setBulkStep('done');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Bulk import failed');
      setBulkStep('preview');
    }
  }

  // Dynamic categories: hardcoded defaults + any categories from existing services
  const allServiceCategories = useMemo(() => {
    const fromServices = services.map(s => s.category).filter(Boolean) as string[];
    return [...new Set([...CATEGORIES, ...fromServices])].sort();
  }, [services]);

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
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk upload
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#6D4C91] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5c3f80] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add service
          </button>
        </div>
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
          <ServiceModal service={editTarget} onClose={closeModal} onSave={handleSave} token={token} sessionId={sessionId} categories={allServiceCategories} />
        )}
      </AnimatePresence>

      {/* ══════════════════════ BULK UPLOAD MODAL ══════════════════════ */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeBulkModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative bg-white w-full ${bulkStep === 'preview' ? 'max-w-5xl' : 'max-w-3xl'} rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col transition-all duration-300`}
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#F2F1F8] flex-shrink-0">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">Bulk Service Upload</h2>
                  <p className="text-gray-500 text-[12px] font-bold uppercase tracking-widest">
                    {bulkStep === 'upload'    && 'Upload Multiple Services via Spreadsheet'}
                    {bulkStep === 'preview'   && `Preview — ${bulkRows.length} row${bulkRows.length !== 1 ? 's' : ''} detected`}
                    {bulkStep === 'importing' && 'Importing services…'}
                    {bulkStep === 'done'      && 'Import Complete'}
                  </p>
                </div>
                <button onClick={closeBulkModal} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1">

                {/* ── Step 1: Upload ── */}
                {bulkStep === 'upload' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-start space-x-3 p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-[12px] text-blue-700 space-y-1">
                        <p className="font-bold">How it works</p>
                        <p>Download the template — it comes pre-filled with all Premier Beauty Clinic services. Edit prices, descriptions and durations as needed, then upload.</p>
                        <p>Services will be saved as <strong>hidden</strong>. Add photos and activate each one from this page afterwards. Services with price 0 (e.g. Skin Tag Removal) must have their price updated before activating.</p>
                      </div>
                    </div>

                    {/* Drop zone */}
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:border-[#6D4C91] hover:bg-[#F2F1F8] transition-all cursor-pointer group"
                      onClick={() => bulkFileInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={async e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) await handleBulkFilePick(f); }}
                    >
                      <input
                        ref={bulkFileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={async e => { const f = e.target.files?.[0]; if (f) await handleBulkFilePick(f); e.target.value = ''; }}
                      />
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="w-10 h-10 text-gray-300 group-hover:text-[#6D4C91]" />
                      </div>
                      <p className="text-[16px] font-bold mb-2">Drop Excel or CSV file here</p>
                      <p className="text-[13px] text-gray-400 mb-6">or click to browse — .xlsx, .xls, .csv supported</p>
                      <button
                        onClick={e => { e.stopPropagation(); downloadServiceTemplate(); }}
                        className="bg-white border border-gray-200 text-black px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                      >
                        Download Template
                      </button>
                    </div>

                    {bulkErrors && (
                      <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl border border-red-100">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-[12px] text-red-600">{bulkErrors}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-[13px] font-bold uppercase tracking-widest text-gray-400">Column Order</h3>
                      <div className="bg-gray-50 p-5 rounded-xl text-[12px] font-mono text-gray-700">
                        Name · Category · Price (KES) · Duration (min) · Deposit % · Description
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Preview ── */}
                {bulkStep === 'preview' && (() => {
                  const validCount = bulkRows.filter(r => r.name && r.price !== '' && !isNaN(Number(r.price)) && Number(r.price) >= 0).length;
                  return (
                    <div className="p-8 space-y-6">
                      <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="text-[12px] text-amber-700">
                          Review the data below. <strong>{validCount} valid</strong> row{validCount !== 1 ? 's' : ''} will be imported.
                          {bulkRows.length - validCount > 0 && <span className="text-red-600"> {bulkRows.length - validCount} invalid row{bulkRows.length - validCount !== 1 ? 's' : ''} will be skipped.</span>}
                        </p>
                      </div>
                      <div className="overflow-x-auto rounded-[20px] border border-gray-100">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-400">#</th>
                              <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-400">Name</th>
                              <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-400">Category</th>
                              <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-gray-400">Price</th>
                              <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-gray-400">Duration</th>
                              <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-gray-400">Deposit %</th>
                              <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-400">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkRows.map((row, i) => {
                              const invalid = !row.name || row.price === '' || isNaN(Number(row.price)) || Number(row.price) < 0;
                              return (
                                <tr key={i} className={`border-b border-gray-50 ${invalid ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                  <td className="px-4 py-3 font-medium">{row.name || <span className="text-red-500 italic">missing</span>}</td>
                                  <td className="px-4 py-3 text-gray-500">{row.category || '—'}</td>
                                  <td className="px-4 py-3 text-right">{row.price !== '' ? `KES ${Number(row.price).toLocaleString()}` : <span className="text-red-500 italic">missing</span>}</td>
                                  <td className="px-4 py-3 text-right">{row.duration_minutes ? `${row.duration_minutes} min` : '—'}</td>
                                  <td className="px-4 py-3 text-right">{row.deposit_percentage || '0'}%</td>
                                  <td className="px-4 py-3">
                                    {invalid
                                      ? <span className="text-[10px] bg-red-100 text-red-600 font-bold uppercase px-2 py-1 rounded-full">Skip</span>
                                      : <span className="text-[10px] bg-green-100 text-green-700 font-bold uppercase px-2 py-1 rounded-full">Ready</span>
                                    }
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Step 3: Importing ── */}
                {bulkStep === 'importing' && (
                  <div className="p-20 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin mb-6" />
                    <p className="text-[16px] font-bold mb-1">Importing services…</p>
                    <p className="text-[13px] text-gray-400">Please wait, do not close this window.</p>
                  </div>
                )}

                {/* ── Step 4: Done ── */}
                {bulkStep === 'done' && bulkResult && (
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-[20px] font-bold mb-2">Import Complete</p>
                    <p className="text-[15px] text-gray-500 mb-6">
                      <span className="font-bold text-[#6D4C91]">{bulkResult.created}</span> service{bulkResult.created !== 1 ? 's' : ''} added successfully.
                    </p>
                    {bulkResult.errors.length > 0 && (
                      <div className="w-full bg-red-50 rounded-xl border border-red-100 p-5 text-left mb-6">
                        <p className="text-[12px] font-bold uppercase tracking-widest text-red-600 mb-3">{bulkResult.errors.length} row{bulkResult.errors.length !== 1 ? 's' : ''} skipped</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {bulkResult.errors.map((e: any, i: number) => (
                            <p key={i} className="text-[12px] text-red-600">Row {e.row}{e.name ? ` (${e.name})` : ''}: {e.error}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[12px] text-gray-400">Services are hidden by default. Add photos and activate each one from this page.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 bg-gray-50 flex justify-end space-x-4 flex-shrink-0 border-t border-gray-100">
                {bulkStep === 'upload' && (
                  <button onClick={closeBulkModal} className="px-8 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gray-100 active:scale-95 transition-all">Cancel</button>
                )}
                {bulkStep === 'preview' && (() => {
                  const validCount = bulkRows.filter(r => r.name && r.price !== '' && !isNaN(Number(r.price)) && Number(r.price) >= 0).length;
                  return (
                    <>
                      <button onClick={() => setBulkStep('upload')} className="px-8 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gray-100 active:scale-95 transition-all">Back</button>
                      <button
                        onClick={handleServiceBulkImport}
                        disabled={validCount === 0}
                        className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import {validCount} Service{validCount !== 1 ? 's' : ''}
                      </button>
                    </>
                  );
                })()}
                {bulkStep === 'done' && (
                  <button onClick={closeBulkModal} className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all">Done</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
