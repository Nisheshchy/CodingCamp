import mongoose from "mongoose";

/**
 * @typedef {Object} Resource
 * @property {string} name - Display name of the resource link.
 * @property {string} url  - External URL of the resource.
 */

/**
 * @typedef {Object} QuizOption
 * @property {string}  answer    - Answer text.
 * @property {boolean} isCorrect - Whether this option is the correct answer.
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string}       question - Question text.
 * @property {QuizOption[]} options  - Array of answer options (min 2, max 4).
 */

/**
 * Course Mongoose schema.
 * @property {string}        course      - URL slug, used as the unique identifier (e.g. "html").
 * @property {string}        name        - Human-readable course title (e.g. "HTML").
 * @property {string}        description - Short description shown on course cards.
 * @property {string}        image       - Filename of the course icon in /public/images/ (e.g. "html.svg").
 * @property {string}        ytURL       - Full YouTube URL for the course video.
 * @property {Resource[]}    resources   - Array of supplemental resource links.
 * @property {QuizQuestion[]} quiz       - Array of quiz questions with answer options.
 * @property {string}        status      - Publication state: 'draft' | 'published' | 'archived'.
 * @property {Date}          createdAt   - Creation timestamp.
 */
const CourseSchema = new mongoose.Schema({
  course: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  ytURL: { type: String, default: "" },
  resources: { type: Array, default: [] },
  quiz: { type: Array, default: [] },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published",
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

export default Course;
