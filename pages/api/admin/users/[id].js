import { connect } from "../../../../utils/db";
import User from "../../../../models/User";

export default async function handler(req, res) {
  if (req.cookies.admin_token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  await connect();

  const { id } = req.query; // Clerk user ID

  if (req.method === "GET") {
    try {
      const user = await User.findOne({ user: id });
      if (!user) return res.status(404).json({ msg: "User not found" });
      return res.status(200).json(JSON.parse(JSON.stringify(user)));
    } catch (err) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }

  if (req.method === "PATCH") {
    const { role } = req.body;
    if (!["learner", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Role must be 'learner' or 'admin'." });
    }
    // Prevent admins from demoting themselves (obsolete since admin is in .env, but keeping safe check)
    // if (id === req.auth.userId && role === "learner") { ... }
    
    try {
      const updated = await User.findOneAndUpdate(
        { user: id },
        { $set: { role } },
        { new: true, upsert: true }
      );
      return res.status(200).json(JSON.parse(JSON.stringify(updated)));
    } catch (err) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }

  res.status(405).end();
}
