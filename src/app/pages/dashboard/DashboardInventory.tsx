import { useState } from 'react';
import { Search, Plus, AlertCircle, ArrowUpDown, MoreVertical, Edit, Trash2, X, Upload, Check, ChevronRight, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../../components/Feedback';

const INVENTORY = [
  { id: 'PRD-001', name: 'Glow Boosting Serum', category: 'Serums', stock: 45, price: '3,500', status: 'In Stock', brand: 'Premier' },
  { id: 'PRD-002', name: 'Hydrating Milky Cleanser', category: 'Cleansers', stock: 12, price: '2,800', status: 'Low Stock', brand: 'CeraVe' },
  { id: 'PRD-003', name: 'Mineral Sunscreen SPF 50', category: 'Sun Care', stock: 0, price: '4,200', status: 'Out of Stock', brand: 'La Roche-Posay' },
  { id: 'PRD-004', name: 'Overnight Repair Cream', category: 'Moisturizers', stock: 28, price: '5,500', status: 'In Stock', brand: 'Bioderma' },
  { id: 'PRD-005', name: 'Salicylic Acid Treatment', category: 'Treatments', stock: 5, price: '3,200', status: 'Low Stock', brand: 'The Ordinary' },
];

const CATEGORIES = ['Cleansers', 'Serums', 'Moisturizers', 'Sun Care', 'Treatments', 'Toners', 'Eye Care', 'Mists'];
const BRANDS = ['La Roche-Posay', 'CeraVe', 'Bioderma', 'Vichy', 'The Ordinary', 'Paula\'s Choice', 'Mario Badescu', 'Premier'];

export function DashboardInventory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { showFeedback } = useFeedback();

  const renderAddProductForm = () => (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto px-1">
      {activeStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Name *</label>
              <input placeholder="e.g. Ultra Hydrating Serum" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Brand *</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]">
                <option value="">Select Brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Category *</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]">
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">SKU / ID</label>
              <input placeholder="PRD-XXXX" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Description</label>
            <textarea rows={4} placeholder="Describe the benefits, key results, and feel..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] resize-none" />
          </div>
        </motion.div>
      )}

      {activeStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Retail Price (KES) *</label>
              <input type="number" placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Cost Price (KES)</label>
              <input type="number" placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Stock Quantity *</label>
              <input type="number" placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Low Stock Alert Threshold</label>
              <input type="number" placeholder="5" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px]" />
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-[12px] text-amber-700 font-medium">Auto-restock notifications will be sent when inventory hits the threshold.</p>
          </div>
        </motion.div>
      )}

      {activeStep === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Ingredients & Usage</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Key Ingredients</label>
              <textarea rows={3} placeholder="List main active ingredients..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Full Ingredient List (INCI)</label>
              <textarea rows={3} placeholder="Paste full INCI list here..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">How to Use</label>
              <textarea rows={3} placeholder="Step-by-step application instructions..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 transition-all text-[14px] resize-none" />
            </div>
          </div>
        </motion.div>
      )}

      {activeStep === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Media & Visibility</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Images (Multiple)</label>
                <span className="text-[10px] text-gray-400">Max 5 images</span>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:border-[#6D4C91] hover:bg-[#FDFBF7] transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#6D4C91]" />
                </div>
                <p className="text-[14px] font-bold mb-1">Click or drag to upload multiple images</p>
                <p className="text-[12px] text-gray-400">PNG, JPG up to 10MB each (Recommended: 1000x1250px)</p>
              </div>
              {/* Placeholder for showing selected images */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-3">Images will automatically resize to fit the website layout while maintaining quality.</p>
            </div>
            <div className="flex items-center justify-between p-6 bg-[#FDFBF7] rounded-[24px]">
              <div>
                <p className="font-bold text-[15px]">Visible on Website</p>
                <p className="text-[13px] text-gray-500">Allow customers to see and buy this product.</p>
              </div>
              <div className="w-12 h-6 bg-[#6D4C91] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Inventory Control</h1>
          <p className="text-gray-500">Manage products, stock levels, and supply alerts.</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-white text-black border border-gray-200 px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            <span>Bulk Upload</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Stock Alerts</h3>
          </div>
          <p className="text-[32px] font-bold">12 Items</p>
          <p className="text-[13px] text-gray-400">Require immediate restocking</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><ArrowUpDown className="w-6 h-6" /></div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Inventory Value</h3>
          </div>
          <p className="text-[32px] font-bold">KES 2.4M</p>
          <p className="text-[13px] text-gray-400">Current stock at cost</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-[#6D4C91]/10 text-[#6D4C91] rounded-xl"><Plus className="w-6 h-6" /></div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest">New Items</h3>
          </div>
          <p className="text-[32px] font-bold">8 Products</p>
          <p className="text-[13px] text-gray-400">Added this month</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center bg-[#F8F9FA] px-4 py-3 rounded-2xl w-full max-w-md border border-gray-100 focus-within:ring-2 focus-within:ring-[#6D4C91]/20 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input placeholder="Search inventory..." className="bg-transparent outline-none text-[14px] w-full" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Name</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">SKU</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Brand</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Price</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Stock</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {INVENTORY.map((item) => (
                <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-8 py-6 text-[14px] font-bold">{item.name}</td>
                  <td className="px-8 py-6 text-[14px] text-gray-500">{item.id}</td>
                  <td className="px-8 py-6 text-[14px] text-gray-500">{item.brand}</td>
                  <td className="px-8 py-6 text-[14px] font-bold">KES {item.price}</td>
                  <td className="px-8 py-6 text-[14px] font-bold">{item.stock}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'In Stock' ? 'bg-green-100 text-green-700' : 
                      item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">Add New Product</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">Step {activeStep} of 4</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
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
                  {activeStep < 4 ? (
                    <button 
                      onClick={() => setActiveStep(prev => prev + 1)}
                      className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsAddModalOpen(false)}
                      className="bg-green-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-green-700 active:scale-95 transition-all flex items-center shadow-lg"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      <span>Create Product</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">Bulk Product Upload</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">Upload Multiple Products via CSV/Excel</p>
                </div>
                <button onClick={() => setIsBulkModalOpen(false)} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <div className="text-[12px] text-blue-700">
                      <p className="font-bold mb-1">Product IDs will be auto-generated</p>
                      <p>Categories and Brands must be pre-populated in the database. Use the dropdowns to match existing values.</p>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:border-[#6D4C91] hover:bg-[#FDFBF7] transition-all cursor-pointer group">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-10 h-10 text-gray-300 group-hover:text-[#6D4C91]" />
                    </div>
                    <p className="text-[16px] font-bold mb-2">Drop CSV or Excel file here</p>
                    <p className="text-[13px] text-gray-400 mb-6">or click to browse</p>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white border border-gray-200 text-black px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                      Download Template
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[14px] font-bold uppercase tracking-widest text-gray-400">CSV Format Requirements</h3>
                    <div className="bg-gray-50 p-6 rounded-xl text-[12px] font-mono">
                      <p className="text-gray-500 mb-2">Column Headers (in order):</p>
                      <p className="text-black">Product Name, Brand, Category, Price, Cost, Stock, Description, Ingredients, Usage</p>
                    </div>
                    <p className="text-[11px] text-gray-400">Note: Brand and Category values must match existing options in the database.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex justify-end space-x-4">
                <button 
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-8 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gray-100 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    showFeedback('success', 'Upload Started', 'Bulk upload initiated! Products will be processed.');
                    setIsBulkModalOpen(false);
                  }}
                  className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Upload Products</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}