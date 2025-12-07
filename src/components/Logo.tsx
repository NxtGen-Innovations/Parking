import { Car } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 22, text: 'text-xl', box: 'p-2.5' },
    md: { icon: 32, text: 'text-3xl', box: 'p-3' },
    lg: { icon: 42, text: 'text-4xl', box: 'p-3.5' },
  };

  return (
    <div className="flex items-center gap-4">
      {/* Bigger icon box */}
      <div
        className={`${sizes[size].box} rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md`}
      >
        <Car
          size={sizes[size].icon}
          className="text-sky-400 stroke-[2.5]"  // thicker icon lines
        />
      </div>

      {/* Bigger, bolder text */}
      {showText && (
        <span
          className={`font-extrabold ${sizes[size].text} tracking-tight text-slate-100`}
        >
          Park
          <span className="text-sky-400 drop-shadow-sm">Ease</span>
        </span>
      )}
    </div>
  );
}
