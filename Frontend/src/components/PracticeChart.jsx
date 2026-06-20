import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function PracticeChart({ sessions }) {
  const chartData = sessions.map((session) => ({
    date: new Date(
      session.completedAt
    ).toLocaleDateString(),
    minutes: session.duration,
  }));

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
      <h2 className="text-2xl font-bold mb-6">
        📈 Practice Progress
      </h2>

      <ResponsiveContainer
        width="100%"
        height={400}
      >
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="minutes"
            stroke="#a855f7"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PracticeChart;