export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Set a secure HTTP-only cookie valid for 7 days
    res.setHeader(
      "Set-Cookie",
      `admin_token=${process.env.ADMIN_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ msg: "Invalid username or password" });
}
