import mongoose from "mongoose";

/**
 * @typedef {Object} CourseProgress
 * @property {string}  course    - Course slug (e.g. "html").
 * @property {boolean} completed - Whether the user has completed the course.
 */

/**
 * @typedef {Object} QuizScore
 * @property {string} course      - Course slug the quiz belongs to.
 * @property {number} score       - Number of correct answers.
 * @property {number} total       - Total number of questions.
 * @property {Date}   submittedAt - When the quiz was submitted.
 */

/**
 * User Mongoose schema.
 * @property {string}          user       - Clerk user ID (external identity reference).
 * @property {CourseProgress[]} courses   - Array of course progress objects.
 * @property {QuizScore[]}     quizScores - Array of quiz submission records.
 * @property {string}          role       - Access role: 'learner' | 'admin'.
 * @property {Date}            createdAt  - Account creation timestamp.
 */
const UserSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true, index: true },
  courses: { type: Array, default: [] },
  quizScores: {
    type: [
      {
        course: String,
        score: Number,
        total: Number,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  role: {
    type: String,
    enum: ["learner", "admin"],
    default: "learner",
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
