const express = require("express");
const Skill = require("../models/Skill");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all skills for current user
router.get("/", auth, async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user._id });
    res.json(skills);
  } catch (error) {
    console.error("GET SKILLS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add new skill
router.post("/", auth, async (req, res) => {
  try {
    const skill = new Skill({
      ...req.body,
      userId: req.user._id
    });
    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    console.error("POST SKILL ERROR:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update skill
router.put("/:id", auth, async (req, res) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (error) {
    console.error("PUT SKILL ERROR:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete skill
router.delete("/:id", auth, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json({ message: "Skill deleted" });
  } catch (error) {
    console.error("DELETE SKILL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
