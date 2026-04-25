export default function handler(req, res) {
  // Clear the cookie by setting Max-Age to 0
  res.setHeader(
    "Set-Cookie",
    `admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
  return res.status(200).json({ success: true });
}
