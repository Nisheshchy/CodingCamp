import { connect } from "../../../../utils/db";
import User from "../../../../models/User";

export default async function handler(req, res) {
  if (req.cookies.admin_token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  await connect();

  const { page = 1, limit = 50, role = "" } = req.query;
  const query = {};
  if (role) query.role = role;

  try {
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit))
        .select("user role courses quizScores createdAt"),
      User.countDocuments(query),
    ]);

    const formatted = users.map((u) => ({
      clerkId: u.user,
      role: u.role,
      coursesStarted: u.courses.length,
      coursesCompleted: u.courses.filter((c) => c.completed).length,
      quizzesTaken: u.quizScores?.length || 0,
      joinedAt: u.createdAt,
    }));

    res.status(200).json({
      users: JSON.parse(JSON.stringify(formatted)),
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}
