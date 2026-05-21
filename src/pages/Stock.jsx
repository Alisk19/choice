import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { dbService } from '../services/db';
import { Search, CheckCircle, Trash2, PackageSearch, X, Filter, Calendar, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDateFilter } from '../hooks/useDateFilter';
import { DATE_RANGES } from '../utils/dateFilters';
import StatCard from '../components/ui/StatCard';
import BrandFilter from '../components/ui/BrandFilter';
import confetti from 'canvas-confetti';

const StatusBadge = ({ status, quantity }) => {
  if (status !== 'Sold' && Number(quantity) < 5) {
    return <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-amber-400/10 text-amber-400 border-amber-400/20">Low Stock</span>;
  }
  const map = {
    'In Stock': 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    'Sold': 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    'Low Stock': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${map[status] || map['In Stock']}`}>
      {status}
    </span>
  );
};

export default function Stock() {
  const inventory = useStore((state) => state.inventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('Overall Stock');
  const [activeBrand, setActiveBrand] = useState('All Brands');
  const [currentPage, setCurrentPage] = useState(1);
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [soldForm, setSoldForm] = useState({ soldPrice: '', customerName: '', customerPhone: '', paymentMethod: 'Cash' });
  const itemsPerPage = 10;

  const statusFilters = ['Overall Stock', 'Ready Stock', 'Sold Stock', 'Low Stock'];
  const quickDateFilters = ['Today', 'This Month', 'This Year', 'Last Year', 'Past 2 Years', 'Past 5 Years'];

  const {
    selectedRange, setSelectedRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, filterDataByDate
  } = useDateFilter('All Time');

  const filteredInventory = useMemo(() => {
    // 1. Filter by Date Range
    const dateFiltered = filterDataByDate(inventory, 'createdAt');

    // 2. Filter by Search, Status, and Brand
    return dateFiltered.filter(item => {
      const matchesSearch =
        (item.modelName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.imei || '').includes(searchTerm);
      
      const matchesBrand = activeBrand === 'All Brands' 
        ? true 
        : activeBrand === 'Other' 
          ? !['apple', 'samsung', 'oneplus', 'xiaomi', 'vivo', 'oppo'].includes((item.brand || '').toLowerCase())
          : (item.brand || '').toLowerCase() === activeBrand.toLowerCase();
      
      let matchesStatus = true;
      if (activeStatusFilter === 'Ready Stock') {
        matchesStatus = item.status === 'In Stock' || item.status === 'Low Stock';
      } else if (activeStatusFilter === 'Sold Stock') {
        matchesStatus = item.status === 'Sold';
      } else if (activeStatusFilter === 'Low Stock') {
        matchesStatus = (item.status === 'In Stock' || item.status === 'Low Stock') && Number(item.quantity || 1) < 5;
      }
      
      return matchesSearch && matchesBrand && matchesStatus;
    }).sort((a, b) => {
        const getMs = (val) => {
          if (!val) return 0;
          if (typeof val === 'string') return new Date(val).getTime();
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          return new Date(val).getTime();
        };
        return getMs(b.createdAt) - getMs(a.createdAt);
    });
  }, [inventory, searchTerm, activeStatusFilter, activeBrand, filterDataByDate]);

  // Analytics for currently filtered data
  const totalItems = filteredInventory.length;
  const readyStockCount = filteredInventory.filter(item => item.status === 'In Stock' || item.status === 'Low Stock').length;
  const soldStockCount = filteredInventory.filter(item => item.status === 'Sold').length;
  const totalPurchaseValue = filteredInventory.reduce((acc, item) => acc + Number(item.purchasePrice || 0), 0);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
  const paginatedData = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await dbService.deleteProduct(id);
        toast.success('Product deleted successfully');
      } catch {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleOpenSoldModal = (item) => {
    setSelectedItem(item);
    setSoldForm({ soldPrice: item.purchasePrice || '', customerName: '', customerPhone: '', paymentMethod: 'Cash' });
    setSoldModalOpen(true);
  };

  const handleMarkAsSoldSubmit = async (e) => {
    e.preventDefault();
    if (!soldForm.soldPrice || isNaN(soldForm.soldPrice)) {
      toast.error('Please enter a valid sold price');
      return;
    }
    try {
      await dbService.markAsSold(selectedItem, soldForm);
      toast.success('Item marked as sold!');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#2dd4bf', '#818cf8']
      });
    } catch {
      toast.error('Failed to mark item as sold.');
    } finally {
      setSoldModalOpen(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-neutral-950/60 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all";

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Stock History 📦</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg font-medium">Advanced inventory analytics and tracking.</p>
        </div>

        {/* Date Filter Section */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/80 dark:bg-neutral-900/60 p-2.5 rounded-2xl border border-neutral-200 dark:border-white/10 backdrop-blur-md transition-colors duration-300">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <select 
              value={selectedRange} 
              onChange={(e) => { setSelectedRange(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-0 cursor-pointer appearance-none outline-none"
            >
              <option value="All Time" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">All Time</option>
              {DATE_RANGES.filter(r => r !== 'All Time').map(range => (
                <option key={range} value={range} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">{range}</option>
              ))}
            </select>
          </div>
          
          <AnimatePresence>
            {selectedRange === 'Custom Date Range' && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 pl-3 border-l border-neutral-200 dark:border-white/10 overflow-hidden whitespace-nowrap"
              >
                <input type="date" value={customStartDate || ''} onChange={(e) => { setCustomStartDate(e.target.value); setCurrentPage(1); }} className="bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-neutral-900 dark:text-white focus:border-indigo-500 focus:outline-none" />
                <span className="text-neutral-400 dark:text-neutral-500 font-medium">to</span>
                <input type="date" value={customEndDate || ''} onChange={(e) => { setCustomEndDate(e.target.value); setCurrentPage(1); }} className="bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-neutral-900 dark:text-white focus:border-indigo-500 focus:outline-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Date Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {quickDateFilters.map(filter => (
          <button
            key={filter}
            onClick={() => { setSelectedRange(filter); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedRange === filter ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/80 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <BrandFilter activeBrand={activeBrand} setActiveBrand={setActiveBrand} />

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Items" value={totalItems} icon={Package} iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20" />
        <StatCard title="Ready Stock" value={readyStockCount} icon={ShoppingCart} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Sold Stock" value={soldStockCount} icon={TrendingUp} iconColor="text-purple-400" iconBg="bg-purple-500/10 border-purple-500/20" />
        <StatCard title="Purchase Value" value={`₹${(totalPurchaseValue/1000).toFixed(1)}k`} icon={DollarSign} iconColor="text-cyan-400" iconBg="bg-cyan-500/10 border-cyan-500/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-white/5">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search model, brand, IMEI..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-neutral-300 dark:hover:border-white/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-inner"
            />
          </div>
          
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-1 hidden sm:block" />
            {statusFilters.map(filter => (
              <button
                key={filter}
                onClick={() => { setActiveStatusFilter(filter); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeStatusFilter === filter ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-white/80 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">IMEI</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Price (₹)</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
              {paginatedData.length > 0 ? paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-neutral-900 dark:text-white text-base">{item.brand} {item.modelName}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.color}{item.color && item.variant ? ' • ' : ''}{item.variant}</div>
                  </td>
                  <td className="px-6 py-5 text-sm font-mono font-medium text-neutral-600 dark:text-neutral-300">{item.imei}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="font-bold text-neutral-900 dark:text-white">₹{Number(item.status === 'Sold' ? item.soldPrice : item.purchasePrice || 0).toLocaleString()}</div>
                    {item.status === 'Sold' && (
                      <div className="text-xs text-emerald-500 dark:text-emerald-400 font-bold mt-0.5">
                        +₹{(Number(item.soldPrice || 0) - Number(item.purchasePrice || 0)).toLocaleString()} profit
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-sm font-bold text-neutral-900 dark:text-white">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-5"><StatusBadge status={item.status} quantity={item.quantity} /></td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status !== 'Sold' && (
                        <button onClick={() => handleOpenSoldModal(item)} className="p-2 rounded-xl text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-400/10 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-400/20" title="Mark as Sold">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-400/20" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4 border border-neutral-200 dark:border-white/10 shadow-lg">
                        <PackageSearch className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">No Items Found</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mt-2">No inventory items match your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredInventory.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50 dark:bg-neutral-900/40">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Showing <span className="text-neutral-900 dark:text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-neutral-900 dark:text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredInventory.length)}</span> of <span className="text-neutral-900 dark:text-white font-bold">{filteredInventory.length}</span>
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-neutral-200 dark:border-white/10 rounded-lg bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition-all">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-neutral-200 dark:border-white/10 rounded-lg bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition-all">Next</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mark As Sold Modal */}
      <AnimatePresence>
        {soldModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSoldModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/90 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-neutral-50 dark:bg-white/5">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Complete Sale</h3>
                <button onClick={() => setSoldModalOpen(false)} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleMarkAsSoldSubmit} className="p-6 space-y-5">
                <div className="p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{selectedItem?.brand} {selectedItem?.modelName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Purchased at ₹{Number(selectedItem?.purchasePrice || 0).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Selling Price (₹) <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="number" value={soldForm.soldPrice} onChange={e => setSoldForm({ ...soldForm, soldPrice: e.target.value })} className={inputClass} placeholder="0.00" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Payment Method</label>
                  <select value={soldForm.paymentMethod} onChange={e => setSoldForm({ ...soldForm, paymentMethod: e.target.value })} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="Cash" className="bg-white dark:bg-neutral-900">Cash</option>
                    <option value="UPI" className="bg-white dark:bg-neutral-900">UPI</option>
                    <option value="Card" className="bg-white dark:bg-neutral-900">Card</option>
                    <option value="Bank Transfer" className="bg-white dark:bg-neutral-900">Bank Transfer</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Customer Name</label>
                    <input type="text" value={soldForm.customerName} onChange={e => setSoldForm({ ...soldForm, customerName: e.target.value })} className={inputClass} placeholder="Optional" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Customer Phone</label>
                    <input type="text" value={soldForm.customerPhone} onChange={e => setSoldForm({ ...soldForm, customerPhone: e.target.value })} className={inputClass} placeholder="Optional" />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-neutral-200 dark:border-white/10">
                  <button type="button" onClick={() => setSoldModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors border border-transparent dark:hover:border-white/10">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">Confirm Sale</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
