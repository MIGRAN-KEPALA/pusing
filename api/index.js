// api/index.js
// GET / — health check & API info

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const supabaseConfigured = !!process.env.SUPABASE_FUNCTION_URL;

  res.status(200).json({
    name: "wowziesobf API",
    version: "1.2.0",
    status: "ok",
    supabaseConnected: supabaseConfigured,
    endpoints: {
      "POST /api/obfuscate": {
        description: "Obfuscate Lua/Luau (Roblox) script",
        body: {
          code: "string (required) — Lua source code",
          options: {
            description: "object (optional) — toggle obfuscation steps",
            freeFeatures: [
              "hexEncoding", "stringSplitting", "xorCipher",
              "antiDebug", "variableShuffle", "constantFolding", "integrityCheck"
            ],
            vipFeatures: [
              "junkCode", "advancedAntiDebug", "polymorphicEncoding",
              "customAlphabet", "multiKeyXor", "stringEncryption",
              "controlFlow", "virtualization", "antiVM", "runtimeGuard"
            ],
          },
        },
        response: {
          success: "boolean",
          obfuscated: "string",
          stats: {
            originalSize: "number (bytes)",
            obfuscatedSize: "number (bytes)",
            durationMs: "number",
            gatewayMs: "number",
          },
        },
      },
    },
  });
};
