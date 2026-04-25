import { connect } from "../../../utils/db";
import Course from "../../../models/Course";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ msg: "Method not allowed" });
  }
  try {
    await connect();
    const count = await Course.countDocuments({ status: "published" });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ msg: "Something went wrong" });
  }
}
