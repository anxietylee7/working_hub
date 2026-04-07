export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  const adminPw = process.env.ADMIN_PASSWORD;

  if (!adminPw) return res.status(500).json({ error: "ADMIN_PASSWORD not configured" });

  if (password === adminPw) {
    return res.status(200).json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, error: "비밀번호가 틀렸습니다" });
  }
}
