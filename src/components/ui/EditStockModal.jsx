import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { STANDARD_BRANDS, normalizeBrand } from '../../utils/brandHelper';
import toast from 'react-hot-toast';

export default function EditStockModal({ isOpen, onClose, item, onSave }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      let initialBrand = 'Other';
      let otherBrand = '';
      if (STANDARD_BRANDS.includes(normalizeBrand(item.brand))) {
        initialBrand = normalizeBrand(item.brand);
      } else if (item.brand) {
        otherBrand = item.brand;
      }
      
      setFormData({
        ...item,
        brand: initialBrand,
        otherBrand,
        purchasePrice: item.purchasePrice || '',
        quantity: item.quantity || '1',
      });
      setErrors({});
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.modelName) newErrors.modelName = 'Required';
    if (!formData.brand) newErrors.brand = 'Required';
    if (formData.brand === 'Other' && !formData.otherBrand) newErrors.otherBrand = 'Required';
    if (!formData.imei) newErrors.imei = 'Required';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Required';
    if (!formData.quantity) newErrors.quantity = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Fix errors before saving');
      return;
    }
    const finalData = { ...formData };
    finalData.brand = finalData.brand === 'Other' ? normalizeBrand(finalData.otherBrand) : finalData.brand;
    delete finalData.otherBrand;
    
    onSave(finalData);
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-medium transition-all text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-neutral-300 dark:hover:border-white/20";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#111] shadow-2xl"
        >
          <div className="sticky top-0 z-20 p-6 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-white/5 backdrop-blur-md">
            <h3 className="font-extrabold text-xl text-neutral-900 dark:text-white">Edit Stock Item</h3>
            <button type="button" onClick={onClose} className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Brand Name</label>
                <select name="brand" value={formData.brand || ''} onChange={handleChange} className={inputClass + " appearance-none cursor-pointer"}>
                  {STANDARD_BRANDS.map(b => <option key={b} value={b} className="bg-white dark:bg-neutral-900">{b}</option>)}
                  <option value="Other" className="bg-white dark:bg-neutral-900">Other</option>
                </select>
                {errors.brand && <p className="text-xs text-pink-500 font-bold ml-1">{errors.brand}</p>}
              </div>
              
              {formData.brand === 'Other' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Specify Brand</label>
                  <input type="text" name="otherBrand" value={formData.otherBrand || ''} onChange={handleChange} className={inputClass} />
                  {errors.otherBrand && <p className="text-xs text-pink-500 font-bold ml-1">{errors.otherBrand}</p>}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Model Name</label>
                <input type="text" name="modelName" value={formData.modelName || ''} onChange={handleChange} className={inputClass} />
                {errors.modelName && <p className="text-xs text-pink-500 font-bold ml-1">{errors.modelName}</p>}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">IMEI</label>
                <input type="text" name="imei" value={formData.imei || ''} onChange={handleChange} className={inputClass} />
                {errors.imei && <p className="text-xs text-pink-500 font-bold ml-1">{errors.imei}</p>}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Color</label>
                <input type="text" name="color" value={formData.color || ''} onChange={handleChange} className={inputClass} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Storage/RAM</label>
                <input type="text" name="variant" value={formData.variant || ''} onChange={handleChange} className={inputClass} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Purchase Price</label>
                <input type="number" name="purchasePrice" value={formData.purchasePrice || ''} onChange={handleChange} className={inputClass} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Quantity</label>
                <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} className={inputClass} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Status</label>
                <select name="status" value={formData.status || ''} onChange={handleChange} className={inputClass + " appearance-none cursor-pointer"}>
                  <option value="In Stock" className="bg-white dark:bg-neutral-900">In Stock</option>
                  <option value="Low Stock" className="bg-white dark:bg-neutral-900">Low Stock</option>
                  <option value="Sold" className="bg-white dark:bg-neutral-900">Sold</option>
                </select>
              </div>
            </div>
            
            <div className="sticky bottom-0 pt-6 mt-6 border-t border-neutral-200 dark:border-white/10 flex justify-end gap-3 bg-neutral-50 dark:bg-[#111]">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
