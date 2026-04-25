import { connect } from "../../../../utils/db";
import Course from "../../../../models/Course";

export default async function handler(req, res) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.cookies.admin_token !== secret) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  await connect();

  if (req.method === "GET") {
    const { page = 1, limit = 20, search = "", status = "" } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (status) query.status = status;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-quiz -resources"),
      Course.countDocuments(query),
    ]);

    return res.status(200).json({
      courses: JSON.parse(JSON.stringify(courses)),
      total,
      pages: Math.ceil(total / limit),
    });
  }

  if (req.method === "POST") {
    const { name, course, description, image, ytURL, resources, quiz, status } = req.body;

    // Validation
    if (!name || !course) {
      return res.status(400).json({ msg: "name and course slug are required." });
    }
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(course)) {
      return res.status(400).json({ msg: "Slug must be lowercase alphanumeric with hyphens only." });
    }
    if (ytURL && !ytURL.includes("youtube.com") && !ytURL.includes("youtu.be")) {
      return res.status(400).json({ msg: "ytURL must be a valid YouTube link." });
    }

    try {
      const existing = await Course.findOne({ course });
      if (existing) {
        return res.status(409).json({ msg: "A course with this slug already exists." });
      }
      const newCourse = await Course.create({
        name, course, description, image: image || `${course}.svg`,
        ytURL, resources: resources || [], quiz: quiz || [],
        status: status || "draft",
      });
      return res.status(201).json(JSON.parse(JSON.stringify(newCourse)));
    } catch (err) {
      console.error("[POST /api/admin/courses]", err);
      return res.status(500).json({ msg: err.message || "Something went wrong" });
    }
  }

  res.status(405).end();
}
