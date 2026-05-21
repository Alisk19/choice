import { useState } from 'react';
import { useStore } from '../store/useStore';
import { dbService } from '../services/db';
import { PackagePlus, Smartphone, LayoutGrid, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const InputField = ({ label, name, type = 'text', required = false, placeholder = '', formData, handleChange, errors }) => (
  <div className="space-y-1.5 relative group">
    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">
      {label} {required && <span className="text-indigo-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-medium transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-neutral-300 dark:hover:border-white/20"
    />
    {errors[name] && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-pink-500 font-bold mt-1 ml-1">
        {errors[name]}
      </motion.p>
    )}
  </div>
);

export default function DataEntry() {
  const inventory = useStore((state) => state.inventory);
  const inputClass = "w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-neutral-300 dark:hover:border-white/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-inner";

  const initialFormState = {
    modelName: '',
    brand: '',
    imei: '',
    color: '',
    variant: '',
    purchasePrice: '',
    soldPrice: '',
    quantity: '1',
    purchaseDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    purchaseFrom: '',
    mobileNumber: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.modelName) newErrors.modelName = 'Model Name is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    
    if (!formData.imei) {
      newErrors.imei = 'IMEI is required';
    } else if (!/^\d+$/.test(formData.imei)) {
      newErrors.imei = 'IMEI must contain only numbers';
    } else if (inventory.some(item => item.imei === formData.imei)) {
      newErrors.imei = 'This IMEI already exists in stock';
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = 'Purchase Price is required';
    } else if (isNaN(formData.purchasePrice) || Number(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Must be a valid positive number';
    }

    if (formData.soldPrice && (isNaN(formData.soldPrice) || Number(formData.soldPrice) <= 0)) {
      newErrors.soldPrice = 'Must be a valid positive number';
    }

    if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const exists = await dbService.checkImeiExists(formData.imei);
      if (exists) {
        setErrors(prev => ({ ...prev, imei: 'This IMEI already exists in the cloud' }));
        toast.error('IMEI already exists');
        setIsSubmitting(false);
        return;
      }

      await dbService.addProduct(formData);
      toast.success('Product added successfully!');
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#818cf8', '#c084fc', '#38bdf8']
      });

      setFormData(initialFormState);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Add New Stock 📦</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg font-medium">Enter details to add a new device to your inventory.</p>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-white/10 overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-white/10 pb-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                  <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-wide">Device Specifications</h2>
              </div>
              <InputField formData={formData} handleChange={handleChange} errors={errors} label="Brand Name" name="brand" required placeholder="e.g. Apple, Samsung" />
              <InputField formData={formData} handleChange={handleChange} errors={errors} label="Model Name" name="modelName" required placeholder="e.g. iPhone 15 Pro Max" />
              <InputField formData={formData} handleChange={handleChange} errors={errors} label="IMEI / Serial Number" name="imei" required placeholder="15-digit unique ID" />
              <div className="grid grid-cols-2 gap-4">
                <InputField formData={formData} handleChange={handleChange} errors={errors} label="Color" name="color" placeholder="e.g. Titanium" />
                <InputField formData={formData} handleChange={handleChange} errors={errors} label="Storage/RAM" name="variant" placeholder="e.g. 256GB" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-white/10 pb-4">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                  <PackagePlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-wide">Purchase & Stock</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField formData={formData} handleChange={handleChange} errors={errors} label="Purchase Price (₹)" name="purchasePrice" type="number" required placeholder="0.00" />
                <InputField formData={formData} handleChange={handleChange} errors={errors} label="Quantity" name="quantity" type="number" required />
              </div>
              <InputField formData={formData} handleChange={handleChange} errors={errors} label="Purchase Date" name="purchaseDate" type="date" required />
              <div className="grid grid-cols-2 gap-4">
                <InputField formData={formData} handleChange={handleChange} errors={errors} label="Purchase from" name="purchaseFrom" placeholder="e.g. Supplier Name" />
                <InputField formData={formData} handleChange={handleChange} errors={errors} label="Mobile number" name="mobileNumber" placeholder="Supplier Contact" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 mt-4">
              <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 ml-1">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-4 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-medium transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-neutral-300 dark:hover:border-white/20"
                placeholder="Any special remarks or condition details..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/40 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setFormData(initialFormState)}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-all border border-transparent hover:border-neutral-300 dark:hover:border-white/10"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isSaved}
            className={`group relative px-8 py-2.5 rounded-xl font-bold text-sm text-white transition-all overflow-hidden ${
              isSaved
                ? 'bg-emerald-600 dark:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="absolute inset-0 bg-white/20 dark:bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              {isSaved || isSubmitting ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved
                </>
              ) : (
                <>
                  <PackagePlus className="w-5 h-5" />
                  Add to Inventory
                </>
              )}
            </span>
          </button>
        </div>
      </motion.form>
    </div>
  );
}
