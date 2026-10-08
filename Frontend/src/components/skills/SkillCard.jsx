import React from 'react';
import GlassCard from '../common/GlassCard';
import {
  Book,
  Calendar,
  Trophy,
  Trash2,
  Edit2,
} from 'lucide-react';
import Badge from '../common/Badge';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

const getValidDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const SkillCard = ({ skill, onEdit, onDelete }) => {
  const progress = Math.min(
    100,
    Math.max(0, Number(skill?.progress) || 0)
  );

  const lastPracticedDate = getValidDate(
    skill?.lastPracticed
  );

  return (
    <GlassCard
      className={cn(
        'group relative overflow-hidden bg-white/[0.01] transition-all duration-700 hover:border-primary-400/20'
      )}
    >
      <div className="p-10">
        <div className="mb-10 flex items-start justify-between">
          <div className="rounded-[1.5rem] border border-primary-500/10 bg-primary-500/5 p-5 text-primary-400 shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:bg-primary-500/10">
            <Book size={32} aria-hidden="true" />
          </div>

          <div className="flex translate-y-2 gap-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit?.(skill)}
              className="rounded-2xl border border-white/5 bg-white/5 p-3 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
              title="Refine path"
              aria-label={`Edit ${skill?.name || 'skill'}`}
            >
              <Edit2 size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onDelete?.(skill?._id)}
              className="rounded-2xl border border-red-500/10 bg-red-500/5 p-3 text-slate-500 transition-all hover:bg-red-500/20 hover:text-red-400"
              title="Release path"
              aria-label={`Delete ${skill?.name || 'skill'}`}
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <h3 className="mb-3 text-3xl font-bold italic tracking-tight text-white">
          {skill?.name || 'Untitled skill'}
        </h3>

        <Badge
          variant="purple"
          className="mb-8 rounded-full border-none bg-white/5 px-4 py-1 text-[10px] italic lowercase tracking-widest"
        >
          {skill?.category || 'general'}
        </Badge>

        <div className="space-y-8">
          <div>
            <div className="mb-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="italic text-slate-500">
                Mastery unfolding
              </span>

              <span className="text-primary-300">
                {progress}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full border border-white/5 bg-white/[0.03]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 shadow-[0_0_15px_rgba(167,139,250,0.2)] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Rituals
              </span>

              <div className="flex items-center gap-2 text-white">
                <Trophy
                  size={16}
                  className="text-warm-amber"
                  aria-hidden="true"
                />

                <span className="text-lg font-bold tracking-tighter">
                  {Number(skill?.totalSessions) || 0}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Presence
              </span>

              <div className="flex items-center gap-2 text-white">
                <Calendar
                  size={16}
                  className="text-sky-blue"
                  aria-hidden="true"
                />

                <span className="text-sm font-bold italic tracking-tight">
                  {lastPracticedDate
                    ? formatDistanceToNow(
                        lastPracticedDate,
                        {
                          addSuffix: true,
                        }
                      )
                    : 'awaiting'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organic Background Glow */}
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-primary-500/5 opacity-0 blur-[60px] transition-opacity duration-1000 group-hover:opacity-100" />
    </GlassCard>
  );
};

export default SkillCard;