import { motion } from 'framer-motion';

export default function ModernTable({ headers, children }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {headers.map((header, i) => (
                <th key={i} className="py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="divide-y divide-border bg-card"
          >
            {children}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({ children }) {
  return (
    <motion.tr 
      whileHover={{ backgroundColor: 'var(--color-muted)' }}
      className="transition-colors group"
    >
      {children}
    </motion.tr>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`py-4 px-6 text-sm text-foreground ${className}`}>
      {children}
    </td>
  );
}
