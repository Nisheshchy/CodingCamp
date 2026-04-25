const mongoose = require("mongoose");
const User = require("../models/User").default || require("../models/User");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Pick first user
  const user = await User.findOne({});
  if (!user) return console.log("No user found");
  
  if (user.courses.length === 0) {
    user.courses.push({ course: "hrml", videoProgress: 0 });
    await user.save();
  }

  const userCourse = user.courses[0];
  userCourse.videoCompleted = true;
  userCourse.quizPassed = true;
  userCourse.completed = true;
  
  user.markModified("courses");
  await user.save();

  const userAfter = await User.findOne({ _id: user._id });
  console.log("After save:", userAfter.courses[0].completed);

  process.exit(0);
}
test();
