import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, Printer, FileText, Download, DollarSign, TrendingUp, Calendar, Hash, CreditCard, User, Box, PieChart as PieChartIcon, Trash2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useDateFilter } from '../hooks/useDateFilter';
import { DATE_RANGES } from '../utils/dateFilters';
import toast from 'react-hot-toast';
import { dbService } from '../services/db';

const safeFormatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    let d;
    if (typeof dateString === 'string') d = parseISO(dateString);
    else if (typeof dateString.toDate === 'function') d = dateString.toDate();
    else if (dateString instanceof Date) d = dateString;
    else d = new Date(dateString);
    
    if (!isValid(d)) return 'Invalid Date';
    return format(d, 'MMM dd, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
};

export default function Sales() {
  const salesData = useStore((state) => state.salesData);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    selectedRange, setSelectedRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, filterDataByDate
  } = useDateFilter('All Time');

  const filteredByDate = useMemo(() => filterDataByDate(salesData, 'soldDate'), [salesData, filterDataByDate]);

  const soldItems = useMemo(() => {
    return filteredByDate
      .filter(item => 
        (item.modelName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.imeiNumber || '').includes(searchTerm) ||
        (item.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const getMs = (val) => {
          if (!val) return 0;
          if (typeof val === 'string') return new Date(val).getTime();
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          return new Date(val).getTime();
        };
        const dateA = getMs(a.soldDate || a.createdAt);
        const dateB = getMs(b.soldDate || b.createdAt);
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });
  }, [filteredByDate, searchTerm]);

  const totalPages = Math.ceil(soldItems.length / itemsPerPage) || 1;
  const paginatedData = soldItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalSalesValue = soldItems.reduce((sum, item) => sum + Number(item.soldPrice || 0), 0);
  const totalProfitValue = soldItems.reduce((sum, item) => sum + Number(item.profit || 0), 0);
  const totalUnitsSold = soldItems.length;
  const averageProfit = totalUnitsSold > 0 ? (totalProfitValue / totalUnitsSold).toFixed(0) : 0;

  const printInvoice = (item) => {
    navigate('/invoice', { state: { item } });
  };

  const handleDeleteSale = async (item) => {
    if (window.confirm(`Are you sure you want to delete this sale for ${item.modelName}? The product will be returned to inventory.`)) {
      try {
        await dbService.deleteSale(item.id, item.productId);
        toast.success('Sale deleted successfully. Product returned to inventory.', {
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a'
          }
        });
      } catch (error) {
        console.error("Error deleting sale: ", error);
        toast.error('Failed to delete sale.');
      }
    }
  };

  const exportCSV = () => {
    if (soldItems.length === 0) return;
    const headers = ['Sale Date', 'Invoice Number', 'Brand', 'Model', 'IMEI', 'Customer Name', 'Customer Phone', 'Payment Method', 'Purchase Price', 'Sold Price', 'Profit'];
    const csvContent = [
      headers.join(','),
      ...soldItems.map(item => [
        safeFormatDate(item.soldDate || item.createdAt),
        item.invoiceNumber || 'N/A',
        item.brandName || '',
        item.modelName || '',
        item.imeiNumber || '',
        `"${item.customerName || 'Walk-in'}"`,
        item.customerPhone || 'N/A',
        item.paymentMethod || 'Cash',
        item.purchasePrice || 0,
        item.soldPrice || 0,
        item.profit || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_export_${selectedRange.replace(/ /g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quickFilters = ['Today', 'Last 7 Days', 'This Month', 'This Year'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Sales History 📈</h1>
          <p className="text-neutral-400 mt-2 text-lg font-medium">Advanced filtering, analytics, and record tracking.</p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-900/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <select 
              value={selectedRange} 
              onChange={(e) => { setSelectedRange(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none text-white font-bold text-sm focus:outline-none focus:ring-0 cursor-pointer appearance-none outline-none"
            >
              {DATE_RANGES.map(range => (
                <option key={range} value={range} className="bg-neutral-900 text-white">{range}</option>
              ))}
            </select>
          </div>
          
          <AnimatePresence>
            {selectedRange === 'Custom Date Range' && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 pl-3 border-l border-white/10 overflow-hidden whitespace-nowrap"
              >
                <input type="date" value={customStartDate || ''} onChange={(e) => { setCustomStartDate(e.target.value); setCurrentPage(1); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                <span className="text-neutral-500 font-medium">to</span>
                <input type="date" value={customEndDate || ''} onChange={(e) => { setCustomEndDate(e.target.value); setCurrentPage(1); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {quickFilters.map(filter => (
          <button
            key={filter}
            onClick={() => { setSelectedRange(filter); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedRange === filter ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-neutral-900/50 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard title="Revenue" value={`₹${(totalSalesValue/1000).toFixed(1)}k`} icon={DollarSign} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Net Profit" value={`₹${(totalProfitValue/1000).toFixed(1)}k`} icon={TrendingUp} iconColor="text-cyan-400" iconBg="bg-cyan-500/10 border-cyan-500/20" />
        <StatCard title="Units Sold" value={totalUnitsSold} icon={Box} iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20" />
        <StatCard title="Avg. Profit" value={`₹${averageProfit}`} icon={PieChartIcon} iconColor="text-purple-400" iconBg="bg-purple-500/10 border-purple-500/20" />
        <StatCard title="Sales Count" value={soldItems.length} icon={Hash} iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search invoice, model, IMEI, customer..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 hover:border-white/20 text-white placeholder:text-neutral-500 shadow-inner"
            />
          </div>
          <div>
             <button 
                onClick={exportCSV}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-neutral-300 bg-neutral-900/80 border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-sm"
             >
                <Download className="w-4 h-4" />
                Export Data
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-neutral-900/40 border-b border-white/10">
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Sale Date</th>
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Invoice</th>
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Product & IMEI</th>
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Payment</th>
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Sold Price (₹)</th>
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Profit (₹)</th>
                <th className="px-5 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedData.length > 0 ? paginatedData.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4 text-sm font-bold text-neutral-300">
                      {safeFormatDate(item.soldDate || item.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 w-fit">
                        <Hash className="w-3.5 h-3.5" />
                        {item.invoiceNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm">{item.brandName} {item.modelName}</div>
                      <div className="text-xs font-medium text-neutral-500 mt-1">{item.imeiNumber}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center border border-white/5"><User className="w-3 h-3 text-neutral-400" /></div>
                        <div>
                          <div className="text-sm font-bold text-white">{item.customerName || 'Walk-in'}</div>
                          <div className="text-xs font-medium text-neutral-500">{item.customerPhone || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-md bg-neutral-800/80 text-neutral-300 border border-white/10 shadow-sm">
                        {item.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-white text-base">
                      ₹{Number(item.soldPrice).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-cyan-400 text-base">
                      +₹{Number(item.profit).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => printInvoice({
                             ...item, 
                             imei: item.imeiNumber, 
                             brand: item.brandName
                          })}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-indigo-500 transition-all border border-white/5 shadow-sm group-hover:border-indigo-400/30"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print
                        </button>
                        <button
                          onClick={() => handleDeleteSale(item)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-white bg-red-500/10 hover:bg-red-500 transition-all border border-red-500/20 shadow-sm"
                          title="Delete Sale"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="px-6 py-24">
                     <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-lg shadow-black/50">
                        <FileText className="w-8 h-8 text-neutral-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">No Sales Data Found</h3>
                      <p className="text-neutral-400 text-sm font-medium mt-2 max-w-sm">No transactions match your current filters. Try adjusting the date range or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {soldItems.length > 0 && (
          <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/40">
            <span className="text-neutral-400 font-medium text-xs">
              Showing <span className="font-bold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, soldItems.length)}</span> of <span className="font-bold text-white">{soldItems.length}</span>
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-white/10 rounded-lg bg-neutral-800 text-xs font-bold text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-white/10 rounded-lg bg-neutral-800 text-xs font-bold text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
