export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!process.env.NTFY_TOPIC) {
    return res.status(503).json({ ok: false, error: "Set NTFY_TOPIC in Vercel environment variables" });
  }
  return res.status(200).json({ ok: true, provider: "ntfy" });
}
