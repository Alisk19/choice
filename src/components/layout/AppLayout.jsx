import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '../../store/useStore';
import { dbService } from '../../services/db';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeamsBackground } from '../ui/beams-background';

export default function AppLayout() {
  const setInventory = useStore((state) => state.setInventory);
  const setSalesData = useStore((state) => state.setSalesData);
  const setMoneyTransactions = useStore((state) => state.setMoneyTransactions);
  const isInitialized = useStore((state) => state.isInitialized);
  const setInitialized = useStore((state) => state.setInitialized);
  
  const location = useLocation();

  useEffect(() => {
    let inventoryUnsub;
    let salesUnsub;
    let moneyUnsub;

    // Always initialize after 2s max, even if Firebase fails
    const fallbackTimer = setTimeout(() => {
      setInitialized(true);
    }, 2000);

    try {
      inventoryUnsub = dbService.subscribeToInventory(
        (data) => {
          clearTimeout(fallbackTimer);
          setInventory(data);
          setInitialized(true);
        },
        (error) => {
          console.error("Inventory sync error:", error);
          clearTimeout(fallbackTimer);
          setInitialized(true);
        }
      );

      salesUnsub = dbService.subscribeToSales(
        (data) => { setSalesData(data); },
        (error) => { console.error("Sales sync error:", error); }
      );
      
      moneyUnsub = dbService.subscribeToMoneyTransactions(
        (data) => { setMoneyTransactions(data); },
        (error) => { console.error("Money transactions sync error:", error); }
      );
    } catch (error) {
      clearTimeout(fallbackTimer);
      setInitialized(true);
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (inventoryUnsub) inventoryUnsub();
      if (salesUnsub) salesUnsub();
      if (moneyUnsub) moneyUnsub();
    };
  }, [setInventory, setSalesData, setMoneyTransactions, setInitialized]);

  if (!isInitialized) {
    return (
      <BeamsBackground
        className="flex h-screen items-center justify-center"
        style={{ minHeight: '100vh' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          <p className="text-lg font-bold text-white tracking-wide">Initializing Workspace...</p>
        </motion.div>
      </BeamsBackground>
    );
  }

  return (
    <BeamsBackground
      className="flex"
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      {/* Sidebar — fixed on left */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
          }
        }}
      />
    </BeamsBackground>
  );
}
