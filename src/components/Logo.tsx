import { Car } from 'lucide-react';

// FIX: Explicitly defined props interface to resolve TS errors
interface LogoProps {
  color?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo = ({ color = 'light', size = 'md', className = '' }: LogoProps) => {
  const isDark = color === 'dark';

  // Map size prop to CSS classes for text size
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // Map size prop to Icon pixel size
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className={`flex items-center gap-2 font-bold ${sizeClasses[size]} ${className}`}>
      <div 
        className={`
          p-1.5 rounded-lg transition-colors
          ${isDark ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600'}
        `}
      >
        <Car size={iconSizes[size]} className="fill-current" />
      </div>
      <span className={`tracking-tight ${isDark ? 'text-slate-900' : 'text-white'}`}>
        Park
        <span className={isDark ? 'text-emerald-600' : 'text-emerald-400'}>
          Ease
        </span>
      </span>
    </div>
  );
};