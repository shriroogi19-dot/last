export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (process.env.ACCESS_CODE && req.headers["x-access-code"] !== process.env.ACCESS_CODE) {
    return res.status(401).json({ ok: false, error: "Invalid access code" });
  }

  const topic = process.env.NTFY_TOPIC;
  if (!topic) return res.status(503).json({ ok: false, error: "NTFY_TOPIC is not configured" });

  try {
    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "Alcohol detection alert";
    const priority = Number(body.priority) >= 1 && Number(body.priority) <= 5 ? Number(body.priority) : 5;
    if (!message || message.length > 1000) {
      return res.status(400).json({ ok: false, error: "Message must be 1 to 1000 characters" });
    }

    const upstream = await fetch("https://ntfy.sh/" + encodeURIComponent(topic), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Title": title,
        "Priority": String(priority),
        "Tags": "warning,car"
      },
      body: message
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("ntfy rejected request:", upstream.status, detail);
      return res.status(502).json({ ok: false, error: "ntfy rejected notification (HTTP " + upstream.status + ")" });
    }

    const result = await upstream.json().catch(() => ({}));
    return res.status(200).json({ ok: true, provider: "ntfy", id: result.id || null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Unable to send notification" });
  }
}
