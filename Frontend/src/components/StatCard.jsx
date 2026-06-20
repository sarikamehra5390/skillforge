import React from 'react'

function StatCard({ title, value, icon, cardStyle }) {
 return (
  <div className={cardStyle}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-slate-400">
          {title}
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {value}
        </h2>
      </div>

      <div className="text-5xl">
        {icon}
      </div>
    </div>
  </div>
);
}

export default StatCard;