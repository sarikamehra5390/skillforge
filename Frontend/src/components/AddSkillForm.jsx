import React from 'react'

function AddSkillForm({
  skillName,
  setSkillName,
  category,
  setCategory,
  addSkill,
  cardStyle,
}) {
  return (
    <div className={cardStyle}>
      <h2 className="text-2xl font-bold mb-4 ">
        ➕ Add New Skill
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Skill Name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          className="bg-slate-800 p-3 rounded-lg outline-none"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-800 p-3 rounded-lg outline-none"
        />

        <button
          onClick={addSkill}
          className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-semibold transition"
        >
          Add Skill
        </button>
      </div>
    </div>
  );
}

export default AddSkillForm;