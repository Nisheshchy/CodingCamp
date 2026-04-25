import { getAuth } from "@clerk/nextjs/server";
import { connect } from "../../../utils/db";
import User from "../../../models/User";

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  await connect();
  switch (req.method) {
    case "GET": {
      try {
        const user = await User.find({ user: req.query.id });
        res.status(200).json(user);
      } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Something went wrong" });
      }
      break;
    }
    case "PUT": {
      try {
        const { course, completed } = req.body;
        const user = await User.findOne({ user: req.query.id });
        if (user && !user.courses.some((c) => c.course === course)) {
          user.courses.push({ course, completed });
          await user.save();
        }
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ msg: "Something went wrong" });
      }
      break;
    }
    default:
      res.status(200).json({});
  }
}
