import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

function Heatmap({ sessions }) {
  const values = sessions.map((session) => ({
    date: session.completedAt,
    count: session.duration,
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
        📅 Activity Heatmap
      </h2>

      <CalendarHeatmap
        startDate={
          new Date(
            new Date().setMonth(
              new Date().getMonth() - 3
            )
          )
        }
        endDate={new Date()}
        values={values}
      />
    </div>
  );
}

export default Heatmap;