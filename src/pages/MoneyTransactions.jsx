import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { dbService } from '../services/db';
import { 
  Search, Plus, Download, Edit2, Trash2, 
  Wallet, Banknote, CreditCard, ArrowRightLeft,
  X, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import StatCard from '../components/ui/StatCard';
import DetailsModal from '../components/ui/DetailsModal';

const safeFormatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return 'Invalid Date';
    return format(d, 'MMM dd, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
};

export default function MoneyTransactions() {
  const transactions = useStore((state) => state.moneyTransactions) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    amountGiven: '',
    amountPaid: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  
  const [activeModal, setActiveModal] = useState(null);

  const handleOpenPaymentModal = (tx) => {
    setSelectedTx(tx);
    setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || isNaN(paymentForm.amount) || Number(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      const currentPaid = Number(selectedTx.amountPaid) || 0;
      const newAmountPaid = currentPaid + Number(paymentForm.amount);
      const newPayment = {
        id: Date.now().toString(),
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
        notes: paymentForm.notes
      };
      
      const newHistory = [...(selectedTx.paymentHistory || []), newPayment];
      
      await dbService.updateMoneyTransaction(selectedTx.id, {
        amountPaid: newAmountPaid,
        paymentHistory: newHistory
      });
      
      toast.success('Payment recorded successfully!');
      setPaymentModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to record payment');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      mobileNumber: '',
      amountGiven: '',
      amountPaid: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const handleOpenModal = (tx = null) => {
    if (tx) {
      setEditingId(tx.id);
      setFormData({
        name: tx.name || '',
        mobileNumber: tx.mobileNumber || '',
        amountGiven: tx.amountGiven || '',
        amountPaid: tx.amountPaid || '',
        notes: tx.notes || '',
        date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobileNumber || !formData.amountGiven) {
      toast.error('Name, Mobile, and Amount Given are required!');
      return;
    }

    if (!editingId) {
      const duplicate = transactions.find(t => t.mobileNumber === formData.mobileNumber);
      if (duplicate) {
        toast.error('A record with this mobile number already exists! Please add payment to the existing record.');
        return;
      }
    }

    try {
      const dataToSave = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        amountGiven: Number(formData.amountGiven),
        amountPaid: Number(formData.amountPaid) || 0,
        notes: formData.notes,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
      };

      if (editingId) {
        await dbService.updateMoneyTransaction(editingId, dataToSave);
        toast.success('Transaction updated successfully!');
      } else {
        await dbService.addMoneyTransaction(dataToSave);
        toast.success('Transaction added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await dbService.deleteMoneyTransaction(id);
        toast.success('Transaction deleted');
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (tx.name || '').toLowerCase().includes(searchLower) ||
          (tx.mobileNumber || '').includes(searchLower)
        );
      })
      .filter(tx => {
        if (statusFilter === 'All') return true;
        return tx.status === statusFilter;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions, searchTerm, statusFilter]);

  // Calculations for summary
  const totalGiven = transactions.reduce((sum, tx) => sum + (Number(tx.amountGiven) || 0), 0);
  const totalPaid = transactions.reduce((sum, tx) => sum + (Number(tx.amountPaid) || 0), 0);
  const totalRemaining = transactions.reduce((sum, tx) => sum + (Number(tx.remainingAmount) || 0), 0);
  const pendingCount = transactions.filter(tx => tx.status !== 'Paid').length;

  const exportToExcel = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No records to export");
      return;
    }

    const exportData = filteredTransactions.map((tx, idx) => ({
      'Sr. No': idx + 1,
      'Name': tx.name,
      'Mobile Number': tx.mobileNumber,
      'Amount Given (₹)': tx.amountGiven,
      'Amount Paid (₹)': tx.amountPaid,
      'Remaining (₹)': tx.remainingAmount,
      'Date': safeFormatDate(tx.date || tx.createdAt),
      'Status': tx.status,
      'Notes': tx.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Money_Transactions');
    
    // Auto-adjust column widths
    const colWidths = [
      { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, 
      { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 25 }
    ];
    worksheet['!cols'] = colWidths;

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Money_Transactions_${dateStr}.xlsx`);
    toast.success('Excel downloaded!');
  };

  const calcTempRemaining = () => {
    const given = Number(formData.amountGiven) || 0;
    const paid = Number(formData.amountPaid) || 0;
    return given - paid;
  };

  const handleCardClick = (type) => {
    if (type === 'Total Given') {
      setActiveModal({ title: 'Total Given', value: `₹${totalGiven.toLocaleString()}`, data: transactions });
    } else if (type === 'Total Paid') {
      setActiveModal({ title: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, data: transactions.filter(t => (Number(t.amountPaid) || 0) > 0) });
    } else if (type === 'Total Remaining') {
      setActiveModal({ title: 'Total Remaining', value: `₹${totalRemaining.toLocaleString()}`, data: transactions.filter(t => (Number(t.remainingAmount) || 0) > 0) });
    } else if (type === 'Pending Records') {
      setActiveModal({ title: 'Pending Records', value: pendingCount, data: transactions.filter(t => t.status !== 'Paid') });
    }
  };

  const renderModalRow = (item) => (
    <tr key={item.id} className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="font-extrabold text-white text-base">{item.name}</div>
        <div className="text-xs font-medium text-neutral-400">{item.mobileNumber}</div>
      </td>
      <td className="px-6 py-4 text-right font-extrabold text-white">₹{Number(item.amountGiven || 0).toLocaleString()}</td>
      <td className="px-6 py-4 text-right font-extrabold text-emerald-400">₹{Number(item.amountPaid || 0).toLocaleString()}</td>
      <td className="px-6 py-4 text-right font-extrabold text-rose-400">₹{Number(item.remainingAmount || 0).toLocaleString()}</td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full border ${
          item.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          item.status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
          'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>{item.status}</span>
      </td>
    </tr>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Money Transactions
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full border border-emerald-500/30">Finance</span>
          </h1>
          <p className="text-emerald-100/60 mt-2 text-lg font-medium">Track money given, payments received, and pending balances.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Given" value={`₹${totalGiven.toLocaleString()}`} icon={ArrowRightLeft} iconColor="text-indigo-400" iconBg="bg-indigo-500/10 border-indigo-500/20" onClick={() => handleCardClick('Total Given')} />
        <StatCard title="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={Banknote} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20" onClick={() => handleCardClick('Total Paid')} />
        <StatCard title="Total Remaining" value={`₹${totalRemaining.toLocaleString()}`} icon={Wallet} iconColor="text-rose-400" iconBg="bg-rose-500/10 border-rose-500/20" onClick={() => handleCardClick('Total Remaining')} />
        <StatCard title="Pending Records" value={pendingCount} icon={CreditCard} iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20" onClick={() => handleCardClick('Pending Records')} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/5">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-500/40 text-white placeholder:text-emerald-200/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          
          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-neutral-300 bg-neutral-900/50 border border-white/10 hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Sr.</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Name & Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Given (₹)</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Paid (₹)</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Remaining (₹)</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 text-sm font-bold text-neutral-400">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-extrabold text-white text-base">{tx.name}</div>
                    <div className="text-xs font-medium text-neutral-400 mt-1">{tx.mobileNumber}</div>
                    {tx.date && <div className="text-xs font-medium text-neutral-500 mt-1">{safeFormatDate(tx.date)}</div>}
                  </td>
                  <td className="px-6 py-5 text-right font-extrabold text-white text-lg">
                    ₹{Number(tx.amountGiven).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right font-extrabold text-emerald-400 text-lg">
                    ₹{Number(tx.amountPaid).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right font-extrabold text-rose-400 text-lg">
                    ₹{Number(tx.remainingAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                      tx.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      tx.status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenPaymentModal(tx)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                        title="Payment History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(tx)}
                        className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-neutral-500 border border-white/10">
                        <Wallet className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-white">No Transactions Found</h3>
                      <p className="text-neutral-400 text-base font-medium max-w-sm mt-2">No money records match your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-extrabold text-white mb-6">
                {editingId ? 'Edit Transaction' : 'New Transaction'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">Person Name</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">Mobile Number</label>
                    <input 
                      type="number" required
                      value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">Amount Given (₹)</label>
                    <input 
                      type="number" required min="0"
                      value={formData.amountGiven} onChange={e => setFormData({...formData, amountGiven: e.target.value})}
                      className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-extrabold text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      placeholder="5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">Amount Paid (₹)</label>
                    <input 
                      type="number" min="0"
                      value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})}
                      className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-extrabold text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-bold text-rose-400">Remaining Balance:</span>
                  <span className="text-2xl font-extrabold text-white">₹{calcTempRemaining().toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" required
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">Notes (Optional)</label>
                  <textarea 
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all min-h-[80px]"
                    placeholder="Any relevant details..."
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-neutral-300 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] transform hover:scale-105"
                  >
                    {editingId ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
        {paymentModalOpen && selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-emerald-400" /> Payment History
                </h2>
                <p className="text-neutral-400 mt-1 font-medium">{selectedTx.name} • {selectedTx.mobileNumber}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-xs font-bold text-neutral-500 uppercase">Total Given</p>
                  <p className="text-lg font-extrabold text-white mt-1">₹{Number(selectedTx.amountGiven).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs font-bold text-emerald-500/70 uppercase">Total Paid</p>
                  <p className="text-lg font-extrabold text-emerald-400 mt-1">₹{Number(selectedTx.amountPaid).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-xs font-bold text-rose-500/70 uppercase">Remaining</p>
                  <p className="text-lg font-extrabold text-rose-400 mt-1">₹{Number(selectedTx.remainingAmount).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                <h3 className="text-sm font-bold text-white mb-3">Previous Payments</h3>
                {selectedTx.paymentHistory && selectedTx.paymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTx.paymentHistory.map((payment, idx) => (
                      <div key={payment.id || idx} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-white">{safeFormatDate(payment.date)}</p>
                          {payment.notes && <p className="text-xs text-neutral-400 mt-1">{payment.notes}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-base font-extrabold text-emerald-400">+₹{Number(payment.amount).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
                    <p className="text-sm font-medium text-neutral-400">No payment history available.</p>
                  </div>
                )}
              </div>

              {selectedTx.remainingAmount > 0 && (
                <div className="pt-4 border-t border-white/10 mt-auto">
                  <h3 className="text-sm font-bold text-white mb-3">Add New Payment</h3>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-emerald-400/70 uppercase">Amount (₹)</label>
                        <input 
                          type="number" required min="1" max={selectedTx.remainingAmount}
                          value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                          className="w-full px-3 py-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:border-emerald-400 transition-all"
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-emerald-400/70 uppercase">Date</label>
                        <input 
                          type="date" required
                          value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:border-emerald-400 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-bold text-emerald-400/70 uppercase">Notes (Optional)</label>
                        <input 
                          type="text"
                          value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                          className="w-full px-3 py-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-sm font-bold text-white focus:border-emerald-400 transition-all"
                          placeholder="e.g. Paid in cash"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] h-[42px]"
                      >
                        Record Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {activeModal && (
        <DetailsModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={activeModal.title}
          value={activeModal.value}
          data={activeModal.data}
          columns={['Name & Contact', {label: 'Given', align: 'right'}, {label: 'Paid', align: 'right'}, {label: 'Remaining', align: 'right'}, {label: 'Status', align: 'center'}]}
          renderRow={renderModalRow}
        />
      )}
    </div>
  );
}
