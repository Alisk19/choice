import { motion } from 'framer-motion';
const brands = ['All Brands', 'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Other'];

export default function BrandFilter({ activeBrand, setActiveBrand }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {brands.map((brand, i) => {
        const isActive = activeBrand === brand;
        return (
          <motion.button
            key={brand}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveBrand(brand)}
            className={`relative px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 border ${
              isActive 
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                : 'bg-white/80 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {brand}
            {isActive && (
              <motion.div 
                layoutId="activeBrand"
                className="absolute inset-0 border-2 border-indigo-400 dark:border-indigo-300 rounded-2xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
