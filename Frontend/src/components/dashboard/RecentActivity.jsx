import React from 'react';
import GlassCard from '../common/GlassCard';
import { formatDistanceToNow } from 'date-fns';
import { History, Clock, Zap } from 'lucide-react';

const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <GlassCard className="p-10 bg-white/[0.01]">
        <h3 className="text-xl font-bold text-white mb-6 italic">The journal is empty...</h3>
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <History size={48} className="mb-6 opacity-10 animate-soft-float" />
          <p className="text-sm font-medium">Every journey begins with a single moment.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-10 bg-white/[0.01]">
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity._id} className="flex items-center gap-6 p-5 rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group border border-transparent hover:border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/5 flex items-center justify-center text-primary-400 group-hover:scale-110 group-hover:bg-primary-500/10 transition-all duration-500 shadow-inner">
              <Clock size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-white truncate italic tracking-tight">{activity.skillName}</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {activity.duration} minutes of focus • {formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2 text-warm-amber font-bold italic">
              <Zap size={16} fill="currentColor" />
              <span className="text-sm">+{activity.xpGained}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default RecentActivity;
