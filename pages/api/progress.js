import { getAuth } from "@clerk/nextjs/server";
import { connect } from "../../utils/db";
import User from "../../models/User";
import Course from "../../models/Course";

export default async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).json({ msg: "Method not allowed" });

  // Clerk v4: use getAuth to read the session
  const { userId } = getAuth(req);
  if (!userId) {
    console.error("[progress] 401 - no userId from getAuth");
    return res.status(401).json({ msg: "Unauthorized" });
  }

  await connect();

  try {
    const { course: courseSlug, playedSeconds, duration } = req.body;
    if (!courseSlug || playedSeconds === undefined || !duration) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    console.log(`[progress] PUT userId=${userId} course=${courseSlug} played=${playedSeconds} duration=${duration}`);

    const user = await User.findOne({ user: userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const userCourse = user.courses.find((c) => c.course === courseSlug);
    if (!userCourse) return res.status(404).json({ msg: "Course not enrolled" });

    // Anti-hack: only allow increasing progress
    const currentProgress = userCourse.videoProgress || 0;
    if (playedSeconds > currentProgress) {
      userCourse.videoProgress = playedSeconds;
    }

    // Check video completion (95% threshold)
    const percentage = playedSeconds / duration;
    if (percentage >= 0.95) {
      userCourse.videoCompleted = true;
    }

    // Check full course completion
    const courseDoc = await Course.findOne({ course: courseSlug });
    const needsQuiz = courseDoc && courseDoc.quiz && courseDoc.quiz.length > 0;

    // If no quiz is required, quizPassed defaults to true
    if (!needsQuiz) {
      userCourse.quizPassed = true;
    }

    if (userCourse.videoCompleted && userCourse.quizPassed) {
      userCourse.completed = true;
    }

    console.log("[progress] Saving:", {
      videoCompleted: userCourse.videoCompleted,
      quizPassed: userCourse.quizPassed,
      completed: userCourse.completed,
      percentage: percentage.toFixed(2),
    });

    user.markModified("courses");
    await user.save();

    return res.status(200).json({
      success: true,
      progress: userCourse.videoProgress,
      completed: userCourse.completed,
    });

  } catch (err) {
    console.error("[progress] error:", err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
}
