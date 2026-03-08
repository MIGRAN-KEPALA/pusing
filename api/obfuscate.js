// api/obfuscate.js
// POST /api/obfuscate
// Vercel proxy → Supabase Edge Function

const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
const SUPABASE_ANON_KEY     = process.env.SUPABASE_ANON_KEY;

module.exports = async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // ── Validate env ──────────────────────────────────────
  if (!SUPABASE_FUNCTION_URL) {
    return res.status(500).json({
      success: false,
      error: "Server misconfigured: SUPABASE_FUNCTION_URL not set",
    });
  }

  // ── Parse body ────────────────────────────────────────
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ success: false, error: "Invalid JSON" }); }
  }

  const { code, options = {} } = body || {};

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ success: false, error: "Missing 'code' field" });
  }

  if (code.length > 300_000) {
    return res.status(413).json({ success: false, error: "Code too large (max 300KB)" });
  }

  // ── Forward ke Supabase Edge Function ─────────────────
  const start = Date.now();
  try {
    const headers = { "Content-Type": "application/json" };
    if (SUPABASE_ANON_KEY) headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;

    const upstream = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ code, options }),
    });

    const data = await upstream.json();

    // Tambahkan gateway timing ke stats
    if (data.stats) data.stats.gatewayMs = Date.now() - start;

    return res.status(upstream.status).json(data);

  } catch (err) {
    console.error("[obfuscate] upstream error:", err.message);
    return res.status(502).json({
      success: false,
      error: "Failed to reach obfuscation service: " + err.message,
    });
  }
};
