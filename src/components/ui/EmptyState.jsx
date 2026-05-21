import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center glass-card border-dashed"
    >
      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary/40" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8">{description}</p>
      {action}
    </motion.div>
  );
}
