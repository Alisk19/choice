import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import { useDateFilter } from '../hooks/useDateFilter';
import { DATE_RANGES } from '../utils/dateFilters';
import StatCard from '../components/ui/StatCard';
import DetailsModal from '../components/ui/DetailsModal';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import { normalizeBrand } from '../utils/brandHelper';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const safeParseISO = (dateStr) => {
  if (!dateStr) return null;
  try {
    let d;
    if (typeof dateStr === 'string') d = parseISO(dateStr);
    else if (typeof dateStr.toDate === 'function') d = dateStr.toDate();
    else if (dateStr instanceof Date) d = dateStr;
    else d = new Date(dateStr);
    
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const inventory = useStore((state) => state.inventory);
  const salesData = useStore((state) => state.salesData);
  const [activeModal, setActiveModal] = useState(null);

  const {
    selectedRange, setSelectedRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, filterDataByDate
  } = useDateFilter('All Time');

  // Filtered Inventory (Overall Stock, Ready Stock, Low Stock) based on createdAt
  const filteredInventory = useMemo(() => filterDataByDate(inventory, 'createdAt'), [inventory, filterDataByDate]);

  // Overall Stock
  const overallStock = filteredInventory.length;
  // Ready Stock
  const readyStockItems = filteredInventory.filter(item => item.status === 'In Stock' || item.status === 'Low Stock');
  const readyStock = readyStockItems.length;

  // Filtered Sales Analytics
  const filteredSales = useMemo(() => filterDataByDate(salesData, 'soldDate'), [salesData, filterDataByDate]);

  // Sold Stock (dynamically filtered by soldDate)
  const soldStock = filteredSales.length;

  // Low Stock Count
  const lowStockItems = readyStockItems.filter(item => Number(item.quantity || 1) < 5);
  const lowStockCount = lowStockItems.length;

  const totalSalesValue = filteredSales.reduce((acc, item) => acc + Number(item.soldPrice || 0), 0);
  const totalProfit = filteredSales.reduce((acc, item) => acc + Number(item.profit || 0), 0);

  const getBrandDistribution = () => {
    const brands = {};
    readyStockItems.forEach(item => {
      if (item.brand) {
        const normBrand = normalizeBrand(item.brand);
        brands[normBrand] = (brands[normBrand] || 0) + Number(item.quantity || 1);
      }
    });
    return Object.entries(brands).map(([name, value]) => ({ name, value }));
  };
  const brandData = getBrandDistribution();

  const getSalesTrend = () => {
    let trendMap = {};
    filteredSales.forEach(sale => {
       const d = safeParseISO(sale.soldDate);
       if (!d) return;
       const dateKey = format(d, 'MMM dd');
       if (!trendMap[dateKey]) trendMap[dateKey] = { name: dateKey, Sales: 0, Profit: 0 };
       trendMap[dateKey].Sales += Number(sale.soldPrice || 0);
       trendMap[dateKey].Profit += Number(sale.profit || 0);
    });
    const sorted = Object.values(trendMap).sort((a,b) => new Date(a.name) - new Date(b.name));
    return sorted.slice(-30); 
  };
  const salesTrendData = getSalesTrend();

  const handleCardClick = (type) => {
    if (type === 'Overall Stock') {
      setActiveModal({ title: 'Overall Stock', value: overallStock, data: inventory, type: 'stock' });
    } else if (type === 'Ready Stock') {
      setActiveModal({ title: 'Ready Stock', value: readyStock, data: readyStockItems, type: 'stock' });
    } else if (type === 'Sold Stock') {
      setActiveModal({ title: 'Sold Stock', value: soldStock, data: filteredSales, type: 'sales' });
    } else if (type === 'Total Sales Value') {
      setActiveModal({ title: 'Total Sales Value', value: `₹${totalSalesValue.toLocaleString()}`, data: filteredSales, type: 'sales' });
    } else if (type === 'Total Profit') {
      setActiveModal({ title: 'Total Profit', value: `₹${totalProfit.toLocaleString()}`, data: filteredSales, type: 'sales' });
    } else if (type === 'Low Stock Items') {
      setActiveModal({ title: 'Low Stock Items', value: lowStockCount, data: lowStockItems, type: 'stock' });
    }
  };

  const renderStockRow = (item, idx) => (
    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white">{item.brand} {item.modelName}</td>
      <td className="px-6 py-4 text-sm font-mono text-neutral-500 dark:text-neutral-400">{item.imei}</td>
      <td className="px-6 py-4 text-sm font-bold text-right text-neutral-900 dark:text-white">₹{Number(item.purchasePrice || 0).toLocaleString()}</td>
      <td className="px-6 py-4 text-center">
        <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white">{item.quantity}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${item.status === 'Sold' ? 'bg-rose-400/10 text-rose-400 border-rose-400/20' : Number(item.quantity || 1) < 5 ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'}`}>
          {item.status}
        </span>
      </td>
    </tr>
  );

  const renderSalesRow = (item, idx) => (
    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white">{item.brandName || item.brand} {item.modelName}</td>
      <td className="px-6 py-4 text-sm font-mono text-neutral-500 dark:text-neutral-400">{item.imeiNumber || item.imei}</td>
      <td className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white">{item.customerName || 'Walk-in'}</td>
      <td className="px-6 py-4 text-sm font-bold text-right text-emerald-500 dark:text-emerald-400">₹{Number(item.soldPrice || 0).toLocaleString()}</td>
      <td className="px-6 py-4 text-sm font-bold text-right text-cyan-500 dark:text-cyan-400">+₹{Number(item.profit || 0).toLocaleString()}</td>
    </tr>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-lg font-medium">Real-time inventory and sales analytics.</p>
        </div>
        
        {/* Modern Date Filter Bar */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-neutral-900/50 p-2 rounded-2xl border border-neutral-200 dark:border-white/10 backdrop-blur-md transition-colors duration-300">
          <CalendarIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 ml-2" />
          <select 
            value={selectedRange} 
            onChange={(e) => setSelectedRange(e.target.value)}
            className="bg-transparent border-none text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-0 cursor-pointer pr-4 appearance-none"
          >
            {DATE_RANGES.map(range => (
              <option key={range} value={range} className="bg-white dark:bg-neutral-900">{range}</option>
            ))}
          </select>
          {selectedRange === 'Custom Date Range' && (
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-200 dark:border-white/10">
              <input type="date" value={customStartDate || ''} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-neutral-900 dark:text-white" />
              <span className="text-neutral-500">-</span>
              <input type="date" value={customEndDate || ''} onChange={(e) => setCustomEndDate(e.target.value)} className="bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-neutral-900 dark:text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Overall Stock" value={overallStock} icon={Package} iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20" onClick={() => handleCardClick('Overall Stock')} />
        <StatCard title="Ready Stock" value={readyStock} icon={ShoppingCart} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20" onClick={() => handleCardClick('Ready Stock')} />
        <StatCard title="Sold Stock" value={soldStock} icon={TrendingUp} iconColor="text-purple-400" iconBg="bg-purple-500/10 border-purple-500/20" onClick={() => handleCardClick('Sold Stock')} />
        
        <StatCard title="Total Sales Value" value={`₹${totalSalesValue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="Filtered" iconColor="text-cyan-400" iconBg="bg-cyan-500/10 border-cyan-500/20" onClick={() => handleCardClick('Total Sales Value')} />
        <StatCard title="Total Profit" value={`₹${totalProfit.toLocaleString()}`} icon={Activity} trend="up" trendValue="Filtered" iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20" onClick={() => handleCardClick('Total Profit')} />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={AlertTriangle} trend={lowStockCount > 0 ? "down" : "up"} trendValue={lowStockCount > 0 ? "Needs Restock" : "Optimal"} iconColor="text-red-400" iconBg="bg-red-500/10 border-red-500/20" onClick={() => handleCardClick('Low Stock Items')} />
      </div>

      {/* Charts & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Revenue & Profit Trend</h3>
          <div className="h-[300px]">
            {salesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="Sales" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500 font-medium">No sales data for selected period</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 glass-card p-6 flex flex-col"
        >
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Brand Share</h3>
          <div className="h-[300px] flex-shrink-0">
            {brandData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={brandData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {brandData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500 text-sm font-medium">No data available</div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4 overflow-y-auto">
            {brandData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 h-[400px]"
        >
          <ActivityFeed inventory={inventory} salesData={salesData} />
        </motion.div>
      </div>

      {activeModal && (
        <DetailsModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={activeModal.title}
          value={activeModal.value}
          data={activeModal.data}
          columns={activeModal.type === 'stock' 
            ? ['Product', 'IMEI', {label: 'Price', align: 'right'}, {label: 'Qty', align: 'center'}, 'Status'] 
            : ['Product', 'IMEI', 'Customer', {label: 'Sold Price', align: 'right'}, {label: 'Profit', align: 'right'}]}
          renderRow={activeModal.type === 'stock' ? renderStockRow : renderSalesRow}
        />
      )}

    </div>
  );
}
