import { LucideIcon } from 'lucide-react';
import { classNames } from '@/lib/utils';

type Tone = 'brand' | 'green' | 'amber' | 'red' | 'sky' | 'violet';

const TONE_STYLES: Record<Tone, { bg: string; icon: string; ring: string }> = {
  brand: { bg: 'from-brand-500 to-brand-700', icon: 'text-white', ring: 'ring-brand-200 dark:ring-brand-500/20' },
  green: { bg: 'from-emerald-400 to-emerald-600', icon: 'text-white', ring: 'ring-emerald-200 dark:ring-emerald-500/20' },
  amber: { bg: 'from-amber-400 to-orange-500', icon: 'text-white', ring: 'ring-amber-200 dark:ring-amber-500/20' },
  red: { bg: 'from-rose-400 to-red-600', icon: 'text-white', ring: 'ring-rose-200 dark:ring-rose-500/20' },
  sky: { bg: 'from-sky-400 to-blue-600', icon: 'text-white', ring: 'ring-sky-200 dark:ring-sky-500/20' },
  violet: { bg: 'from-violet-400 to-purple-600', icon: 'text-white', ring: 'ring-violet-200 dark:ring-violet-500/20' }
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  suffix,
  subtext
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  suffix?: string;
  subtext?: string;
}) {
  const style = TONE_STYLES[tone];
  return (
    <div className={classNames('card animate-popIn p-4 ring-1 ring-inset', style.ring)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className={classNames('flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-soft', style.bg)}>
          <Icon size={16} className={style.icon} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">
        {value}
        {suffix && <span className="ml-0.5 text-base font-semibold text-slate-400">{suffix}</span>}
      </p>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
