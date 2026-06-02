import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function DetailsModal({ isOpen, onClose, title, value, data, columns, renderRow }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-4xl max-h-[85vh] rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] flex flex-col shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-200 dark:border-white/10 flex justify-between items-start bg-neutral-50 dark:bg-white/5">
            <div>
              <h3 className="font-extrabold text-xl text-neutral-900 dark:text-white">{title}</h3>
              {value && <p className="text-3xl font-black text-indigo-500 dark:text-indigo-400 mt-2">{value}</p>}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-0">
            {data && data.length > 0 ? (
              <table className="w-full text-left whitespace-nowrap">
                <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
                  <tr className="border-b border-neutral-200 dark:border-white/10">
                    {columns.map((col, i) => (
                      <th key={i} className={`px-6 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                        {col.label || col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                  {data.map((item, idx) => renderRow(item, idx))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-neutral-500 font-medium">
                No records found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
