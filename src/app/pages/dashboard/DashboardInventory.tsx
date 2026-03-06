import { useState, useEffect, useMemo } from 'react';
import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Search, Plus, AlertCircle, ArrowUpDown, Edit2, Trash2, X, Upload, Check, ChevronLeft, ChevronRight, FileSpreadsheet, PackagePlus, Eye, EyeOff, RefreshCw, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';
import { uploadProductImage, deleteProductImage } from '../../lib/supabase';

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  low_stock_threshold: number | null;
  is_active: boolean;
  brand?: string | null;
  description?: string | null;
  category_id?: number | null;
  images?: string[] | null;
  created_at: string;
  categories: { name: string } | null;
}

interface ApiCategory {
  id: number;
  name: string;
}

interface BulkRow {
  name: string;
  brand: string;
  category: string;
  price: string;
  stock: string;
  low_stock_threshold: string;
  description: string;
}

function getStockStatus(product: ApiProduct) {
  const threshold = product.low_stock_threshold ?? 5;
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock <= threshold) return 'Low Stock';
  return 'In Stock';
}

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseBulkFile(file: File): Promise<BulkRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const rows = raw.slice(1).filter(r => r.some((c: any) => String(c).trim() !== ''));
        resolve(rows.map(r => ({
          name:                String(r[0] ?? '').trim(),
          brand:               String(r[1] ?? '').trim(),
          category:            String(r[2] ?? '').trim(),
          price:               String(r[3] ?? '').trim(),
          stock:               String(r[4] ?? '0').trim(),
          low_stock_threshold: String(r[5] ?? '5').trim(),
          description:         String(r[6] ?? '').trim(),
        })));
      } catch {
        reject(new Error('Could not read file. Make sure it is a valid .xlsx or .csv file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

const EMPTY_PRODUCT = {
  name:                '',
  brand:               '',
  category_id:         '',
  description:         '',
  price:               '',
  stock:               '0',
  low_stock_threshold: '5',
  is_active:           true,
};

export function DashboardInventory() {
  const { token, sessionId } = useStore();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [products, setProducts]           = useState<ApiProduct[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<ApiProduct[]>([]);
  const [categories, setCategories]       = useState<ApiCategory[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  // ── Search + filter ───────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm]   = useState('');
  const [stockFilter, setStockFilter] = useState('All');

  // ── Add Stock modal ───────────────────────────────────────────────────────
  const [stockProduct, setStockProduct] = useState<ApiProduct | null>(null);
  const [stockQty, setStockQty]         = useState('');
  const [addingStock, setAddingStock]   = useState(false);

  // ── Add New Product modal ─────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStep, setActiveStep]         = useState(1);
  const [newProduct, setNewProduct]         = useState(EMPTY_PRODUCT);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // ── Image upload (Add Product) ────────────────────────────────────────────
  const [pendingImages, setPendingImages]     = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const addImageInputRef = useRef<HTMLInputElement>(null);

  // ── Image upload (Edit Product) ───────────────────────────────────────────
  const [editPendingImages, setEditPendingImages]   = useState<File[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [uploadingEditImages, setUploadingEditImages] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  // ── Edit Product modal ────────────────────────────────────────────────────
  const [editProduct, setEditProduct]   = useState<ApiProduct | null>(null);
  const [editForm, setEditForm]         = useState({ name: '', brand: '', category_id: '', price: '', low_stock_threshold: '', is_active: true });
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // ── Deactivate confirmation ───────────────────────────────────────────────
  const [confirmDeactivate, setConfirmDeactivate] = useState<ApiProduct | null>(null);
  const [deactivating, setDeactivating]           = useState(false);

  // ── Image Lightbox ────────────────────────────────────────────────────────
  const [previewProduct, setPreviewProduct] = useState<ApiProduct | null>(null);
  const [previewIndex, setPreviewIndex]     = useState(0);

  // ── Bulk Upload modal ─────────────────────────────────────────────────────
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStep,   setBulkStep]   = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [bulkRows,   setBulkRows]   = useState<BulkRow[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: any[] } | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchInventory = (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    return Promise.all([
      apiFetch('/admin/inventory', {}, token, sessionId),
      apiFetch('/admin/categories', {}, token, sessionId).catch(() => []),
    ])
      .then(([inv, cats]) => {
        setProducts(inv.products || []);
        setLowStockAlerts(inv.lowStockAlerts || []);
        setCategories(cats || []);
      })
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchInventory(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bulk upload helpers ───────────────────────────────────────────────────
  function closeBulkModal() {
    setIsBulkModalOpen(false);
    setTimeout(() => { setBulkStep('upload'); setBulkRows([]); setBulkErrors(null); setBulkResult(null); }, 300);
  }

  async function handleBulkFilePick(file: File) {
    setBulkErrors(null);
    try {
      const rows = await parseBulkFile(file);
      if (rows.length === 0) {
        setBulkErrors('No data rows found. Make sure the file has a header row and at least one product row.');
        return;
      }
      setBulkRows(rows);
      setBulkStep('preview');
    } catch (err: any) {
      setBulkErrors(err.message || 'Failed to read file.');
    }
  }

  function downloadBulkTemplate() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name', 'Brand', 'Category', 'Price (KES)', 'Stock', 'Low Stock Threshold', 'Description'],
      ['Example Moisturiser', 'CeraVe', 'Skincare', 2500, 20, 5, 'Gentle daily moisturiser for all skin types'],
      ['Example Toner', 'The Ordinary', 'Skincare', 1800, 15, 3, 'Balancing toner with niacinamide'],
    ]);
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 22 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_bulk_template.xlsx');
  }

  async function handleBulkImport() {
    const validRows = bulkRows.filter(r => r.name && r.price && !isNaN(Number(r.price)) && Number(r.price) > 0);
    if (validRows.length === 0) return;
    setBulkStep('importing');
    try {
      const result = await apiFetch('/admin/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ products: validRows }),
      }, token, sessionId);
      setBulkResult(result);
      setBulkStep('done');
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Bulk import failed');
      setBulkStep('preview');
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const status = getStockStatus(p);
      if (stockFilter === 'Low Stock'    && status !== 'Low Stock')    return false;
      if (stockFilter === 'Out of Stock' && status !== 'Out of Stock') return false;
      if (stockFilter === 'In Stock'     && status !== 'In Stock')     return false;
      if (stockFilter === 'Hidden'       && p.is_active)               return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.categories?.name || '').toLowerCase().includes(q)
      );
    });
  }, [products, searchTerm, stockFilter]);

  const inventoryValue = useMemo(
    () => products.reduce((sum, p) => sum + p.price * p.stock, 0),
    [products]
  );

  const newThisMonth = useMemo(() => {
    const now = new Date();
    return products.filter(p => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [products]);

  // ── Add Stock ─────────────────────────────────────────────────────────────
  const handleAddStock = async () => {
    if (!stockProduct || !stockQty || isNaN(Number(stockQty)) || Number(stockQty) <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    setAddingStock(true);
    try {
      await apiFetch(
        '/admin/stock/add',
        { method: 'POST', body: JSON.stringify({ product_id: stockProduct.id, quantity: Number(stockQty) }) },
        token, sessionId
      );
      const added = Number(stockQty);
      setProducts(prev => prev.map(p => p.id === stockProduct.id ? { ...p, stock: p.stock + added } : p));
      setLowStockAlerts(prev => prev.filter(p => {
        const updated = p.id === stockProduct.id ? { ...p, stock: p.stock + added } : p;
        return updated.stock <= (updated.low_stock_threshold ?? 5);
      }));
      toast.success(`Added ${added} units to ${stockProduct.name}`);
      setStockProduct(null);
      setStockQty('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add stock');
    } finally {
      setAddingStock(false);
    }
  };

  // ── Create Product ────────────────────────────────────────────────────────
  const handleCreateProduct = async () => {
    if (!newProduct.name.trim())                            { toast.error('Product name is required'); return; }
    if (!newProduct.price || Number(newProduct.price) <= 0) { toast.error('Valid retail price is required'); return; }

    setSubmittingProduct(true);
    try {
      // 1. Upload any pending images first
      let imageUrls: string[] = [];
      if (pendingImages.length > 0) {
        setUploadingImages(true);
        imageUrls = await Promise.all(pendingImages.map(f => uploadProductImage(token!, f)));
        setUploadingImages(false);
      }

      // 2. Create the product record with image URLs
      const created: ApiProduct = await apiFetch('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name:                newProduct.name.trim(),
          brand:               newProduct.brand.trim() || null,
          category_id:         newProduct.category_id ? Number(newProduct.category_id) : null,
          description:         newProduct.description.trim() || null,
          price:               Number(newProduct.price),
          stock:               Number(newProduct.stock) || 0,
          low_stock_threshold: Number(newProduct.low_stock_threshold) || 5,
          is_active:           newProduct.is_active,
          images:              imageUrls,
        }),
      }, token, sessionId);

      setProducts(prev => [created, ...prev]);
      if (getStockStatus(created) !== 'In Stock') {
        setLowStockAlerts(prev => [...prev, created]);
      }
      toast.success(`"${created.name}" added to inventory`);
      setIsAddModalOpen(false);
      setNewProduct(EMPTY_PRODUCT);
      setPendingImages([]);
      setActiveStep(1);
    } catch (err: any) {
      setUploadingImages(false);
      toast.error(err.message || 'Failed to create product');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // ── Edit Product ──────────────────────────────────────────────────────────
  const openEdit = (product: ApiProduct) => {
    setEditProduct(product);
    setEditExistingImages(product.images || []);
    setEditPendingImages([]);
    setEditForm({
      name:                product.name,
      brand:               product.brand || '',
      category_id:         product.category_id ? String(product.category_id) : '',
      price:               String(product.price),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
      is_active:           product.is_active,
    });
  };

  const handleEditProduct = async () => {
    if (!editProduct) return;
    if (!editForm.name.trim())                           { toast.error('Product name is required'); return; }
    if (!editForm.price || Number(editForm.price) <= 0)  { toast.error('Valid price is required'); return; }

    setUpdatingProduct(true);
    try {
      // 1. Upload new images, then merge with kept existing ones
      let newUrls: string[] = [];
      if (editPendingImages.length > 0) {
        setUploadingEditImages(true);
        newUrls = await Promise.all(editPendingImages.map(f => uploadProductImage(token!, f)));
        setUploadingEditImages(false);
      }
      const allImages = [...editExistingImages, ...newUrls];

      // 2. Save product with updated images array
      const updated: ApiProduct = await apiFetch(`/admin/products/${editProduct.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name:                editForm.name.trim(),
          brand:               editForm.brand.trim() || null,
          category_id:         editForm.category_id ? Number(editForm.category_id) : null,
          price:               Number(editForm.price),
          low_stock_threshold: Number(editForm.low_stock_threshold) || 5,
          is_active:           editForm.is_active,
          images:              allImages,
        }),
      }, token, sessionId);

      setProducts(prev => prev.map(p => p.id === editProduct.id ? updated : p));
      setLowStockAlerts(prev => {
        const rest = prev.filter(p => p.id !== editProduct.id);
        return getStockStatus(updated) !== 'In Stock' ? [...rest, updated] : rest;
      });
      toast.success(`"${updated.name}" updated`);
      setEditProduct(null);
      setEditPendingImages([]);
      setEditExistingImages([]);
    } catch (err: any) {
      setUploadingEditImages(false);
      toast.error(err.message || 'Failed to update product');
    } finally {
      setUpdatingProduct(false);
    }
  };

  // Remove an existing image (from edit modal) — deletes from storage too
  const handleRemoveExistingImage = async (url: string) => {
    setEditExistingImages(prev => prev.filter(u => u !== url));
    try { await deleteProductImage(token!, url); } catch { /* ignore storage errors */ }
  };

  // ── Deactivate (hide from store) ──────────────────────────────────────────
  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    setDeactivating(true);
    try {
      await apiFetch(`/admin/products/${confirmDeactivate.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: false }),
      }, token, sessionId);
      setProducts(prev => prev.map(p => p.id === confirmDeactivate.id ? { ...p, is_active: false } : p));
      toast.success(`"${confirmDeactivate.name}" hidden from store`);
      setConfirmDeactivate(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setDeactivating(false);
    }
  };

  // ── Re-activate (show on store) ───────────────────────────────────────────
  const handleActivate = async (product: ApiProduct) => {
    try {
      await apiFetch(`/admin/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: true }),
      }, token, sessionId);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: true } : p));
      toast.success(`"${product.name}" is now visible on store`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    }
  };

  // ── New-product form field helper ─────────────────────────────────────────
  const npField = (key: keyof typeof EMPTY_PRODUCT) => ({
    value:    newProduct[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setNewProduct(prev => ({ ...prev, [key]: e.target.value })),
  });

  // ── Add Product form (3 steps) ────────────────────────────────────────────
  const renderAddProductForm = () => (
    <div className="space-y-8 max-h-[65vh] overflow-y-auto px-1">

      {activeStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Name *</label>
              <input
                placeholder="e.g. Ultra Hydrating Serum"
                {...npField('name')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
              />
              {newProduct.name && (
                <p className="text-[11px] text-gray-400">Slug: <span className="font-mono text-gray-600">{slugify(newProduct.name)}</span></p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Brand</label>
              <input
                placeholder="e.g. La Roche-Posay"
                {...npField('brand')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Category</label>
              <select
                {...npField('category_id')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Description</label>
            <textarea
              rows={4}
              placeholder="Describe the benefits, key results, and feel..."
              {...npField('description')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] resize-none"
            />
          </div>
        </motion.div>
      )}

      {activeStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Pricing & Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Retail Price (KES) *</label>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                {...npField('price')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Initial Stock Quantity</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                {...npField('stock')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                placeholder="5"
                {...npField('low_stock_threshold')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]"
              />
              <p className="text-[11px] text-gray-400">Alert appears when stock falls to or below this number.</p>
            </div>
          </div>
          {newProduct.price && Number(newProduct.price) > 0 && Number(newProduct.stock) > 0 && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-[13px] text-green-700">
              Stock value: <strong>KES {(Number(newProduct.price) * Number(newProduct.stock)).toLocaleString()}</strong>
            </div>
          )}
          <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-[12px] text-amber-700 font-medium">Stock alerts will appear in the dashboard when inventory reaches the threshold.</p>
          </div>
        </motion.div>
      )}

      {activeStep === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Images & Publish</h3>

          {/* Image upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Images (max 5)</label>
              <span className="text-[11px] text-gray-400">{pendingImages.length} / 5 selected</span>
            </div>
            <div
              className="border-2 border-dashed border-gray-200 rounded-[24px] p-8 text-center hover:border-[#6D4C91] hover:bg-[#FDFBF7] transition-all cursor-pointer group"
              onClick={() => addImageInputRef.current?.click()}
            >
              <ImagePlus className="w-8 h-8 text-gray-300 group-hover:text-[#6D4C91] mx-auto mb-3 transition-colors" />
              <p className="text-[13px] font-bold mb-1">Click to select images</p>
              <p className="text-[11px] text-gray-400">PNG, JPG, WEBP — max 10 MB each</p>
              <input
                ref={addImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  setPendingImages(prev => [...prev, ...files].slice(0, 5));
                  e.target.value = '';
                }}
              />
            </div>
            {pendingImages.length > 0 && (
              <div className="grid grid-cols-5 gap-3">
                {pendingImages.map((f, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover rounded-xl border border-gray-100" />
                    <button
                      type="button"
                      onClick={() => setPendingImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold hover:bg-red-600 transition-colors"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-[#FDFBF7] rounded-[20px] p-6 space-y-3 border border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Product Summary</p>
            <div className="flex justify-between text-[13px]"><span className="text-gray-500">Name</span><span className="font-bold">{newProduct.name || '—'}</span></div>
            {newProduct.brand && <div className="flex justify-between text-[13px]"><span className="text-gray-500">Brand</span><span className="font-medium">{newProduct.brand}</span></div>}
            {newProduct.category_id && <div className="flex justify-between text-[13px]"><span className="text-gray-500">Category</span><span className="font-medium">{categories.find(c => String(c.id) === newProduct.category_id)?.name || '—'}</span></div>}
            <div className="flex justify-between text-[13px]"><span className="text-gray-500">Price</span><span className="font-bold text-[#6D4C91]">{newProduct.price ? `KES ${Number(newProduct.price).toLocaleString()}` : '—'}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-gray-500">Initial Stock</span><span className="font-medium">{newProduct.stock} units</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-gray-500">Images</span><span className="font-medium">{pendingImages.length} {pendingImages.length === 1 ? 'image' : 'images'}</span></div>
          </div>

          {/* Visibility toggle */}
          <div
            className="flex items-center justify-between p-6 bg-[#FDFBF7] rounded-[24px] border border-gray-100 cursor-pointer"
            onClick={() => setNewProduct(prev => ({ ...prev, is_active: !prev.is_active }))}
          >
            <div>
              <p className="font-bold text-[15px]">Visible on Website</p>
              <p className="text-[13px] text-gray-500">Allow customers to see and buy this product.</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${newProduct.is_active ? 'bg-[#6D4C91]' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newProduct.is_active ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Inventory Control</h1>
          <p className="text-gray-500">Loading inventory...</p>
        </div>
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Inventory Control</h1>
          <p className="text-gray-500">Manage products, stock levels, and supply alerts.</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => fetchInventory(true)}
            disabled={refreshing}
            className="bg-white text-black border border-gray-100 px-5 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-white text-black border border-gray-200 px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => { setIsAddModalOpen(true); setActiveStep(1); setNewProduct(EMPTY_PRODUCT); }}
            className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Stock Alerts</h3>
          </div>
          <p className="text-[32px] font-bold">{lowStockAlerts.length} Items</p>
          <p className="text-[13px] text-gray-400">Require immediate restocking</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><ArrowUpDown className="w-6 h-6" /></div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Inventory Value</h3>
          </div>
          <p className="text-[32px] font-bold">KES {inventoryValue.toLocaleString()}</p>
          <p className="text-[13px] text-gray-400">Current stock at retail price</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-[#6D4C91]/10 text-[#6D4C91] rounded-xl"><Plus className="w-6 h-6" /></div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">New Items</h3>
          </div>
          <p className="text-[32px] font-bold">{newThisMonth} Products</p>
          <p className="text-[13px] text-gray-400">Added this month</p>
        </div>
      </div>

      {/* ── Product table ── */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">

        {/* Search + filter */}
        <div className="p-8 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center bg-[#F8F9FA] px-4 py-3 rounded-2xl flex-1 max-w-md border border-gray-100 focus-within:ring-2 focus-within:ring-[#6D4C91]/20 transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                placeholder="Search by name, brand, or category…"
                className="bg-transparent outline-none text-[14px] w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {(['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Hidden'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStockFilter(f)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                    stockFilter === f
                      ? f === 'Low Stock'    ? 'bg-amber-500 text-white'
                      : f === 'Out of Stock' ? 'bg-red-500 text-white'
                      : f === 'Hidden'       ? 'bg-gray-700 text-white'
                      : f === 'In Stock'     ? 'bg-green-600 text-white'
                      :                        'bg-[#6D4C91] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-[14px]">{searchTerm || stockFilter !== 'All' ? 'No products match your search or filter.' : 'No products found.'}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Product</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Category</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Brand</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Price</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Stock</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Visibility</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className={`hover:bg-[#FDFBF7] transition-colors ${!item.is_active ? 'opacity-60' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt=""
                              onClick={() => { setPreviewProduct(item); setPreviewIndex(0); }}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100 cursor-pointer hover:ring-2 hover:ring-[#6D4C91]/50 transition-all"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <ImagePlus className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <p className="text-[14px] font-bold">{item.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[14px] text-gray-500">{item.categories?.name || '—'}</td>
                      <td className="px-8 py-6 text-[14px] text-gray-500">{item.brand || '—'}</td>
                      <td className="px-8 py-6 text-[14px] font-bold">KES {item.price?.toLocaleString()}</td>
                      <td className="px-8 py-6 text-[14px] font-bold">{item.stock}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          status === 'In Stock'    ? 'bg-green-100 text-green-700' :
                          status === 'Low Stock'   ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {item.is_active
                          ? <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-700"><Eye className="w-3.5 h-3.5" /> Live</span>
                          : <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400"><EyeOff className="w-3.5 h-3.5" /> Hidden</span>
                        }
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => { setStockProduct(item); setStockQty(''); }}
                            title="Add Stock"
                            className="p-2 text-gray-400 hover:text-[#6D4C91] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit product"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {item.is_active ? (
                            <button
                              onClick={() => setConfirmDeactivate(item)}
                              title="Hide from store"
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(item)}
                              title="Show on store"
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══════════════════════ ADD STOCK MODAL ══════════════════════ */}
      <AnimatePresence>
        {stockProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStockProduct(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[20px] font-serif mb-1">Add Stock</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">{stockProduct.name}</p>
                </div>
                <button onClick={() => setStockProduct(null)} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center p-4 bg-[#FDFBF7] rounded-xl">
                  <span className="text-[13px] text-gray-500">Current Stock</span>
                  <span className="text-[18px] font-bold">{stockProduct.stock} units</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Units to Add *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={stockQty}
                    onChange={e => setStockQty(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[16px] font-bold"
                    onKeyDown={e => e.key === 'Enter' && handleAddStock()}
                  />
                </div>
                {stockQty && Number(stockQty) > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-[13px] text-green-700">
                    New total: <strong>{stockProduct.stock + Number(stockQty)} units</strong>
                  </div>
                )}
              </div>
              <div className="p-8 bg-gray-50 flex space-x-4">
                <button
                  onClick={handleAddStock}
                  disabled={addingStock || !stockQty || Number(stockQty) <= 0}
                  className="flex-grow bg-[#6D4C91] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-[#5a3e79] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {addingStock
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    : <PackagePlus className="w-4 h-4 mr-2" />}
                  Confirm Stock Add
                </button>
                <button onClick={() => setStockProduct(null)} className="px-6 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-gray-100 transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ ADD NEW PRODUCT MODAL ══════════════════════ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!submittingProduct) { setIsAddModalOpen(false); setNewProduct(EMPTY_PRODUCT); setActiveStep(1); }}} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl">

              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">Add New Product</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`h-1.5 rounded-full transition-all ${s === activeStep ? 'w-8 bg-[#6D4C91]' : s < activeStep ? 'w-4 bg-[#6D4C91]/40' : 'w-4 bg-gray-200'}`} />
                    ))}
                    <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest ml-2">Step {activeStep} of 3</p>
                  </div>
                </div>
                <button onClick={() => { if (!submittingProduct) { setIsAddModalOpen(false); setNewProduct(EMPTY_PRODUCT); setActiveStep(1); }}} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-8">
                {renderAddProductForm()}
              </div>

              <div className="p-8 bg-gray-50 flex justify-between items-center">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-30 transition-all"
                >
                  Back
                </button>
                <div className="flex space-x-4">
                  {activeStep < 3 ? (
                    <button
                      onClick={() => {
                        if (activeStep === 1 && !newProduct.name.trim()) { toast.error('Enter a product name to continue'); return; }
                        if (activeStep === 2 && (!newProduct.price || Number(newProduct.price) <= 0)) { toast.error('Enter a valid price to continue'); return; }
                        setActiveStep(prev => prev + 1);
                      }}
                      className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg"
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateProduct}
                      disabled={submittingProduct}
                      className="bg-green-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-green-700 active:scale-95 transition-all flex items-center shadow-lg disabled:opacity-60"
                    >
                      <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 ${submittingProduct ? 'block' : 'hidden'}`} />
                      {!submittingProduct && <Check className="w-4 h-4 mr-2" />}
                      {uploadingImages ? 'Uploading images…' : submittingProduct ? 'Creating…' : 'Create Product'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ EDIT PRODUCT MODAL ══════════════════════ */}
      <AnimatePresence>
        {editProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!updatingProduct) setEditProduct(null); }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl">

              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[22px] font-serif mb-1">Edit Product</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest truncate max-w-xs">{editProduct.name}</p>
                </div>
                <button onClick={() => setEditProduct(null)} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-8 space-y-5 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Name *</label>
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Brand</label>
                    <input
                      value={editForm.brand}
                      onChange={e => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g. La Roche-Posay"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Category</label>
                    <select
                      value={editForm.category_id}
                      onChange={e => setEditForm(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    >
                      <option value="">— No category —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Retail Price (KES) *</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.low_stock_threshold}
                      onChange={e => setEditForm(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                </div>

                {/* Existing images */}
                {editExistingImages.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Current Images</label>
                    <div className="grid grid-cols-5 gap-3">
                      {editExistingImages.map((url, i) => (
                        <div key={i} className="relative aspect-square">
                          <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-100" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(url)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold hover:bg-red-600 transition-colors"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add new images */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      {editExistingImages.length > 0 ? 'Add More Images' : 'Product Images'}
                    </label>
                    <span className="text-[11px] text-gray-400">{editExistingImages.length + editPendingImages.length} / 5</span>
                  </div>
                  {(editExistingImages.length + editPendingImages.length) < 5 && (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#6D4C91] hover:bg-[#FDFBF7] transition-all cursor-pointer group"
                      onClick={() => editImageInputRef.current?.click()}
                    >
                      <ImagePlus className="w-6 h-6 text-gray-300 group-hover:text-[#6D4C91] mx-auto mb-2 transition-colors" />
                      <p className="text-[12px] font-bold">Click to add images</p>
                      <p className="text-[11px] text-gray-400">PNG, JPG, WEBP</p>
                      <input
                        ref={editImageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="hidden"
                        onChange={e => {
                          const files = Array.from(e.target.files || []);
                          const slots = 5 - editExistingImages.length;
                          setEditPendingImages(prev => [...prev, ...files].slice(0, slots));
                          e.target.value = '';
                        }}
                      />
                    </div>
                  )}
                  {editPendingImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {editPendingImages.map((f, i) => (
                        <div key={i} className="relative aspect-square">
                          <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover rounded-xl border border-gray-100" />
                          <button
                            type="button"
                            onClick={() => setEditPendingImages(prev => prev.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold hover:bg-red-600 transition-colors"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center justify-between p-5 bg-[#FDFBF7] rounded-[20px] border border-gray-100 cursor-pointer"
                  onClick={() => setEditForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                >
                  <div>
                    <p className="font-bold text-[14px]">Visible on Website</p>
                    <p className="text-[12px] text-gray-500">Allow customers to see and buy this product.</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${editForm.is_active ? 'bg-[#6D4C91]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.is_active ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex gap-3">
                <button
                  onClick={handleEditProduct}
                  disabled={updatingProduct}
                  className="flex-1 bg-[#6D4C91] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center justify-center disabled:opacity-60"
                >
                  {updatingProduct
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />{uploadingEditImages ? 'Uploading…' : 'Saving…'}</>
                    : 'Save Changes'}
                </button>
                <button onClick={() => setEditProduct(null)} className="px-6 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gray-100 transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ CONFIRM DEACTIVATE ══════════════════════ */}
      <AnimatePresence>
        {confirmDeactivate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!deactivating) setConfirmDeactivate(null); }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EyeOff className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-[20px] font-serif mb-2">Hide Product?</h3>
                <p className="text-[13px] text-gray-500 mb-1">
                  <strong className="text-black">{confirmDeactivate.name}</strong> will be hidden from the store.
                </p>
                <p className="text-[12px] text-gray-400">Customers won't be able to view or purchase it. You can re-activate it any time.</p>
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="flex-1 bg-red-600 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-60"
                >
                  {deactivating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Hide from Store'}
                </button>
                <button onClick={() => setConfirmDeactivate(null)} className="px-6 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-gray-100 transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
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
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7] flex-shrink-0">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">Bulk Product Upload</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">
                    {bulkStep === 'upload'    && 'Upload Multiple Products via Spreadsheet'}
                    {bulkStep === 'preview'   && `Preview — ${bulkRows.length} row${bulkRows.length !== 1 ? 's' : ''} detected`}
                    {bulkStep === 'importing' && 'Importing products…'}
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
                        <p>Download the template, fill in your products, then upload the file. Products will be saved as <strong>hidden</strong> — add images and publish each one from the inventory table afterwards.</p>
                        <p>Category names must match existing categories exactly (case-insensitive).</p>
                      </div>
                    </div>

                    {/* Drop zone */}
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:border-[#6D4C91] hover:bg-[#FDFBF7] transition-all cursor-pointer group"
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
                        onClick={e => { e.stopPropagation(); downloadBulkTemplate(); }}
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
                        Name · Brand · Category · Price (KES) · Stock · Low Stock Threshold · Description
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Preview ── */}
                {bulkStep === 'preview' && (() => {
                  const validCount = bulkRows.filter(r => r.name && r.price && !isNaN(Number(r.price)) && Number(r.price) > 0).length;
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
                              <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-400">Brand</th>
                              <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-400">Category</th>
                              <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-gray-400">Price</th>
                              <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-gray-400">Stock</th>
                              <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-gray-400">Threshold</th>
                              <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-400">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkRows.map((row, i) => {
                              const invalid = !row.name || !row.price || isNaN(Number(row.price)) || Number(row.price) <= 0;
                              return (
                                <tr key={i} className={`border-b border-gray-50 ${invalid ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                  <td className="px-4 py-3 font-medium">{row.name || <span className="text-red-500 italic">missing</span>}</td>
                                  <td className="px-4 py-3 text-gray-500">{row.brand || '—'}</td>
                                  <td className="px-4 py-3 text-gray-500">{row.category || '—'}</td>
                                  <td className="px-4 py-3 text-right">{row.price ? `KES ${Number(row.price).toLocaleString()}` : <span className="text-red-500 italic">missing</span>}</td>
                                  <td className="px-4 py-3 text-right">{row.stock || '0'}</td>
                                  <td className="px-4 py-3 text-right">{row.low_stock_threshold || '5'}</td>
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
                    <p className="text-[16px] font-bold mb-1">Importing products…</p>
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
                      <span className="font-bold text-[#6D4C91]">{bulkResult.created}</span> product{bulkResult.created !== 1 ? 's' : ''} added successfully.
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
                    <p className="text-[12px] text-gray-400">Products are hidden by default. Go to the inventory table to add images and publish them.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 bg-gray-50 flex justify-end space-x-4 flex-shrink-0 border-t border-gray-100">
                {bulkStep === 'upload' && (
                  <button onClick={closeBulkModal} className="px-8 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gray-100 active:scale-95 transition-all">Cancel</button>
                )}
                {bulkStep === 'preview' && (() => {
                  const validCount = bulkRows.filter(r => r.name && r.price && !isNaN(Number(r.price)) && Number(r.price) > 0).length;
                  return (
                    <>
                      <button onClick={() => setBulkStep('upload')} className="px-8 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gray-100 active:scale-95 transition-all">Back</button>
                      <button
                        onClick={handleBulkImport}
                        disabled={validCount === 0}
                        className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import {validCount} Product{validCount !== 1 ? 's' : ''}
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

      {/* ══════════════════════ IMAGE LIGHTBOX ══════════════════════ */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewProduct(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} className="relative z-10 w-full max-w-xl">

              {/* Close */}
              <button onClick={() => setPreviewProduct(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-widest transition-colors">
                <X className="w-4 h-4" /> Close
              </button>

              {/* Main image */}
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-gray-900">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={previewIndex}
                    src={previewProduct.images![previewIndex]}
                    alt={previewProduct.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>

                {(previewProduct.images?.length ?? 0) > 1 && (
                  <>
                    <button
                      onClick={() => setPreviewIndex((previewIndex - 1 + previewProduct.images!.length) % previewProduct.images!.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setPreviewIndex((previewIndex + 1) % previewProduct.images!.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {previewIndex + 1} / {previewProduct.images!.length}
                    </div>
                  </>
                )}
              </div>

              {/* Product name */}
              <p className="text-center text-white font-bold mt-4 text-[15px]">{previewProduct.name}</p>

              {/* Thumbnail strip */}
              {(previewProduct.images?.length ?? 0) > 1 && (
                <div className="flex gap-2 justify-center mt-3 overflow-x-auto pb-1">
                  {previewProduct.images!.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setPreviewIndex(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${previewIndex === i ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
