import { getAuth } from "@clerk/nextjs/server";
import { connect } from "../../../utils/db";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method not allowed" });

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  await connect();
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}
