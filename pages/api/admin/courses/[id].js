import { connect } from "../../../../utils/db";
import Course from "../../../../models/Course";

export default async function handler(req, res) {
  if (req.cookies.admin_token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  await connect();

  const { id } = req.query; // This is the course slug

  if (req.method === "GET") {
    try {
      const course = await Course.findOne({ course: id });
      if (!course) return res.status(404).json({ msg: "Course not found" });
      return res.status(200).json(JSON.parse(JSON.stringify(course)));
    } catch (err) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }

  if (req.method === "PUT") {
    const { name, description, image, ytURL, resources, quiz, status } = req.body;

    if (!name) return res.status(400).json({ msg: "Course name is required." });
    if (ytURL && !ytURL.includes("youtube.com") && !ytURL.includes("youtu.be")) {
      return res.status(400).json({ msg: "ytURL must be a valid YouTube link." });
    }

    try {
      const updated = await Course.findOneAndUpdate(
        { course: id },
        { $set: { name, description, image, ytURL, resources, quiz, status } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ msg: "Course not found" });
      return res.status(200).json(JSON.parse(JSON.stringify(updated)));
    } catch (err) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }

  if (req.method === "PATCH") {
    // Soft-delete: toggle between published <-> archived
    const { status } = req.body;
    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value." });
    }
    try {
      const updated = await Course.findOneAndUpdate(
        { course: id },
        { $set: { status } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ msg: "Course not found" });
      return res.status(200).json(JSON.parse(JSON.stringify(updated)));
    } catch (err) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }

  res.status(405).end();
}
