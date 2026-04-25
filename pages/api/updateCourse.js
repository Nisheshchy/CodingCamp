import { getAuth } from "@clerk/nextjs/server";
import { connect } from "../../utils/db";
import User from "../../models/User";

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  await connect();
  try {
    const course = await User.updateOne(
      {
        user: userId,
        "courses.course": req.body.course,
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
