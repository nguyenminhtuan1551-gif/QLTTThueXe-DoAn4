import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'text-blue-700 bg-blue-100/60',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-100/60',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'text-amber-700 bg-amber-100/60',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'text-purple-700 bg-purple-100/60',
    },
  };

  const scheme = colorMap[color];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        )}
      </div>

      <div className={`p-3 rounded-xl border ${scheme.bg}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
