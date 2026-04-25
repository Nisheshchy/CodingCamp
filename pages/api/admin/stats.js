import { connect } from "../../../utils/db";
import User from "../../../models/User";
import Course from "../../../models/Course";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  if (req.cookies.admin_token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  await connect();

  try {
    const [
      totalCourses,
      publishedCourses,
      totalUsers,
      allUsers,
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      User.countDocuments({ role: "learner" }),
      User.find({}, "courses"),
    ]);

    // Count completions and active learners
    let totalCompletions = 0;
    let activeLearners = 0;
    let certificatesIssued = 0;

    for (const u of allUsers) {
      const completed = u.courses.filter((c) => c.completed === true).length;
      totalCompletions += completed;
      if (u.courses.length > 0) activeLearners++;
      if (publishedCourses > 0 && completed >= publishedCourses) certificatesIssued++;
    }

    // Recent completions (last 5 users who completed any course)
    const recentCompletions = await User.find({
      "courses.completed": true,
    })
      .sort({ _id: -1 })
      .limit(5)
      .select("user courses");

    res.status(200).json({
      totalCourses,
      publishedCourses,
      totalUsers,
      activeLearners,
      totalCompletions,
      certificatesIssued,
      recentCompletions: JSON.parse(JSON.stringify(recentCompletions)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}
