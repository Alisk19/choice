import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  DownloadCloud, 
  Receipt,
  Wallet,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Product', path: '/entry', icon: PlusCircle },
  { name: 'Stock', path: '/stock', icon: Package },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Money Tracking', path: '/money', icon: Wallet },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Export', path: '/export', icon: DownloadCloud },
  { name: 'Invoice', path: '/invoice', icon: Receipt },
];

export default function Sidebar() {
  const { isDarkMode, toggleDarkMode } = useStore();

  return (
    <div className="hidden md:flex flex-col w-72 bg-white/80 dark:bg-neutral-950/40 backdrop-blur-xl border-r border-neutral-200 dark:border-white/10 h-full z-30 transition-colors duration-300">
      <div className="flex items-center justify-between h-20 px-8 mb-6 border-b border-neutral-200 dark:border-white/5 transition-colors duration-300">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/30">
            <span className="text-white font-extrabold text-xl leading-none">M</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white transition-colors duration-300">
            MobileChoice
          </h1>
        </div>
      </div>
      
      <div className="px-6 mb-4 flex items-center justify-between">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2">Main Menu</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group text-sm font-bold',
                isActive 
                  ? 'text-indigo-600 dark:text-white' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-50 dark:bg-white/10 rounded-2xl border border-indigo-100 dark:border-white/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {!isActive && (
                   <div className="absolute inset-0 bg-neutral-100 dark:bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
                <item.icon className={cn("w-5 h-5 z-10", isActive ? "text-indigo-600 dark:text-cyan-400" : "text-neutral-400 dark:text-neutral-500 group-hover:text-indigo-500 dark:group-hover:text-neutral-300 transition-colors")} />
                <span className="z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme Switcher */}
      <div className="p-6 border-t border-neutral-200 dark:border-white/5 transition-colors duration-300">
        <button
          onClick={toggleDarkMode}
          className="relative w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-white bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5"
        >
          <span className="z-10 flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDarkMode ? <Moon className="w-5 h-5 text-cyan-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </motion.div>
            </AnimatePresence>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-indigo-500' : 'bg-neutral-300'}`}>
            <motion.div 
              layout
              className="w-4 h-4 bg-white rounded-full shadow-md"
              animate={{ x: isDarkMode ? 16 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
