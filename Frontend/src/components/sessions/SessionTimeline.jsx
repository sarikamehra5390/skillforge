import React from 'react';
import { format } from 'date-fns';
import { Clock, Zap, MessageSquare, Calendar } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import Badge from '../common/Badge';

const SessionTimeline = ({ sessions }) => {
  if (!sessions || sessions.length === 0) return null;

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = format(new Date(session.completedAt), 'MMMM d, yyyy');
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  return (
    <div className="space-y-12">
      {Object.entries(groupedSessions).map(([date, daySessions]) => (
        <div key={date} className="relative">
          <div className="sticky top-20 z-10 mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-forge-900 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
              <Calendar size={14} className="text-primary-400" />
              <span className="text-xs font-black text-white uppercase tracking-[0.2em] italic">{date}</span>
            </div>
          </div>
          
          <div className="space-y-6 ml-8 border-l-2 border-white/5 pl-12 pb-6">
            {daySessions.map((session) => (
              <GlassCard key={session._id} className="p-8 relative group hover:border-primary-400/30 transition-all duration-500">
                {/* Connector Node */}
                <div className="absolute -left-[58px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-forge-950 border-4 border-white/5 flex items-center justify-center z-20 group-hover:border-primary-400/50 transition-all duration-500">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary-400 transition-colors" />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-2xl font-bold text-white italic tracking-tight">{session.skillName}</h4>
                      <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {format(new Date(session.completedAt), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-secondary-400" />
                        <span className="text-sm font-bold uppercase tracking-tight italic">{session.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-warm-amber" fill="currentColor" />
                        <span className="text-sm font-black text-warm-amber italic">+{session.xpGained} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div className="flex-1 max-w-xl">
                      <div className="relative p-5 bg-white/[0.02] rounded-[1.25rem] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                        <MessageSquare size={16} className="absolute -top-2 -left-2 text-slate-600 bg-forge-900 rounded-md p-0.5" />
                        <p className="text-sm text-slate-400 font-medium italic leading-relaxed line-clamp-3">"{session.notes}"</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-shrink-0">
                    <Badge variant="success" className="px-4 py-1 rounded-xl bg-emerald-400/5 text-emerald-400 border-emerald-400/20 uppercase italic">Completed</Badge>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionTimeline;
