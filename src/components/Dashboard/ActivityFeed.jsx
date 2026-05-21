import { motion } from 'framer-motion';
import { ShoppingCart, PackagePlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeed({ inventory, salesData }) {
  // Combine and sort events
  const events = [
    ...inventory.map(item => ({
      id: `inv-${item.id}`,
      type: 'stock',
      title: 'Stock Added',
      description: `${item.brand} ${item.modelName} was added to inventory.`,
      date: item.createdAt,
      icon: PackagePlus,
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
    })),
    ...salesData.map(item => ({
      id: `sale-${item.id}`,
      type: 'sale',
      title: 'Device Sold',
      description: `${item.brandName || item.brand} ${item.modelName} was sold.`,
      date: item.soldDate || item.createdAt,
      icon: ShoppingCart,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
    }))
  ];

  const sortedEvents = events
    .sort((a, b) => {
      const getMs = (val) => {
        if (!val) return 0;
        if (typeof val === 'string') return new Date(val).getTime();
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        return new Date(val).getTime();
      };
      return getMs(b.date) - getMs(a.date);
    })
    .slice(0, 10); // Show top 10

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Activity Timeline</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-10 font-bold">No recent activity.</p>
        ) : (
          <div className="relative space-y-0 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 dark:before:via-white/10 before:to-transparent">
            {sortedEvents.map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4"
              >
                {/* Icon Marker */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-white dark:bg-neutral-900 relative z-10 ${event.iconBg}`}>
                  <event.icon className={`w-4 h-4 ${event.iconColor}`} />
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/80 dark:bg-white/5 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-neutral-900 dark:text-white text-sm">{event.title}</div>
                    <time className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      {event.date ? formatDistanceToNow(new Date(typeof event.date.toDate === 'function' ? event.date.toDate() : event.date), { addSuffix: true }) : 'Just now'}
                    </time>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{event.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
