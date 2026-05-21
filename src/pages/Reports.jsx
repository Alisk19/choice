import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isValid } from 'date-fns';
import { Calendar, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const safeParseISO = (str) => {
  if (!str) return null;
  try { const d = parseISO(str); return isValid(d) ? d : null; } catch { return null; }
};

const chartTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: '#1a1a1a',
  color: '#fff',
};

export default function Reports() {
  const salesData = useStore((state) => state.salesData);
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));

  const selectedMonthStart = startOfMonth(parseISO(`${reportMonth}-01`));
  const selectedMonthEnd = endOfMonth(selectedMonthStart);

  const monthSales = salesData.filter(item => {
    const d = safeParseISO(item.soldDate);
    if (!d) return false;
    return isWithinInterval(d, { start: selectedMonthStart, end: selectedMonthEnd });
  });

  const dailyData = eachDayOfInterval({ start: selectedMonthStart, end: selectedMonthEnd }).map(day => {
    const daySales = monthSales.filter(item => {
      const d = safeParseISO(item.soldDate);
      return d && d.getDate() === day.getDate();
    });
    return {
      date: format(day, 'dd MMM'),
      sales: daySales.length,
      revenue: daySales.reduce((sum, item) => sum + Number(item.soldPrice || 0), 0),
      profit: daySales.reduce((sum, item) => sum + Number(item.profit || 0), 0),
    };
  });

  const bestSellingModels = (() => {
    const models = {};
    monthSales.forEach(item => {
      const key = `${item.brandName || item.brand || ''} ${item.modelName || ''}`.trim();
      if (key) models[key] = (models[key] || 0) + 1;
    });
    return Object.entries(models)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  const totalRevenue = monthSales.reduce((s, i) => s + Number(i.soldPrice || 0), 0);
  const totalProfit = monthSales.reduce((s, i) => s + Number(i.profit || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Analytics Reports 📊</h1>
          <p className="text-neutral-400 mt-1 text-lg font-medium">Deep dive into your sales and revenue trends.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm font-bold text-white cursor-pointer"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Sales', value: monthSales.length, suffix: 'units' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, suffix: '' },
          { label: 'Total Profit', value: `₹${totalProfit.toLocaleString()}`, suffix: '' },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-3xl font-extrabold text-white">{s.value}</p>
            {s.suffix && <p className="text-xs text-neutral-500 mt-1">{s.suffix}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <h3 className="text-base font-bold text-white mb-6">Daily Revenue & Profit</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={20} tick={{ fill: '#6b7280', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                <Area type="monotone" dataKey="profit" stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" name="Profit (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Models */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <h3 className="text-base font-bold text-white mb-6">Top Performing Models</h3>
          <div className="h-[300px]">
            {bestSellingModels.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestSellingModels} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fill: '#e5e7eb', fontSize: 11, fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} />
                  <defs>
                    <linearGradient id="colorBar2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#colorBar2)" radius={[0, 6, 6, 0]} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-lg font-bold text-white">No Sales This Month</h3>
                <p className="text-neutral-400 text-sm max-w-sm mt-1">No sales were recorded in the selected month.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
