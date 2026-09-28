'use client';

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DayStat } from '@/lib/types';
import { format, parseISO } from 'date-fns';

export default function TrendChart({ data }: { data: DayStat[] }) {
  const chartData = data.map((d) => ({ day: format(parseISO(d.date), 'EEE'), rate: d.completionRate }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={36} />
          <Tooltip formatter={(v: number) => [`${v}%`, 'Completion']} labelClassName="text-xs" />
          <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
