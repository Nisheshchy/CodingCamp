const mongoose = require("mongoose");
const User = require("../models/User").default || require("../models/User");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const users = await User.find({});
  users.forEach(u => {
    console.log("User:", u.user);
    console.log("Courses:", JSON.stringify(u.courses, null, 2));
  });

  process.exit(0);
}
test();
