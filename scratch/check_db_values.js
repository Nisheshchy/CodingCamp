const mongoose = require("mongoose");
const User = require("../models/User").default || require("../models/User");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  users.forEach(u => {
    console.log("User:", u.user);
    u.courses.forEach(c => console.log(`  Course: ${c.course}, completed: ${c.completed}, video: ${c.videoCompleted}, quiz: ${c.quizPassed}`));
  });
  process.exit(0);
}
check();
