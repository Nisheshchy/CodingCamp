import { requireAuth } from "@clerk/nextjs/api";
import { connect } from "../../utils/db";
import User from "../../models/User";
import Course from "../../models/Course";

export default requireAuth(async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method not allowed" });
  await connect();

  try {
    const { course: courseSlug, answers } = req.body; // answers is array of indices

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
    const passed = score === total; // Require 100% for this platform (or adjust threshold)

    const user = await User.findOne({ user: req.auth.userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Record score
    user.quizScores.push({
      course: courseSlug,
      score,
      total,
      submittedAt: new Date()
    });

    const userCourse = user.courses.find((c) => c.course === courseSlug);
    if (userCourse) {
      if (passed) {
        userCourse.quizPassed = true;
      }
      
      // Re-evaluate total completion
      if (userCourse.videoCompleted && userCourse.quizPassed) {
        userCourse.completed = true;
      }
    }

    user.markModified("courses"); // FORCE MONGOOSE TO SAVE THE ARRAY CHANGES
    await user.save();
    return res.status(200).json({ success: true, score, passed, completed: userCourse?.completed });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
});
