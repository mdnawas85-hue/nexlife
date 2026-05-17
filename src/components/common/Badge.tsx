interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  const variantClass = variant === 'outline' ? 'border border-current bg-transparent' : '';
  return (
    <span className={`${base} ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
