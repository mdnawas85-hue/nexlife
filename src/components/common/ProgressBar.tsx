interface ProgressBarProps {
  value: number;
  color?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function ProgressBar({ value, color = '#6366f1', size = 'md', showLabel = false }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const clamp = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-100 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-300`}
          style={{ width: `${clamp}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 font-medium w-8 text-right">{clamp}%</span>
      )}
    </div>
  );
}
