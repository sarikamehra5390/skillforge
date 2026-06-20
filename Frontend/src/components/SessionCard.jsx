import React from 'react'

function SessionCard({ session, cardStyle }) {
  return (
    <div className={cardStyle}>
      <h3 className="text-xl font-bold">
        {session.skillName}
      </h3>

      <p className="text-slate-400 mt-2">
        {session.duration} mins
      </p>

      <p className="mt-2">
        {session.notes}
      </p>

      <p className="text-sm text-slate-500 mt-3">
        {new Date(session.completedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default SessionCard;