import { getMotivationMessage, MotivationTone } from '@/lib/motivation';
import { PartyPopper, Sunrise, Flame, TrendingUp } from 'lucide-react';

const TONE_STYLES: Record<MotivationTone, string> = {
  start: 'from-slate-500 to-slate-700',
  progress: 'from-sky-500 to-blue-700',
  close: 'from-amber-500 to-orange-600',
  done: 'from-emerald-500 to-teal-600'
};

const TONE_ICON: Record<MotivationTone, typeof PartyPopper> = {
  start: Sunrise,
  progress: TrendingUp,
  close: Flame,
  done: PartyPopper
};

export default function MotivationBanner({ completed, total }: { completed: number; total: number }) {
  const { message, subtext, tone } = getMotivationMessage(completed, total);
  const Icon = TONE_ICON[tone];

  return (
    <div className={`flex items-center gap-4 rounded-xl2 bg-gradient-to-br ${TONE_STYLES[tone]} p-5 text-white shadow-glow animate-fadeUp`}>
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-base font-bold leading-tight">{message}</p>
        <p className="text-sm text-white/80">{subtext}</p>
      </div>
    </div>
  );
}
