import React from 'react'

function SkillCard({ skill, cardStyle }) {
  return (
    <div className={cardStyle}>
      <h3 className="text-xl font-bold">
        {skill.name}
      </h3>

      <p className="text-slate-400 mt-2">
        {skill.category}
      </p>

      <button
        className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
      >
        Log Session
      </button>
    </div>
  );
}

export default SkillCard;