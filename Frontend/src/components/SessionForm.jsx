import React from 'react'

function SessionForm({
   duration,
  setDuration,
  notes,
  setNotes,
  selectedSkill,
  setSelectedSkill,
  skills,
  addSession,
  cardStyle,
}) {
  return (
    <div className={`${cardStyle} mt-8`}>
      <h2 className="text-2xl font-bold mb-4">
        📝 Log Practice Session
      </h2>

      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="bg-slate-800 p-3 rounded-lg outline-none w-full mb-4"
      />

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="bg-slate-800 p-3 rounded-lg outline-none w-full mb-4"
      />

      <button
        onClick={addSession}
        className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg w-full font-semibold transition"
      >
        Save Session
      </button>
      <select
  value={selectedSkill}
  onChange={(e) => setSelectedSkill(e.target.value)}
  className="bg-slate-800 p-3 rounded-lg outline-none w-full mb-4"
>
  <option value="">
    Select Skill
  </option>

  {skills.map((skill) => (
    <option
      key={skill._id}
      value={skill.name}
    >
      {skill.name}
    </option>
  ))}
</select>
    </div>
  );
}

export default SessionForm;