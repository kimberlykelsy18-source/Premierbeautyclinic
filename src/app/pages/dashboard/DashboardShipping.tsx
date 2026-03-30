import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, Globe, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';
import { toast } from 'sonner';

interface ShippingRegion {
  id: string;
  country: string;
  region: string;
  county: string;
  fee: number;
}

const EMPTY_FORM = { country: 'Kenya', region: '', county: '', fee: 0 };

export function DashboardShipping() {
  const { token, sessionId } = useStore();
  const [regions, setRegions]       = useState<ShippingRegion[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editedFee, setEditedFee]   = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isAdding, setIsAdding]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  useEffect(() => {
    apiFetch('/admin/shipping-regions', {}, token, sessionId)
      .then(setRegions)
      .catch(() => toast.error('Could not load shipping regions'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const countries = ['All', ...Array.from(new Set(regions.map(r => r.country))).sort()];

  const filtered = regions.filter(r => {
    const matchSearch = r.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCountry = selectedCountry === 'All' || r.country === selectedCountry;
    return matchSearch && matchCountry;
  });

  const grouped = filtered.reduce((acc, r) => {
    (acc[r.country] = acc[r.country] || []).push(r);
    return acc;
  }, {} as Record<string, ShippingRegion[]>);

  const totalCountries = new Set(regions.map(r => r.country)).size;
  const avgFee = regions.length ? Math.round(regions.reduce((s, r) => s + r.fee, 0) / regions.length) : 0;

  const startEdit = (r: ShippingRegion) => { setEditingId(r.id); setEditedFee(r.fee); };

  const saveEdit = async (id: string) => {
    if (editedFee < 0) { toast.error('Fee cannot be negative'); return; }
    setSavingEdit(true);
    try {
      const updated = await apiFetch(`/admin/shipping-regions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ fee: editedFee }),
      }, token, sessionId);
      setRegions(prev => prev.map(r => r.id === id ? { ...r, fee: updated.fee } : r));
      setEditingId(null);
      toast.success('Shipping fee updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update fee');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this shipping region?')) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/shipping-regions/${id}`, { method: 'DELETE' }, token, sessionId);
      setRegions(prev => prev.filter(r => r.id !== id));
      toast.success('Region removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove region');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async () => {
    if (!form.country || !form.region || !form.county) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.fee < 0) { toast.error('Fee cannot be negative'); return; }
    setSaving(true);
    try {
      const created = await apiFetch('/admin/shipping-regions', {
        method: 'POST',
        body: JSON.stringify(form),
      }, token, sessionId);
      setRegions(prev => [...prev, created]);
      setForm(EMPTY_FORM);
      setIsAdding(false);
      toast.success('Shipping region added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add region');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-1">Shipping</h1>
          <p className="text-gray-500 text-[14px]">Manage delivery fees by country, region, and county.</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setIsAdding(true); }}
          className="flex items-center gap-2 bg-[#000000] text-white px-6 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Region
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: Globe,  bg: 'bg-[#6D4C91]/10', color: 'text-[#6D4C91]', label: 'Countries',      value: totalCountries, sub: 'Active countries' },
          { icon: Truck,  bg: 'bg-blue-50',       color: 'text-blue-600',  label: 'Total Regions',  value: regions.length, sub: 'Counties & towns' },
          { icon: Search, bg: 'bg-green-50',      color: 'text-green-600', label: 'Average Fee',    value: `KES ${avgFee.toLocaleString()}`, sub: 'Across all regions' },
        ].map(({ icon: Icon, bg, color, label, value, sub }) => (
          <div key={label} className="bg-white p-7 rounded-[28px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 ${bg} ${color} rounded-xl`}><Icon className="w-5 h-5" /></div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
            </div>
            <p className="text-[30px] font-bold leading-none">{value}</p>
            <p className="text-[12px] text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center bg-gray-50 px-4 py-3 rounded-2xl flex-1 border border-gray-100 focus-within:ring-2 focus-within:ring-[#6D4C91]/20 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by county or region…"
              className="bg-transparent outline-none text-[14px] w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {countries.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                  selectedCountry === c ? 'bg-[#6D4C91] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-[28px] animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([country, rows]) => (
            <div key={country} className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100 bg-[#F2F1F8] flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#6D4C91]" />
                <h2 className="text-[16px] font-bold">{country}</h2>
                <span className="text-[11px] text-gray-400 font-bold ml-1">({rows.length} regions)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-7 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">County / Town</th>
                      <th className="px-7 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Region</th>
                      <th className="px-7 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Shipping Fee</th>
                      <th className="px-7 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-7 py-4 text-[14px] font-bold">{r.county}</td>
                        <td className="px-7 py-4 text-[14px] text-gray-500">{r.region}</td>
                        <td className="px-7 py-4">
                          {editingId === r.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-gray-500">KES</span>
                              <input
                                type="number"
                                value={editedFee}
                                onChange={e => setEditedFee(Number(e.target.value))}
                                className="w-24 px-3 py-1.5 border-2 border-[#6D4C91] rounded-lg outline-none text-[14px] font-bold"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className="text-[14px] font-bold">KES {r.fee.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-7 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {editingId === r.id ? (
                              <>
                                <button
                                  onClick={() => saveEdit(r.id)}
                                  disabled={savingEdit}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(r)} className="p-2 text-gray-400 hover:text-[#6D4C91] hover:bg-[#6D4C91]/5 rounded-lg transition-all">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(r.id)}
                                  disabled={deletingId === r.id}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-12 text-center">
              <Truck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-[14px]">No regions found. Add your first shipping zone above.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Region Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-gray-100 bg-[#F2F1F8] flex justify-between items-center">
                <div>
                  <h2 className="text-[22px] font-serif font-bold">Add Shipping Region</h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">Create a new shipping zone</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Country *</label>
                    <input
                      value={form.country}
                      onChange={e => setForm({ ...form, country: e.target.value })}
                      placeholder="e.g. Kenya"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Region *</label>
                    <input
                      value={form.region}
                      onChange={e => setForm({ ...form, region: e.target.value })}
                      placeholder="e.g. Nairobi"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">County / Town *</label>
                    <input
                      value={form.county}
                      onChange={e => setForm({ ...form, county: e.target.value })}
                      placeholder="e.g. Westlands"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fee (KES) *</label>
                    <input
                      type="number"
                      min={0}
                      value={form.fee}
                      onChange={e => setForm({ ...form, fee: Number(e.target.value) })}
                      placeholder="350"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 border border-gray-200 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#6D4C91] text-white px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all shadow-lg disabled:opacity-60 active:scale-95"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Region
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
