import { connect } from "../../utils/db";
import User from "../../models/User";

export default async function handler(req, res) {
  const { userId, course, completed } = req.body;
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  await connect();
  try {
    const updated = await User.updateOne(
      {
        user: userId,
        "courses.course": course,
      },
      {
        $set: {
          "courses.$.completed": req.body.completed,
        },
      }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}
