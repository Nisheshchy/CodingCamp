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
    const [courses, allUsers] = await Promise.all([
      Course.find({ status: "published" }).select("course name"),
      User.find({}, "courses quizScores"),
    ]);

    const publishedCount = courses.length;

    const analytics = courses.map((course) => {
      const slug = course.course;

      let starts = 0;
      let completions = 0;
      const scores = [];

      for (const u of allUsers) {
        const progress = u.courses.find((c) => c.course === slug);
        if (progress) {
          starts++;
          if (progress.completed) completions++;
        }
        const quizRecord = u.quizScores?.find((q) => q.course === slug);
        if (quizRecord) {
          scores.push((quizRecord.score / quizRecord.total) * 100);
        }
      }

      const completionRate = starts > 0 ? Math.round((completions / starts) * 100) : 0;
      const avgQuizScore =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : null;

      return {
        slug,
        name: course.name,
        starts,
        completions,
        completionRate,
        avgQuizScore,
        quizSubmissions: scores.length,
      };
    });

    // Certificates issued = users who completed ALL published courses
    let certificatesIssued = 0;
    for (const u of allUsers) {
      const completedCount = u.courses.filter((c) => c.completed).length;
      if (publishedCount > 0 && completedCount >= publishedCount) certificatesIssued++;
    }

    res.status(200).json({
      analytics,
      certificatesIssued,
      publishedCourses: publishedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}
