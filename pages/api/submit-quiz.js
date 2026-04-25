import { connect } from "../../utils/db";
import User from "../../models/User";
import Course from "../../models/Course";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method not allowed" });

  await connect();

  try {
    const { userId, course: courseSlug, answers } = req.body;

    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const courseDoc = await Course.findOne({ course: courseSlug });
    if (!courseDoc || !courseDoc.quiz || courseDoc.quiz.length === 0) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    let score = 0;
    courseDoc.quiz.forEach((q, i) => {
      const selectedAnswerIndex = answers[i];
      if (selectedAnswerIndex !== undefined && q.options[selectedAnswerIndex]?.isCorrect) {
        score++;
      }
    });

    const total = courseDoc.quiz.length;
    const passed = score === total;

    const user = await User.findOne({ user: userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Record score
    user.quizScores.push({ course: courseSlug, score, total, submittedAt: new Date() });

    const userCourse = user.courses.find((c) => c.course === courseSlug);
    if (userCourse) {
      if (passed) userCourse.quizPassed = true;
      if (userCourse.videoCompleted && userCourse.quizPassed) {
        userCourse.completed = true;
      }
    }

    user.markModified("courses");
    await user.save();

    return res.status(200).json({ success: true, score, passed, completed: userCourse?.completed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
}
