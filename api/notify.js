export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  // Check access code
  if (
    process.env.ACCESS_CODE &&
    req.headers["x-access-code"] !== process.env.ACCESS_CODE
  ) {
    return res.status(401).json({
      ok: false,
      error: "Invalid access code"
    });
  }

  // Get topic from Vercel environment variables
  const topic = process.env.NTFY_TOPIC;

  if (!topic) {
    return res.status(503).json({
      ok: false,
      error: "NTFY_TOPIC is missing in Vercel"
    });
  }

  try {
    const { message, title, priority } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Message is required"
      });
    }

    const response = await fetch(
      "https://ntfy.sh/" + encodeURIComponent(topic),
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Title": title || "Alcohol Detection Alert",
          "Priority": String(priority || 5)
        },
        body: message
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({
        ok: false,
        error: "ntfy error: " + errorText
      });
    }

    return res.status(200).json({
      ok: true,
      provider: "ntfy"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
