import React from 'react';
import GlassCard from '../common/GlassCard';
import { MoreVertical, Book, Calendar, Trophy, Trash2, Edit2 } from 'lucide-react';
import Badge from '../common/Badge';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

const SkillCard = ({ skill, onEdit, onDelete }) => {
  return (
    <GlassCard className="group relative overflow-hidden hover:border-primary-400/20 transition-all duration-700 bg-white/[0.01]">
      <div className="p-10">
        <div className="flex justify-between items-start mb-10">
          <div className="p-5 bg-primary-500/5 border border-primary-500/10 text-primary-400 rounded-[1.5rem] group-hover:scale-110 group-hover:bg-primary-500/10 transition-all duration-700 shadow-inner">
            <Book size={32} />
          </div>
          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <button 
              onClick={() => onEdit(skill)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5"
              title="Refine path"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => onDelete(skill._id)}
              className="p-3 bg-red-500/5 hover:bg-red-500/20 rounded-2xl text-slate-500 hover:text-red-400 transition-all border border-red-500/10"
              title="Release path"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-white mb-3 tracking-tight italic">{skill.name}</h3>
        <Badge variant="purple" className="mb-8 px-4 py-1 rounded-full bg-white/5 border-none text-[10px] tracking-widest lowercase italic">{skill.category}</Badge>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
              <span className="text-slate-500 italic">Mastery unfolding</span>
              <span className="text-primary-300">{skill.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(167,139,250,0.2)]"
                style={{ width: `${skill.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Rituals</span>
              <div className="flex items-center gap-2 text-white">
                <Trophy size={16} className="text-warm-amber" />
                <span className="text-lg font-bold tracking-tighter">{skill.totalSessions}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Presence</span>
              <div className="flex items-center gap-2 text-white">
                <Calendar size={16} className="text-sky-blue" />
                <span className="text-sm font-bold tracking-tight italic">
                  {skill.lastPracticed ? formatDistanceToNow(new Date(skill.lastPracticed), { addSuffix: true }) : 'awaiting'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Organic Background Glow */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </GlassCard>
  );
};

export default SkillCard;
