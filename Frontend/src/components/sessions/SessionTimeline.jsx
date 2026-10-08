import { format } from 'date-fns';
import {
  Clock,
  Zap,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import GlassCard from '../common/GlassCard';
import Badge from '../common/Badge';

const getValidDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const SessionTimeline = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Group sessions by date.
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = getValidDate(session?.completedAt);

    if (!date) {
      return acc;
    }

    const dateLabel = format(date, 'MMMM d, yyyy');

    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }

    acc[dateLabel].push({
      ...session,
      parsedDate: date,
    });

    return acc;
  }, {});

  // If all sessions had invalid dates, don't render
  // an empty timeline.
  if (Object.keys(groupedSessions).length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {Object.entries(groupedSessions).map(
        ([date, daySessions]) => (
          <div key={date} className="relative">
            <div className="sticky top-20 z-10 mb-8">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-forge-900 px-6 py-2 shadow-2xl backdrop-blur-xl">
                <Calendar
                  size={14}
                  className="text-primary-400"
                  aria-hidden="true"
                />

                <span className="text-xs font-black italic uppercase tracking-[0.2em] text-white">
                  {date}
                </span>
              </div>
            </div>

            <div className="ml-8 space-y-6 border-l-2 border-white/5 pb-6 pl-12">
              {daySessions.map((session, index) => (
                <GlassCard
                  key={
                    session?._id ||
                    `session-${date}-${index}`
                  }
                  className="group relative p-8 transition-all duration-500 hover:border-primary-400/30"
                >
                  {/* Connector Node */}
                  <div className="absolute -left-[58px] top-1/2 z-20 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/5 bg-forge-950 transition-all duration-500 group-hover:border-primary-400/50">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-700 transition-colors group-hover:bg-primary-400" />
                  </div>

                  <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-4">
                        <h4 className="text-2xl font-bold italic tracking-tight text-white">
                          {session?.skillName ||
                            'Practice Session'}
                        </h4>

                        <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {format(
                              session.parsedDate,
                              'HH:mm'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock
                            size={16}
                            className="text-secondary-400"
                            aria-hidden="true"
                          />

                          <span className="text-sm font-bold italic uppercase tracking-tight">
                            {Number(session?.duration) || 0}{' '}
                            min
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Zap
                            size={16}
                            className="text-warm-amber"
                            fill="currentColor"
                            aria-hidden="true"
                          />

                          <span className="text-sm font-black italic text-warm-amber">
                            +{Number(session?.xpGained) || 0}{' '}
                            XP
                          </span>
                        </div>
                      </div>
                    </div>

                    {session?.notes && (
                      <div className="max-w-xl flex-1">
                        <div className="group relative rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]">
                          <MessageSquare
                            size={16}
                            className="absolute -left-2 -top-2 rounded-md bg-forge-900 p-0.5 text-slate-600"
                            aria-hidden="true"
                          />

                          <p className="line-clamp-3 text-sm font-medium italic leading-relaxed text-slate-400">
                            "{session.notes}"
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="shrink-0">
                      <Badge
                        variant="success"
                        className="rounded-xl border-emerald-400/20 bg-emerald-400/5 px-4 py-1 uppercase italic text-emerald-400"
                      >
                        Completed
                      </Badge>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SessionTimeline;