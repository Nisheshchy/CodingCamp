const mongoose = require("mongoose");
const Course = require("../models/Course").default || require("../models/Course");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find({});
  courses.forEach(c => {
    console.log(`Course: ${c.course}, Quiz: ${c.quiz ? c.quiz.length : 0} questions`);
  });
  process.exit(0);
}
test();
