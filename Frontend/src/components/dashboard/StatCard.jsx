import React from 'react';
import GlassCard from '../common/GlassCard';
import Badge from '../common/Badge';
import { cn } from '../../utils/cn';

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  description,
  className,
}) => {
  const hasTrend = trend !== undefined && trend !== null;
  const numericTrend = Number(trend);

  return (
    <GlassCard
      className={cn(
        'group p-6 transition-all duration-500 hover:translate-y-[-4px]',
        className
      )}
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-all duration-500 group-hover:border-primary-500/20 group-hover:bg-primary-500/10 group-hover:text-primary-500">
          {Icon && (
            <Icon
              size={24}
              aria-hidden="true"
            />
          )}
        </div>

        {hasTrend && (
          <Badge
            variant={numericTrend > 0 ? 'success' : 'danger'}
            className="rounded-md"
          >
            {numericTrend > 0 ? '+' : ''}
            {numericTrend}%
          </Badge>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {label}
        </h3>

        <p className="text-3xl font-black italic tracking-tight text-white">
          {value}
        </p>

        {description && (
          <p className="mt-2 text-xs font-medium text-slate-500">
            {description}
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;