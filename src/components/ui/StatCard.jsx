import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, iconColor = 'text-indigo-400', iconBg = 'bg-indigo-500/10 border-indigo-500/20' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02, rotateX: 2, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className={`w-16 h-16 ${iconColor.replace('text-', 'text-')}`} />
      </div>
      <div className="flex items-center gap-3">
        <div className={`p-3 ${iconBg} rounded-xl border`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">{title}</h3>
      </div>
      <div>
        <p className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 font-bold ${trend === 'up' ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </p>
        )}
      </div>
    </motion.div>
  );
}
