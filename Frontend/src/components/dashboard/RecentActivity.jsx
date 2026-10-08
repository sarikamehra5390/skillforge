import GlassCard from '../common/GlassCard';
import { formatDistanceToNow } from 'date-fns';
import { History, Clock, Zap } from 'lucide-react';

const formatActivityDate = (date) => {
  if (!date) {
    return 'Recently';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently';
  }

  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
  });
};

const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <GlassCard className="bg-white/[0.01] p-10">
        <h3 className="mb-6 text-xl font-bold italic text-white">
          The journal is empty...
        </h3>

        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <History
            size={48}
            className="mb-6 animate-soft-float opacity-10"
            aria-hidden="true"
          />

          <p className="text-sm font-medium">
            Every journey begins with a single moment.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="bg-white/[0.01] p-10">
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div
            key={activity?._id || `activity-${index}`}
            className="group flex items-center gap-6 rounded-[2rem] border border-transparent p-5 transition-all duration-500 hover:border-white/5 hover:bg-white/[0.03]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500/5 text-primary-400 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:bg-primary-500/10">
              <Clock size={24} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-lg font-bold italic tracking-tight text-white">
                {activity?.skillName || 'Practice Session'}
              </h4>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {Number(activity?.duration) || 0} minutes of focus •{' '}
                {formatActivityDate(activity?.completedAt)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 font-bold italic text-warm-amber">
              <Zap
                size={16}
                fill="currentColor"
                aria-hidden="true"
              />

              <span className="text-sm">
                +{Number(activity?.xpGained) || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default RecentActivity;