function WeeklyGoals({ sessions }) {
  const weeklyGoal = 300;

  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.duration,
    0
  );

  const percentage = Math.min(
    (totalMinutes / weeklyGoal) * 100,
    100
  );

  return (
    <div
      className="
      bg-slate-900/60
      backdrop-blur-xl
      border
      border-slate-800
      rounded-3xl
      p-6
    "
    >
      <h2 className="text-2xl font-bold mb-4">
        🎯 Weekly Goal
      </h2>

      <p className="mb-4">
        {totalMinutes} / {weeklyGoal} mins
      </p>

      <div className="w-full bg-slate-800 rounded-full h-4">
        <div
          className="bg-purple-500 h-4 rounded-full transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-4 text-slate-400">
        {Math.round(percentage)}% Complete
      </p>
    </div>
  );
}

export default WeeklyGoals;