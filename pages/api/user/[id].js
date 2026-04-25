import { connect } from "../../../utils/db";
import User from "../../../models/User";

export default async function handler(req, res) {
  const userId = req.query.id;
  if (!userId) return res.status(400).json({ msg: "Missing user id" });

  await connect();
  switch (req.method) {
    case "GET": {
      try {
        const user = await User.find({ user: userId });
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
        const user = await User.findOne({ user: userId });
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
