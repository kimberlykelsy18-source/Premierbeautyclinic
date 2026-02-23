import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from './Feedback';
import { useStore } from '../context/StoreContext';

export function ShippingManagement() {
  const { showFeedback } = useFeedback();
  const { shippingRegions, addShippingRegion, updateShippingRegion, deleteShippingRegion } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedFee, setEditedFee] = useState<number>(0);
  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const [newRegion, setNewRegion] = useState({
    country: '',
    region: '',
    county: '',
    fee: 0,
  });

  // Get unique countries
  const countries = ['All', ...Array.from(new Set(shippingRegions.map(r => r.country))).sort()];

  // Filter regions
  const filteredRegions = shippingRegions.filter(region => {
    const matchesSearch = region.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         region.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || region.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  // Group by country
  const groupedRegions = filteredRegions.reduce((acc, region) => {
    if (!acc[region.country]) {
      acc[region.country] = [];
    }
    acc[region.country].push(region);
    return acc;
  }, {} as Record<string, typeof shippingRegions>);

  const startEdit = (id: string, currentFee: number) => {
    setEditingId(id);
    setEditedFee(currentFee);
  };

  const saveEdit = (id: string) => {
    if (editedFee < 0) {
      showFeedback('error', 'Invalid Fee', 'Shipping fee cannot be negative');
      return;
    }
    updateShippingRegion(id, editedFee);
    setEditingId(null);
    showFeedback('success', 'Fee Updated', 'Shipping fee has been saved');
  };

  const handleAddRegion = () => {
    if (!newRegion.country || !newRegion.region || !newRegion.county) {
      showFeedback('error', 'Incomplete Data', 'Please fill in all required fields');
      return;
    }
    if (newRegion.fee < 0) {
      showFeedback('error', 'Invalid Fee', 'Shipping fee cannot be negative');
      return;
    }

    addShippingRegion({
      id: Date.now().toString(),
      ...newRegion,
    });

    setNewRegion({ country: '', region: '', county: '', fee: 0 });
    setIsAddingRegion(false);
    showFeedback('success', 'Region Added', 'New shipping region has been created');
  };

  const handleDeleteRegion = (id: string) => {
    deleteShippingRegion(id);
    showFeedback('success', 'Region Deleted', 'Shipping region has been removed');
  };

  // Calculate stats
  const totalRegions = shippingRegions.length;
  const totalCountries = new Set(shippingRegions.map(r => r.country)).size;
  const avgFee = Math.round(shippingRegions.reduce((sum, r) => sum + r.fee, 0) / shippingRegions.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Shipping Management</h1>
          <p className="text-gray-500">Manage delivery fees by country, region, and county.</p>
        </div>
        <button
          onClick={() => setIsAddingRegion(true)}
          className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Region
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-[#6D4C91]/10 text-[#6D4C91] rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Countries</h3>
          </div>
          <p className="text-[32px] font-bold">{totalCountries}</p>
          <p className="text-[13px] text-gray-400">Active countries</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Total Regions</h3>
          </div>
          <p className="text-[32px] font-bold">{totalRegions}</p>
          <p className="text-[13px] text-gray-400">Counties & towns</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Average Fee</h3>
          </div>
          <p className="text-[32px] font-bold">KES {avgFee}</p>
          <p className="text-[13px] text-gray-400">Across all regions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center bg-[#F8F9FA] px-4 py-3 rounded-2xl flex-1 border border-gray-100 focus-within:ring-2 focus-within:ring-[#6D4C91]/20 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by county or region..."
              className="bg-transparent outline-none text-[14px] w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {countries.map(country => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all ${
                  selectedCountry === country
                    ? 'bg-[#6D4C91] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Regions Table */}
      <div className="space-y-6">
        {Object.entries(groupedRegions).map(([country, regions]) => (
          <div key={country} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-[#6D4C91]" />
                <h2 className="text-[18px] font-serif font-bold">{country}</h2>
                <span className="text-[12px] text-gray-400 font-bold">({regions.length} regions)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">County/Town</th>
                    <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Region</th>
                    <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Shipping Fee</th>
                    <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {regions.map((region) => (
                    <tr key={region.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-8 py-5 text-[14px] font-bold">{region.county}</td>
                      <td className="px-8 py-5 text-[14px] text-gray-500">{region.region}</td>
                      <td className="px-8 py-5">
                        {editingId === region.id ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-[14px] font-medium">KES</span>
                            <input
                              type="number"
                              value={editedFee}
                              onChange={(e) => setEditedFee(Number(e.target.value))}
                              className="w-24 px-3 py-2 border border-[#6D4C91] rounded-lg outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] font-bold"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-[14px] font-bold">KES {region.fee.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end space-x-2">
                          {editingId === region.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(region.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(region.id, region.fee)}
                                className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRegion(region.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                title="Delete"
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

        {filteredRegions.length === 0 && (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-[14px]">No regions found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Region Modal */}
      <AnimatePresence>
        {isAddingRegion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingRegion(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">Add Shipping Region</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">
                    Create a new shipping zone
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingRegion(false)}
                  className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Country *
                    </label>
                    <input
                      value={newRegion.country}
                      onChange={(e) => setNewRegion({ ...newRegion, country: e.target.value })}
                      placeholder="e.g., Tanzania"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Region *
                    </label>
                    <input
                      value={newRegion.region}
                      onChange={(e) => setNewRegion({ ...newRegion, region: e.target.value })}
                      placeholder="e.g., Dar es Salaam"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      County/Town *
                    </label>
                    <input
                      value={newRegion.county}
                      onChange={(e) => setNewRegion({ ...newRegion, county: e.target.value })}
                      placeholder="e.g., Kinondoni"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Shipping Fee (KES) *
                    </label>
                    <input
                      type="number"
                      value={newRegion.fee}
                      onChange={(e) => setNewRegion({ ...newRegion, fee: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex justify-end space-x-4">
                <button
                  onClick={() => setIsAddingRegion(false)}
                  className="px-8 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gray-100 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRegion}
                  className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add Region</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}