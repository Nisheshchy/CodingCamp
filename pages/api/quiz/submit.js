import { requireAuth } from "@clerk/nextjs/api";

import { connect } from "../../../utils/db";
import User from "../../../models/User";

connect();

/**
 * POST /api/quiz/submit
 * Persists a quiz score for the authenticated user.
 * Body: { course: string, score: number, total: number }
 */
export default requireAuth(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "Method not allowed" });
  }

  const { course, score, total } = req.body;

  // Input validation
  if (!course || typeof score !== "number" || typeof total !== "number") {
    return res.status(400).json({ msg: "Invalid payload: course, score, and total are required." });
  }
  if (score < 0 || score > total) {
    return res.status(400).json({ msg: "Score must be between 0 and total." });
  }

  try {
    // Remove previous score for this course, then push the latest result
    await User.updateOne(
      { user: req.auth.userId },
      { $pull: { quizScores: { course } } }
    );

    await User.updateOne(
      { user: req.auth.userId },
      {
        $push: {
          quizScores: { course, score, total, submittedAt: new Date() },
        },
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ msg: "Something went wrong" });
  }
});
