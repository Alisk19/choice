import { useStore } from '../store/useStore';
import { Download, FileSpreadsheet, Database, Archive, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { dbService } from '../services/db';

export default function Export() {
  const inventory = useStore((state) => state.inventory);
  const salesData = useStore((state) => state.salesData);

  const exportToExcel = (data, filename, sheetName) => {
    try {
      if (data.length === 0) { toast.error('No data available to export'); return; }
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export successful!');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  const exportStock = () => {
    const data = inventory.filter(i => i.status !== 'Sold').map(({ id, ...rest }) => rest);
    exportToExcel(data, 'Stock_Report', 'Stock');
  };

  const exportSales = () => {
    const data = salesData.map(({ id, ...rest }) => rest);
    exportToExcel(data, 'Sales_Report', 'Sales');
  };

  const exportComplete = () => {
    try {
      if (inventory.length === 0 && salesData.length === 0) { toast.error('No data to export'); return; }
      const wb = XLSX.utils.book_new();
      const stockData = inventory.filter(i => i.status !== 'Sold').map(({ id, ...rest }) => rest);
      const saleData = salesData.map(({ id, ...rest }) => rest);
      if (stockData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockData), 'Stock');
      if (saleData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saleData), 'Sales');
      XLSX.writeFile(wb, `MobileChoice_Database_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Complete database exported!');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  const cards = [
    {
      title: 'Current Stock',
      description: 'Export all items currently in inventory. Great for stock audits and physical counts.',
      icon: Archive,
      onClick: exportStock,
      color: 'from-indigo-500/20 to-indigo-500/5',
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      count: inventory.filter(i => i.status !== 'Sold').length,
      countLabel: 'items in stock',
    },
    {
      title: 'Sales History',
      description: 'Export complete sales records with customer details and profit per transaction.',
      icon: FileSpreadsheet,
      onClick: exportSales,
      color: 'from-cyan-500/20 to-cyan-500/5',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      count: salesData.length,
      countLabel: 'sales records',
    },
    {
      title: 'Complete Database',
      description: 'Multi-sheet Excel file with both stock and sales history in one download.',
      icon: Database,
      onClick: exportComplete,
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      count: inventory.length + salesData.length,
      countLabel: 'total records',
    },
  ];

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Data Export 📥</h1>
        <p className="text-neutral-400 mt-1 text-lg font-medium">Download your inventory and sales data as Excel files.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col group hover:border-white/20 transition-all hover:bg-white/8"
          >
            <div className={`p-6 bg-gradient-to-br ${card.color} flex-1`}>
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center mb-6`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{card.description}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${card.iconColor}`}>{card.count}</span>
                <span className="text-xs text-neutral-500 font-semibold">{card.countLabel}</span>
              </div>
            </div>
            <div className="p-5 border-t border-white/10 bg-white/3">
              <button
                onClick={card.onClick}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-2xl transition-all group-hover:border-white/20"
              >
                <Download className="w-4 h-4" />
                Download Excel
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl"
      >
        <h3 className="text-lg font-bold text-white mb-2">Export Instructions</h3>
        <ul className="space-y-2 text-sm text-neutral-400 font-medium list-disc list-inside">
          <li>Files are downloaded directly in <span className="text-white font-bold">.xlsx</span> format, compatible with Microsoft Excel and Google Sheets.</li>
          <li>All exports include the current data at the time of download.</li>
          <li>The "Complete Database" export contains two separate sheets inside one file.</li>
          <li>Data is pulled directly from your live Firebase database.</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-3xl p-8 border border-red-500/20 bg-red-500/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-red-400 mb-1 flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Danger Zone: Clear Database
          </h3>
          <p className="text-sm text-neutral-400 max-w-xl">
            This action will permanently delete all records (stock inventory, sales history, and money transactions) from the database. This action is irreversible.
          </p>
        </div>
        <button
          onClick={async () => {
            const firstConfirm = window.confirm("Are you absolutely sure you want to clear ALL data from the database? This includes all stock inventory, sales history, and money transactions. This cannot be undone.");
            if (!firstConfirm) return;

            const secondConfirm = window.confirm("WARNING: This will permanently delete all data. Click OK to confirm deletion.");
            if (!secondConfirm) return;

            const toastId = toast.loading("Clearing database...");
            try {
              const backup = await dbService.clearAllData();
              toast.dismiss(toastId);
              toast((t) => (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-neutral-900 dark:text-white">Database cleared!</p>
                  </div>
                  <button
                    onClick={async () => {
                      toast.dismiss(t.id);
                      const restoreToast = toast.loading("Restoring database...");
                      try {
                        await dbService.restoreData(backup);
                        toast.success("Database restored successfully!", { id: restoreToast });
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to restore data", { id: restoreToast });
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-lg transition-colors hover:opacity-80 cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              ), { duration: 10000, style: { minWidth: '300px' } });
            } catch (err) {
              console.error(err);
              toast.error("Failed to clear database", { id: toastId });
            }
          }}
          className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-sm font-bold rounded-2xl transition-all whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] cursor-pointer"
        >
          Clear All Data
        </button>
      </motion.div>
    </div>
  );
}
