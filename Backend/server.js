require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");


const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);

app.use("/api/sessions", sessionRoutes);

console.log("MONGO URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:");
    console.log(err.message);
  });

app.get("/", (req, res) => {
  res.json({
    message: "SkillForge API Running",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});