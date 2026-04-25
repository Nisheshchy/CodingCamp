import { requireAuth } from "@clerk/nextjs/api";
import { connect } from "../../utils/db";
import User from "../../models/User";
import Course from "../../models/Course";

export default requireAuth(async (req, res) => {
  if (req.method !== "PUT") return res.status(405).json({ msg: "Method not allowed" });
  await connect();

  try {
    const { course: courseSlug, playedSeconds, duration } = req.body;
    if (!courseSlug || playedSeconds === undefined || !duration) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const user = await User.findOne({ user: req.auth.userId });
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

    user.markModified("courses"); // FORCE MONGOOSE TO SAVE THE ARRAY CHANGES
    await user.save();
    return res.status(200).json({ 
      success: true, 
      progress: userCourse.videoProgress, 
      completed: userCourse.completed 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
});
