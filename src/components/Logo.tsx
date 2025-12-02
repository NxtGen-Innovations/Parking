import { Car } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 36, text: 'text-3xl' },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-primary p-2 rounded-xl shadow-soft">
        <Car size={sizes[size].icon} className="text-primary-foreground" />
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} text-foreground`}>
          Park<span className="text-primary">Ease</span>
        </span>
      )}
    </div>
  );
}
