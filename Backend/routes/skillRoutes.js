const express = require("express");
const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const Session = require("../models/Session");
const auth = require("../middleware/auth");
const router = express.Router();

const { isValidObjectId } = mongoose.Types;

router.get("/", auth, async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user._id });
    res.json(skills);
  } catch (error) {
    console.error("GET SKILLS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, category } = req.body;

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Name must be a non-empty string" });
    }
    if (typeof category !== "string" || category.trim().length === 0) {
      return res.status(400).json({ message: "Category must be a non-empty string" });
    }

    const skill = new Skill({
      name: name.trim(),
      category: category.trim(),
      userId: req.user._id
    });
    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    console.error("POST SKILL ERROR:", error);
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const { name, category } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Name must be a non-empty string" });
      }
      updateData.name = name.trim();
    }
    if (category !== undefined) {
      if (typeof category !== "string" || category.trim().length === 0) {
        return res.status(400).json({ message: "Category must be a non-empty string" });
      }
      updateData.category = category.trim();
    }

    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (error) {
    console.error("PUT SKILL ERROR:", error);
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    await Session.deleteMany({ skillId: skill._id, userId: req.user._id });
    res.json({ message: "Skill deleted" });
  } catch (error) {
    console.error("DELETE SKILL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
