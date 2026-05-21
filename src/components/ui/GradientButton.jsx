import { motion } from 'framer-motion';

export default function GradientButton({ children, onClick, className = '', type = 'button', icon: Icon }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}
      whileTap={{ scale: 0.98 }}
      className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary flex items-center justify-center gap-2 shadow-soft transition-all ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );
}
