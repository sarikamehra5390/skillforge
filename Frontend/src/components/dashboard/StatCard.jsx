import React from 'react';
import GlassCard from '../common/GlassCard';
import Badge from '../common/Badge';
import { cn } from '../../utils/cn';

const StatCard = ({ label, value, icon: Icon, trend, description, className }) => {
  return (
    <GlassCard className={cn("p-6 group hover:translate-y-[-4px] transition-all duration-500", className)}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl group-hover:bg-primary-500/10 group-hover:border-primary-500/20 group-hover:text-primary-500 transition-all duration-500">
          <Icon size={24} />
        </div>
        {trend && (
          <Badge variant={trend > 0 ? "success" : "danger"} className="rounded-md">
            {trend > 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</h3>
        <p className="text-3xl font-black text-white tracking-tight italic">{value}</p>
        {description && <p className="text-xs text-slate-500 mt-2 font-medium">{description}</p>}
      </div>
    </GlassCard>
  );
};

export default StatCard;
