export default function StatusBadge({ status }) {
  const getStyles = () => {
    switch(status?.toLowerCase()) {
      case 'in stock':
        return 'bg-success/10 text-success border-success/20';
      case 'sold':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'low stock':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {status}
    </span>
  );
}
