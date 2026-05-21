import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Printer, Search, ArrowLeft, FileText, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';

export default function Invoice() {
  const location = useLocation();
  const salesData = useStore((state) => state.salesData);
  const componentRef = useRef(null);
  
  const [selectedItem, setSelectedItem] = useState(location.state?.item || null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice_${selectedItem?.imeiNumber || 'Receipt'}`,
  });

  const handleDownloadPDF = () => {
    if (!componentRef.current) return;
    const element = componentRef.current;
    
    const opt = {
      margin: 0.5,
      filename: `Invoice_${selectedItem?.imeiNumber || 'Receipt'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // If no item passed via location state, we need to pick one
  if (!selectedItem) {
    const searchResults = searchTerm 
      ? salesData.filter(item => 
          item.imeiNumber?.includes(searchTerm) || 
          item.customerPhone?.includes(searchTerm) ||
          item.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : salesData.slice(0, 5);

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-20">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Select Invoice</h1>
          <p className="text-muted-foreground mt-1">Search and select a transaction to generate an invoice.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-border bg-muted/10">
            <div className="relative max-w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by IMEI, Customer Phone, or Model Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
          </div>

          <div className="p-0">
            {searchResults.length > 0 ? (
              <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                {searchResults.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">{item.brandName} {item.modelName}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">IMEI: {item.imeiNumber} • {item.customerName || 'Walk-in Customer'}</p>
                    </div>
                    <div className="text-left sm:text-right flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-foreground">₹{Number(item.soldPrice).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(parseISO(item.soldDate || item.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="p-2 bg-primary/10 text-primary rounded-lg">
                           <FileText className="w-4 h-4" />
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No matching sales</h3>
                <p className="text-muted-foreground text-sm mt-1">Try searching with a different IMEI or model name.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const invoiceDate = selectedItem.soldDate || selectedItem.createdAt || new Date().toISOString();
  const invoiceNumber = `INV-${invoiceDate.replace(/[-T:\.Z]/g, '').slice(2, 14)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button 
          onClick={() => setSelectedItem(null)}
          className="w-full sm:w-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button 
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Printable Invoice Area - Styled minimally like Stripe/Notion */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none" 
      >
        <div ref={componentRef} className="p-10 sm:p-16 bg-white w-full h-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 mb-10 border-b border-slate-200 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-lg font-bold text-lg">
                  MC
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MobileChoice</h1>
              </div>
              <div className="text-sm text-slate-500 space-y-1">
                <p>Shop No A03, Motiwala Complex</p>
                <p>Nirala Bazar, Chhatrapati Sambhajinagar</p>
                <p>Maharashtra 431001</p>
                <p>Ph: +91 98909 19489</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-xl font-medium text-slate-400 uppercase tracking-widest mb-6">Tax Invoice</h2>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between sm:justify-end gap-4"><span className="text-slate-500">Invoice No:</span> <span className="font-semibold">{invoiceNumber}</span></p>
                <p className="flex justify-between sm:justify-end gap-4"><span className="text-slate-500">Date:</span> <span className="font-semibold">{format(parseISO(invoiceDate), 'MMM dd, yyyy')}</span></p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-12">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Billed To</h3>
            <p className="text-lg font-semibold text-slate-900">{selectedItem.customerName || 'Walk-in Customer'}</p>
            {selectedItem.customerPhone && <p className="text-sm text-slate-500 mt-1">Ph: {selectedItem.customerPhone}</p>}
          </div>

          {/* Items Table */}
          <table className="w-full mb-12 text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Qty</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-5 px-2">
                  <p className="font-semibold text-slate-900 text-base mb-1">{selectedItem.brandName || selectedItem.brand} {selectedItem.modelName}</p>
                  <p className="text-sm text-slate-500 font-mono">IMEI: {selectedItem.imeiNumber || selectedItem.imei}</p>
                  {(selectedItem.color || selectedItem.variant) && (
                    <p className="text-sm text-slate-500 mt-0.5">
                      {selectedItem.color && `Color: ${selectedItem.color}`} 
                      {selectedItem.color && selectedItem.variant && ' • '}
                      {selectedItem.variant && `Storage: ${selectedItem.variant}`}
                    </p>
                  )}
                </td>
                <td className="py-5 px-2 text-center text-slate-900 font-medium">1</td>
                <td className="py-5 px-2 text-right text-slate-900 font-medium">₹{Number(selectedItem.soldPrice).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between py-2 text-sm text-slate-500">
                <span>Subtotal</span>
                <span>₹{Number(selectedItem.soldPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-slate-500">
                <span>Tax (0%)</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between py-4 border-t border-slate-200 items-end">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-slate-900">₹{Number(selectedItem.soldPrice).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200 text-sm flex flex-col sm:flex-row justify-between items-end gap-8">
            <div className="text-slate-500">
              <p className="font-semibold text-slate-900 mb-1">Thank you for your business.</p>
              <p>Goods once sold will not be exchanged or refunded.</p>
            </div>
            <div className="text-center w-40">
              <div className="border-b border-slate-300 mb-2 h-10"></div>
              <p className="text-xs text-slate-400 font-medium">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
